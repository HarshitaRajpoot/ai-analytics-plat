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

# Load environment variables
load_dotenv()

PROPERTY_ID = os.getenv("GA4_PROPERTY_ID")
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOKEN_FILE = os.path.join(ROOT_DIR, "token.json")

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
        dimensions=[Dimension(name="date")],
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
        
        for row in response.rows:
            date = row.dimension_values[0].value
            # Format date to YYYY-MM-DD
            formatted_date = f"{date[:4]}-{date[4:6]}-{date[6:8]}"
            users = int(row.metric_values[0].value)
            sessions = int(row.metric_values[1].value)
            views = int(row.metric_values[2].value)
            
            total_users += users
            total_sessions += sessions
            
            result += f"{formatted_date} | {users} | {sessions} | {views}\n"
            
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

if __name__ == "__main__":
    mcp.run()
