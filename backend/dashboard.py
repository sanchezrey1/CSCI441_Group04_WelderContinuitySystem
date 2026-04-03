"""
dashboard.py  —  Dashboard API route
Owner: Kimsean Bun

Add to the project by importing this router in login.py:
    from dashboard import router as dashboard_router
    app.include_router(dashboard_router)
"""

from fastapi import APIRouter, Depends, HTTPException
from datetime import date, timedelta
import sqlite3
from pathlib import Path

# Reuse the same DB path your teammates already set up
DB_PATH = Path(__file__).parent.parent / "db" / "myapp.db"

router = APIRouter()


# ── Helpers ───────────────────────────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def compute_status(expiration_date_str: str) -> str:
    """
    Live status from expiration_date (TC-25 to TC-29):
      EXPIRED    : expiration_date <= today
      AT_RISK    : expiration_date <= today + 30 days
      IN_STATUS  : expiration_date >  today + 30 days
    """
    if not expiration_date_str:
        return "IN_STATUS"
    exp = date.fromisoformat(expiration_date_str)
    today = date.today()
    if exp <= today:
        return "EXPIRED"
    if exp <= today + timedelta(days=30):
        return "AT_RISK"
    return "IN_STATUS"


def seed_demo_data(conn):
    """
    Insert demo welders + qualifications so the dashboard has data to show.
    Only runs when the welders table is empty.
    """
    c = conn.cursor()
    if c.execute("SELECT COUNT(*) FROM welders").fetchone()[0] > 0:
        return  # already seeded

    today = date.today()

    # Welding processes
    for p in ["SMAW", "GTAW", "GMAW", "FCAW", "SAW"]:
        c.execute("INSERT OR IGNORE INTO processes (process_name) VALUES (?)", (p,))

    # Welding codes
    for co in ["AWS D1.1", "ASME Section IX", "AWS D1.5"]:
        c.execute("INSERT OR IGNORE INTO codes (code_name) VALUES (?)", (co,))

    # 15 demo welders
    welders = [
        ("E001","John","Doe","Fabrication","Active","2020-03-15"),
        ("E002","Jane","Smith","Fabrication","Active","2019-07-22"),
        ("E003","Carlos","Rivera","Structural","Active","2021-01-10"),
        ("E004","Amy","Chen","Structural","Active","2018-05-30"),
        ("E005","Marcus","Johnson","Pipeline","Active","2022-02-14"),
        ("E006","Sara","Williams","Pipeline","Active","2021-11-01"),
        ("E007","Devon","Brown","Fabrication","Active","2023-06-20"),
        ("E008","Lena","Park","Structural","Active","2020-09-05"),
        ("E009","Omar","Hassan","Pipeline","Inactive","2017-04-18"),
        ("E010","Priya","Patel","Fabrication","Active","2022-08-11"),
        ("E011","Jake","Torres","Structural","Active","2021-03-25"),
        ("E012","Nina","Owens","Pipeline","Active","2019-12-07"),
        ("E013","Ethan","Kim","Fabrication","Active","2023-01-30"),
        ("E014","Grace","Lee","Structural","Active","2020-06-14"),
        ("E015","Victor","Nguyen","Pipeline","Active","2018-10-22"),
    ]
    for w in welders:
        c.execute("""INSERT OR IGNORE INTO welders
                     (employee_id,first_name,last_name,department,employment_status,hire_date)
                     VALUES (?,?,?,?,?,?)""", w)

    # Qualifications (welder_id, process_id, code_id, qualified_date, expiration_date, status)
    quals = [
        (1,1,1,"2024-01-10",(today+timedelta(days=90)).isoformat(),"IN_STATUS"),
        (2,2,2,"2024-03-05",(today+timedelta(days=120)).isoformat(),"IN_STATUS"),
        (3,1,1,"2024-02-20",(today+timedelta(days=80)).isoformat(),"IN_STATUS"),
        (4,3,1,"2023-11-15",(today+timedelta(days=60)).isoformat(),"IN_STATUS"),
        (5,4,2,"2024-04-01",(today+timedelta(days=150)).isoformat(),"IN_STATUS"),
        (6,2,3,"2024-05-10",(today+timedelta(days=200)).isoformat(),"IN_STATUS"),
        (8,1,2,"2024-01-25",(today+timedelta(days=45)).isoformat(),"IN_STATUS"),
        (10,3,1,"2024-06-01",(today+timedelta(days=180)).isoformat(),"IN_STATUS"),
        (11,5,2,"2024-02-14",(today+timedelta(days=70)).isoformat(),"IN_STATUS"),
        (14,1,3,"2024-03-18",(today+timedelta(days=95)).isoformat(),"IN_STATUS"),
        # AT_RISK
        (7,2,1,"2023-09-01",(today+timedelta(days=20)).isoformat(),"AT_RISK"),
        (12,4,2,"2023-08-15",(today+timedelta(days=10)).isoformat(),"AT_RISK"),
        (13,1,1,"2023-10-10",(today+timedelta(days=25)).isoformat(),"AT_RISK"),
        # EXPIRED
        (9,3,3,"2022-06-01",(today-timedelta(days=30)).isoformat(),"EXPIRED"),
        (15,5,1,"2022-11-20",(today-timedelta(days=7)).isoformat(),"EXPIRED"),
    ]
    for q in quals:
        c.execute("""INSERT OR IGNORE INTO qualifications
                     (welder_id,process_id,code_id,qualified_date,expiration_date,status)
                     VALUES (?,?,?,?,?,?)""", q)

    conn.commit()


# ── Route ─────────────────────────────────────────────────────────────────────

@router.get("/api/dashboard")
def get_dashboard():
    """
    GET /api/dashboard
    Returns aggregated compliance data for the React Dashboard component.
    No auth guard yet — La Aries will add Depends(get_current_user) once
    the auth middleware is confirmed working.
    """
    conn = get_db()

    # Seed demo data on first run
    seed_demo_data(conn)

    rows = conn.execute("""
        SELECT
            q.qualification_id,
            q.welder_id,
            q.expiration_date,
            w.first_name || ' ' || w.last_name AS welder_name,
            w.employee_id,
            w.department,
            p.process_name,
            co.code_name
        FROM qualifications q
        JOIN welders   w  ON w.welder_id  = q.welder_id
        JOIN processes p  ON p.process_id = q.process_id
        JOIN codes     co ON co.code_id   = q.code_id
        WHERE w.employment_status = 'Active'
        ORDER BY q.expiration_date ASC
    """).fetchall()

    conn.close()

    today = date.today()
    compliant = at_risk = expired = 0
    action_needed = []

    for r in rows:
        status = compute_status(r["expiration_date"])
        if status == "IN_STATUS":
            compliant += 1
        elif status == "AT_RISK":
            at_risk += 1
        else:
            expired += 1

        if status in ("AT_RISK", "EXPIRED"):
            days = (date.fromisoformat(r["expiration_date"]) - today).days
            action_needed.append({
                "welder_id":         r["welder_id"],
                "name":              r["welder_name"],
                "employee_id":       r["employee_id"],
                "department":        r["department"],
                "status":            status,
                "expiration_date":   r["expiration_date"],
                "process_name":      r["process_name"],
                "code_name":         r["code_name"],
                "days_until_expiry": days,
            })

    action_needed.sort(key=lambda x: x["days_until_expiry"])
    total = compliant + at_risk + expired

    return {
        "compliant_count": compliant,
        "at_risk_count":   at_risk,
        "expired_count":   expired,
        "total_welders":   total,
        "chart_data": [
            {"label": "Compliant", "count": compliant, "color": "#22c55e"},
            {"label": "At Risk",   "count": at_risk,   "color": "#f59e0b"},
            {"label": "Expired",   "count": expired,   "color": "#ef4444"},
        ],
        "action_needed": action_needed,
    }
