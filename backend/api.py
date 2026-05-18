import os
import urllib.request
import json
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
from dotenv import load_dotenv
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Metric,
    RunReportRequest,
)
from google.oauth2.credentials import Credentials
from backend.database import save_contact, get_all_contacts, get_contacts_by_segment, get_contact_by_email

load_dotenv()

PROPERTY_ID = os.getenv("GA4_PROPERTY_ID")
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOKEN_FILE = os.path.join(ROOT_DIR, "token.json")

# Dynamically recreate token.json from the env variable on Render/prod if available
TOKEN_JSON_CONTENT = os.getenv("TOKEN_JSON")
if TOKEN_JSON_CONTENT:
    with open(TOKEN_FILE, "w") as f:
        f.write(TOKEN_JSON_CONTENT)

# --- SendGrid Email Helper ---
def send_email(to_email: str, subject: str, html_content: str):
    api_key = os.getenv("SENDGRID_API_KEY")
    from_email = os.getenv("SENDGRID_FROM_EMAIL")
    
    if not api_key or not from_email:
        print("SendGrid Email Warning: SENDGRID_API_KEY or SENDGRID_FROM_EMAIL is not set. Email skipped.")
        return False
        
    url = "https://api.sendgrid.com/v3/mail/send"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    data = {
        "personalizations": [
            {
                "to": [{"email": to_email}],
                "subject": subject
            }
        ],
        "from": {"email": from_email, "name": "Sphere Global"},
        "content": [
            {
                "type": "text/html",
                "value": html_content
            }
        ]
    }
    
    try:
        req = urllib.request.Request(
            url, 
            data=json.dumps(data).encode("utf-8"), 
            headers=headers, 
            method="POST"
        )
        with urllib.request.urlopen(req) as response:
            if response.status in (200, 201, 202):
                print(f"Email sent successfully to {to_email}")
                return True
            else:
                print(f"SendGrid returned status code: {response.status}")
                return False
    except Exception as e:
        print(f"Error sending email via SendGrid: {str(e)}")
        return False

app = FastAPI(title="AI Analytics Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class ContactForm(BaseModel):
    full_name: str
    email: str
    company: Optional[str] = None
    phone: Optional[str] = None
    message: str

# --- GA4 helpers ---
def get_ga_client():
    if not os.path.exists(TOKEN_FILE):
        raise FileNotFoundError("token.json not found!")
    creds = Credentials.from_authorized_user_file(TOKEN_FILE, ['https://www.googleapis.com/auth/analytics.readonly'])
    return BetaAnalyticsDataClient(credentials=creds)

# --- GA4 Endpoints ---
@app.get("/api/traffic")
def get_website_traffic(start_date: str = "7daysAgo", end_date: str = "today"):
    if not PROPERTY_ID or PROPERTY_ID == "YOUR_PROPERTY_ID_HERE":
        return {"error": "GA4_PROPERTY_ID environment variable is missing or invalid."}
    client = get_ga_client()
    request = RunReportRequest(
        property=f"properties/{PROPERTY_ID}",
        dimensions=[Dimension(name="date"), Dimension(name="hostName")],
        metrics=[
            Metric(name="activeUsers"),
            Metric(name="sessions"),
            Metric(name="screenPageViews"),
            Metric(name="bounceRate"),
            Metric(name="averageSessionDuration")
        ],
        date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
    )
    try:
        response = client.run_report(request)
        daily_dict = {}
        total_users = 0
        total_sessions = 0
        total_views = 0
        total_bounce = 0
        total_duration = 0

        if not response.rows:
            return {"totals": {"users": 0, "sessions": 0, "pageviews": 0, "bounceRate": "0%", "avgSession": "0s"}, "daily": []}

        for row in response.rows:
            date = row.dimension_values[0].value
            host = row.dimension_values[1].value.lower()
            
            # Skip any tracking traffic that came from the dashboard itself
            if "ai-analytics-frontend" in host or "sphere-global-dashboard" in host:
                continue

            users = int(row.metric_values[0].value)
            sessions = int(row.metric_values[1].value)
            views = int(row.metric_values[2].value)
            bounce = float(row.metric_values[3].value)
            duration = float(row.metric_values[4].value)
            
            total_users += users
            total_sessions += sessions
            total_views += views
            total_bounce += bounce
            total_duration += duration

            formatted_date = f"{date[4:6]}/{date[6:8]}"
            if date not in daily_dict:
                daily_dict[date] = {"date_raw": date, "name": formatted_date, "users": 0, "sessions": 0}
            daily_dict[date]["users"] += users
            daily_dict[date]["sessions"] += sessions

        daily_data = list(daily_dict.values())
        num_days = len(daily_data)
        avg_bounce = round(total_bounce / num_days * 100, 1) if num_days > 0 else 0
        avg_dur_seconds = int(total_duration / num_days) if num_days > 0 else 0
        mins, secs = divmod(avg_dur_seconds, 60)
        daily_data.sort(key=lambda x: x["date_raw"])
        for item in daily_data:
            del item["date_raw"]

        return {
            "totals": {
                "users": f"{total_users:,}",
                "sessions": f"{total_sessions:,}",
                "pageviews": f"{total_views:,}",
                "bounceRate": f"{avg_bounce}%",
                "avgSession": f"{mins}m {secs}s"
            },
            "daily": daily_data
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/contact")
def submit_contact(form: ContactForm, background_tasks: BackgroundTasks):
    try:
        result = save_contact(
            full_name=form.full_name,
            email=form.email,
            company=form.company,
            phone=form.phone,
            message=form.message,
        )
        
        # 1. Trigger Customer Auto-Responder Email
        customer_subject = "Your Demo with Sphere Global is Confirmed! 🚀"
        customer_html = f"""
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; color: #1a202c; line-height: 1.6; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
            <div style="text-align: center; border-bottom: 1px solid #edf2f7; padding-bottom: 24px; margin-bottom: 28px;">
                <h1 style="color: #4f46e5; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Sphere Global</h1>
                <p style="font-size: 14px; color: #718096; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Intelligent Customer & Traffic Analytics</p>
            </div>
            <p style="font-size: 16px; margin-bottom: 16px;">Hi <strong>{form.full_name}</strong>,</p>
            <p style="font-size: 15px; color: #4a5568; margin-bottom: 24px;">Thank you for requesting a live product demonstration of Sphere Global! We have successfully captured your details, and our engineering specialist is configuring a personalized test workspace custom-tailored for your organization.</p>
            
            <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-radius: 12px; padding: 20px; margin: 28px 0; border-left: 4px solid #4f46e5;">
                <h4 style="margin: 0 0 12px 0; color: #2d3748; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">Your Details:</h4>
                <p style="margin: 6px 0; font-size: 14px; color: #4a5568;"><strong>Company:</strong> {form.company or 'N/A'}</p>
                <p style="margin: 6px 0; font-size: 14px; color: #4a5568;"><strong>Phone:</strong> {form.phone or 'N/A'}</p>
                <p style="margin: 6px 0; font-size: 14px; color: #4a5568;"><strong>Assigned Segment:</strong> <span style="background-color: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 600;">{result["segment"]}</span></p>
            </div>

            <p style="font-size: 15px; color: #4a5568;">Our team will reach out to you at this email address within 24 hours to coordinate a convenient live video demonstration.</p>
            <p style="font-size: 15px; color: #4a5568; margin-top: 16px;">We look forward to speaking with you!</p>
            
            <p style="margin-top: 40px; border-top: 1px solid #edf2f7; padding-top: 20px; font-size: 12px; color: #a0aec0; text-align: center;">
                &copy; 2026 Sphere Global. All rights reserved. <br/>
                This is an automated operational response from our customer acquisition system.
            </p>
        </div>
        """
        background_tasks.add_task(send_email, form.email, customer_subject, customer_html)

        # 2. Trigger Internal Sales Notification Email
        admin_email = os.getenv("SENDGRID_TO_EMAIL") or os.getenv("SENDGRID_FROM_EMAIL")
        if admin_email:
            admin_subject = f"🚨 [NEW LEAD] {form.full_name} ({result['segment']})"
            admin_html = f"""
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; color: #1a202c; line-height: 1.6; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; background-color: #f8fafc;">
                <h2 style="color: #dc2626; margin: 0 0 16px 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">🚨 New CRM Lead Captured</h2>
                <p style="font-size: 15px; color: #4a5568; margin-bottom: 24px;">A visitor has completed a Book a Demo form submission on the Sphere Global target website. The lead has been segmented automatically by your SQLite database:</p>
                
                <div style="background-color: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0; margin-bottom: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                    <h3 style="margin-top: 0; margin-bottom: 16px; color: #1a202c; font-size: 16px; border-bottom: 2px solid #edf2f7; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Lead Card Profile</h3>
                    <p style="margin: 8px 0; font-size: 14px;"><strong>Name:</strong> {form.full_name}</p>
                    <p style="margin: 8px 0; font-size: 14px;"><strong>Email:</strong> {form.email}</p>
                    <p style="margin: 8px 0; font-size: 14px;"><strong>Company:</strong> {form.company or 'N/A'}</p>
                    <p style="margin: 8px 0; font-size: 14px;"><strong>Phone:</strong> {form.phone or 'N/A'}</p>
                    <p style="margin: 8px 0; font-size: 14px;"><strong>Assigned Segment:</strong> <span style="background-color: #ecfdf5; color: #047857; padding: 4px 8px; border-radius: 999px; font-size: 12px; font-weight: 700;">{result["segment"]}</span></p>
                </div>

                <div style="background-color: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0; margin-bottom: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                    <h4 style="margin: 0 0 10px 0; color: #4a5568; font-size: 14px; text-transform: uppercase;">Lead Message:</h4>
                    <p style="margin: 0; font-style: italic; color: #4a5568; font-size: 14px; line-height: 1.5;">"{form.message}"</p>
                </div>

                <div style="text-align: center;">
                    <a href="https://ai-analytics-frontend-y0vi.onrender.com/admin" style="display: inline-block; padding: 14px 28px; background-color: #4f46e5; color: #ffffff; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">Open CRM Admin Dashboard</a>
                </div>
            </div>
            """
            background_tasks.add_task(send_email, admin_email, admin_subject, admin_html)

        return {
            "success": True,
            "message": "Thank you! We'll be in touch soon.",
            "segment": result["segment"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/contacts")
def list_contacts(segment: Optional[str] = None):
    try:
        if segment:
            contacts = get_contacts_by_segment(segment)
        else:
            contacts = get_all_contacts()
        return {"count": len(contacts), "contacts": contacts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/contacts/{email}")
def contact_journey(email: str):
    try:
        contacts = get_contact_by_email(email)
        if not contacts:
            raise HTTPException(status_code=404, detail="Contact not found")
        return {"email": email, "history": contacts}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
