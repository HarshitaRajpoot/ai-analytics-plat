import os
from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Metric,
    RunReportRequest,
)
from google.oauth2.credentials import Credentials
from backend.database import get_all_contacts, get_contacts_by_segment, get_contact_by_email

# Load environment variables
load_dotenv()

PROPERTY_ID = os.getenv("GA4_PROPERTY_ID")
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOKEN_FILE = os.path.join(ROOT_DIR, "token.json")

# Dynamically recreate token.json from the env variable on startup if available
TOKEN_JSON_CONTENT = os.getenv("TOKEN_JSON")
if TOKEN_JSON_CONTENT:
    with open(TOKEN_FILE, "w") as f:
        f.write(TOKEN_JSON_CONTENT)

# Initialize the MCP Server
mcp = FastMCP("GA4 Analytics Server")

def get_ga_client():
    if not os.path.exists(TOKEN_FILE):
        raise FileNotFoundError("token.json not found! Please run auth_setup.py first.")
    
    # Load credentials directly from our OAuth bypass token!
    creds = Credentials.from_authorized_user_file(TOKEN_FILE, ['https://www.googleapis.com/auth/analytics.readonly'])
    return BetaAnalyticsDataClient(credentials=creds)

@mcp.tool()
def get_website_traffic(start_date: str = "7daysAgo", end_date: str = "today") -> str:
    """
    Fetches high-level traffic metrics (active users, sessions, page views) from Google Analytics 4.
    Args:
        start_date: Start date for the report (e.g. '7daysAgo', '30daysAgo', '2023-01-01')
        end_date: End date for the report (e.g. 'today', 'yesterday', '2023-01-31')
    """
    if not PROPERTY_ID or PROPERTY_ID == "YOUR_PROPERTY_ID_HERE":
        return "Error: GA4_PROPERTY_ID environment variable is missing or invalid."
        
    client = get_ga_client()
    request = RunReportRequest(
        property=f"properties/{PROPERTY_ID}",
        dimensions=[Dimension(name="date"), Dimension(name="hostName")],
        metrics=[
            Metric(name="activeUsers"),
            Metric(name="sessions"),
            Metric(name="screenPageViews")
        ],
        date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
    )

    try:
        response = client.run_report(request)
        
        if not response.rows:
            return "No data found for the given date range."

        result = f"Traffic Data ({start_date} to {end_date}):\n\n"
        result += "Date | Active Users | Sessions | Page Views\n"
        result += "-" * 50 + "\n"
        
        total_users = 0
        total_sessions = 0
        
        # Group by date to aggregate rows from multiple valid hostnames
        daily_dict = {}
        
        for row in response.rows:
            date = row.dimension_values[0].value
            host = row.dimension_values[1].value.lower()
            
            # Skip any tracking traffic that came from the dashboard itself
            if "ai-analytics-frontend" in host or "sphere-global-dashboard" in host:
                continue

            users = int(row.metric_values[0].value)
            sessions = int(row.metric_values[1].value)
            views = int(row.metric_values[2].value)
            
            total_users += users
            total_sessions += sessions
            
            formatted_date = f"{date[:4]}-{date[4:6]}-{date[6:8]}"
            if formatted_date not in daily_dict:
                daily_dict[formatted_date] = {"users": 0, "sessions": 0, "views": 0}
            daily_dict[formatted_date]["users"] += users
            daily_dict[formatted_date]["sessions"] += sessions
            daily_dict[formatted_date]["views"] += views

        # Append aggregated results
        for f_date, metrics in sorted(daily_dict.items()):
            result += f"{f_date} | {metrics['users']} | {metrics['sessions']} | {metrics['views']}\n"
            
        result += "-" * 50 + "\n"
        result += f"Totals: {total_users} Users, {total_sessions} Sessions\n"
        return result
    except Exception as e:
        return f"Error fetching GA4 data: {str(e)}"

@mcp.tool()
def get_traffic_sources(start_date: str = "30daysAgo", end_date: str = "today") -> str:
    """
    Fetches the top traffic sources (e.g., Organic Search, Direct, Referral) from Google Analytics 4.
    Args:
        start_date: Start date for the report (e.g. '7daysAgo', '30daysAgo')
        end_date: End date for the report (e.g. 'today')
    """
    if not PROPERTY_ID or PROPERTY_ID == "YOUR_PROPERTY_ID_HERE":
        return "Error: GA4_PROPERTY_ID environment variable is missing."
        
    client = get_ga_client()
    request = RunReportRequest(
        property=f"properties/{PROPERTY_ID}",
        dimensions=[Dimension(name="sessionSourceMedium")],
        metrics=[Metric(name="sessions")],
        date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
    )

    try:
        response = client.run_report(request)
        if not response.rows:
            return "No traffic source data found."

        result = f"Top Traffic Sources ({start_date} to {end_date}):\n\n"
        for row in response.rows[:10]: # Top 10 sources
            source = row.dimension_values[0].value
            sessions = row.metric_values[0].value
            result += f"- {source}: {sessions} sessions\n"
            
        return result
    except Exception as e:
        return f"Error fetching GA4 data: {str(e)}"

@mcp.tool()
def get_crm_leads() -> str:
    """
    Fetches all CRM lead contacts that have submitted a contact/demo request form on the target website.
    """
    try:
        contacts = get_all_contacts()
        if not contacts:
            return "No contacts or leads found in the CRM database."
        
        result = "CRM Leads:\n"
        result += "Name | Email | Company | Phone | Segment | Submitted At\n"
        result += "-" * 80 + "\n"
        for c in contacts:
            result += f"{c['full_name']} | {c['email']} | {c['company'] or 'N/A'} | {c['phone'] or 'N/A'} | {c['segment']} | {c['created_at']}\n"
        return result
    except Exception as e:
        return f"Error retrieving CRM leads: {str(e)}"

@mcp.tool()
def get_audience_segment(segment_name: str) -> str:
    """
    Filters CRM leads by their assigned audience segment (e.g. 'High-Value Lead', 'Business Lead', 'Warm Lead', 'New Subscriber').
    """
    try:
        contacts = get_contacts_by_segment(segment_name)
        if not contacts:
            return f"No leads found in segment: '{segment_name}'"
        
        result = f"Segment: {segment_name}\n"
        result += "Name | Email | Company | Phone | Submitted At\n"
        result += "-" * 70 + "\n"
        for c in contacts:
            result += f"{c['full_name']} | {c['email']} | {c['company'] or 'N/A'} | {c['phone'] or 'N/A'} | {c['created_at']}\n"
        return result
    except Exception as e:
        return f"Error filtering segment: {str(e)}"

@mcp.tool()
def get_customer_journey(email: str) -> str:
    """
    Retrieves the complete journey/timeline of submissions for a given user email address.
    """
    try:
        contacts = get_contact_by_email(email)
        if not contacts:
            return f"No submission history found for email: {email}"
        
        result = f"Customer Journey for {email} ({len(contacts)} event(s)):\n\n"
        for idx, c in enumerate(contacts, 1):
            result += f"Event #{idx} - {c['created_at']}\n"
            result += f"  Name: {c['full_name']}\n"
            result += f"  Company: {c['company'] or 'N/A'} | Phone: {c['phone'] or 'N/A'}\n"
            result += f"  Segment Assigned: {c['segment']}\n"
            result += f"  Message: \"{c['message']}\"\n\n"
        return result
    except Exception as e:
        return f"Error retrieving customer journey: {str(e)}"

if __name__ == "__main__":
    mcp.run()

