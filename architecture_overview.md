# Sphere Global - Full System Architecture Overview

This document describes the full-stack architecture of the **Sphere Global** AI Analytics & CRM Platform. The system integrates real-time user tracking, direct database lead storage, automated intent-based audience segmentation, Google Analytics 4 API reporting, and Claude MCP server hooks for natural language AI auditing.

---

## 1. System Topology Diagram

The following architecture diagram represents the flow of data across the client-side browsers, Google Analytics servers, the SQLite database, the live Render web backend, and the Claude MCP server:

```mermaid
graph TD
    subgraph Client Browsers
        W["Sphere Global Landing Page (HTML5/CSS3)"]
        D["React Dashboard (Vite/TS)"]
    end

    subgraph Google Cloud & Analytics
        GA["Google Analytics 4 (GA4)"]
    end

    subgraph Backend Server (Render Web Service)
        API["FastAPI Backend (Uvicorn)"]
        DB[("SQLite Database (contacts.db)")]
    end

    subgraph Claude Desktop AI
        Claude["Claude Desktop / LLM"]
        MCP["FastMCP Server (mcp_server.py)"]
    end

    %% Client Tracking Flows
    W -- "1. Sends clicks/scrolls (G-M284E83HG1)" --> GA
    W -- "2. Submits Lead Form (POST /api/contact)" --> API

    %% Dashboard Fetching Flows
    D -- "3. Requests traffic/leads (GET /api/traffic)" --> API
    API -- "4. Queries GA4 Data API (OAuth bypass)" --> GA
    API -- "5. Reads/Writes Leads" --> DB

    %% MCP/Claude AI Flows
    Claude -- "6. Ask questions in plain English" --> MCP
    MCP -- "7. Fetches DB leads / GA4 reports" --> API
    API --> DB
    API --> GA
```

---

## 2. Core Components & Responsibilities

The system is organized into four main layers:

### A. Client-Side Presentation Layer
1. **Target Landing Page (`target-website/`)**
   - **Tech Stack:** Static HTML5, custom styled modern Vanilla CSS.
   - **Analytics Engine:** Integrates `gtag.js` with Measurement ID `G-M284E83HG1`.
   - **Behavioral Telemetry:** Tracks scroll depth milestones (25%, 50%, 75%, 100%) and feature card clicks, transmitting them instantly to Google's data streams.
   - **CRM Portal:** Submits demo requests directly to the backend API via a standard `fetch` POST request.
2. **Analytics Dashboard (`frontend/`)**
   - **Tech Stack:** React, TypeScript, Vite.
   - **Visualization:** Recharts interactive graphs rendering aggregated user traffic.
   - **CRM Panel:** High-fidelity admin page presenting leads, search bars, segment tabs, and detailed customer lead cards.
   - **Dynamic Routing:** Built-in environment variable configuration (`VITE_API_URL` and `VITE_TARGET_WEBSITE_URL`) to allow seamless switching between localhost testing and live Render deployment.

### B. Server-Side Application Layer
1. **FastAPI Web API (`backend/api.py`)**
   - **Tech Stack:** Python 3, FastAPI, Uvicorn.
   - **CORS Configuration:** Safe cross-origin resource sharing (`allow_origins=["*"]`, `allow_credentials=False`) enabling frictionless cross-domain browser requests.
   - **OAuth 2.0 Credentials Engine:** Dynamically generates `token.json` from the `TOKEN_JSON` environment variable on launch, protecting secrets from being exposed on Git.
   - **GA4 Connector:** Uses the Google Analytics Data API (`BetaAnalyticsDataClient`) to query traffic metrics (active users, sessions, pageviews, average session duration, bounce rates).
   - **Smart Analytics Filter:** Intercepts GA4 reporting rows on-the-fly and filters out all traffic logged from the dashboard hostname itself (`ai-analytics-frontend-y0vi.onrender.com`), delivering a pure isolated report of landing page traffic.
2. **SQLite Database Engine (`backend/database.py` & `contacts.db`)**
   - Stores CRM leads locally in a relational table.
   - **Intent-Based Segmentation Engine:** Automatically analyzes form submissions upon receipt and tags them into logical audience groups:
     - 🟢 **High-Value Lead:** Submitted both a Company and a Phone Number.
     - 🟣 **Business Lead:** Submitted a Company name (B2B focus).
     - 🟡 **Warm Lead:** Submitted a Phone Number (high personal intent).
     - ⚪ **New Subscriber:** Basic submission with name, email, and message.

### C. Artificial Intelligence Integration Layer
1. **Claude Model Context Protocol (MCP) Server (`backend/mcp_server.py`)**
   - **Tech Stack:** python-mcp (FastMCP).
   - **Exposed Tools:**
     - `get_website_traffic(start_date, end_date)`: Fetches traffic summaries.
     - `get_traffic_sources(start_date, end_date)`: Lists top acquisition channels.
     - `get_crm_leads()`: Retrieves all database lead submissions.
     - `get_audience_segment(segment_name)`: Returns leads belonging to a specific intent category.
     - `get_customer_journey(email)`: Compiles the full submission/interaction timeline for a specific customer.
   - **Usage:** Connects to Claude Desktop, giving the AI agent full context to answer marketing questions (e.g. *"Show me warm leads that browsed from London"*).

---

## 3. Infrastructure & Deployment Topology

All services are hosted on the **Render Cloud Platform**:
* **Frontend (Dashboard):** Hosted as a static Vite application.
* **Target Website:** Hosted as a static vanilla HTML landing page.
* **Backend API:** Hosted as a Python Web Service with persistent environments:
  - SQLite databases are written dynamically to the local persistent disk.
  - Credentials are securely injected via secret environment variables (`TOKEN_JSON` & `GA4_PROPERTY_ID`).
