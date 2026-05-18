import os
from fastapi import FastAPI, HTTPException
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
        dimensions=[Dimension(name="date")],
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
        daily_data = []
        total_users = 0
        total_sessions = 0
        total_views = 0
        total_bounce = 0
        total_duration = 0

        if not response.rows:
            return {"totals": {"users": 0, "sessions": 0, "pageviews": 0, "bounceRate": "0%", "avgSession": "0s"}, "daily": []}

        for row in response.rows:
            date = row.dimension_values[0].value
            formatted_date = f"{date[4:6]}/{date[6:8]}"
            users = int(row.metric_values[0].value)
            sessions = int(row.metric_values[1].value)
            views = int(row.metric_values[2].value)
            bounce = float(row.metric_values[3].value)
            duration = float(row.metric_values[4].value)
            daily_data.append({"date_raw": date, "name": formatted_date, "users": users, "sessions": sessions})
            total_users += users
            total_sessions += sessions
            total_views += views
            total_bounce += bounce
            total_duration += duration

        num_days = len(response.rows)
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

# --- Contact / CRM Endpoints ---
@app.post("/api/contact")
def submit_contact(form: ContactForm):
    try:
        result = save_contact(
            full_name=form.full_name,
            email=form.email,
            company=form.company,
            phone=form.phone,
            message=form.message,
        )
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
