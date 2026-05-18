import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "contacts.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL,
            company TEXT,
            phone TEXT,
            message TEXT NOT NULL,
            segment TEXT DEFAULT 'New Subscriber',
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)
    conn.commit()
    conn.close()

def assign_segment(phone: str, company: str) -> str:
    """Auto-assign a customer segment based on form data."""
    if phone and company:
        return "High-Value Lead"
    elif company:
        return "Business Lead"
    elif phone:
        return "Warm Lead"
    else:
        return "New Subscriber"

def save_contact(full_name: str, email: str, company: str, phone: str, message: str) -> dict:
    segment = assign_segment(phone, company)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO contacts (full_name, email, company, phone, message, segment) VALUES (?, ?, ?, ?, ?, ?)",
        (full_name, email, company or None, phone or None, message, segment)
    )
    conn.commit()
    contact_id = cursor.lastrowid
    conn.close()
    return {"id": contact_id, "segment": segment}

def get_all_contacts():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM contacts ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_contacts_by_segment(segment: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM contacts WHERE segment = ? ORDER BY created_at DESC", (segment,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_contact_by_email(email: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM contacts WHERE email = ? ORDER BY created_at DESC", (email,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

# Initialize DB on import
init_db()
