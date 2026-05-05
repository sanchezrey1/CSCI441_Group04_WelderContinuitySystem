from fastapi import APIRouter, HTTPException
import sqlite3
from pathlib import Path
from datetime import date, timedelta
from pydantic import BaseModel

router = APIRouter()
DB_PATH = Path(__file__).parent.parent / "db" / "myapp.db"

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

@router.get("/api/welder/{welder_id}")
def welder(welder_id: int):
    
    conn = get_db()
    rows = conn.execute("""
    SELECT
        w.welder_id,
        w.first_name || ' ' || w.last_name AS welder_name,
        w.employee_id,
        w.department,
        w.employment_status,
        w.hire_date,
        q.qualification_id,
        q.expiration_date
        FROM welders w
        LEFT JOIN qualifications q ON q.welder_id = w.welder_id
        WHERE w.welder_id = ?
    """, (welder_id,)).fetchall()
    
    if not rows:
        raise HTTPException(status_code=404, detail="Welder not found")
    
    compliant = at_risk = expired = 0
    
    #count the qualifications' statuses
    for row in rows:
        if row["qualification_id"] is None:
            continue
        status = compute_status(row["expiration_date"])
        if status == "IN_STATUS":
            compliant += 1
        elif status == "AT_RISK":
            at_risk += 1
        else:
            expired += 1
    
    welder = {
    "welder_id": rows[0]["welder_id"],
    "welder_name": rows[0]["welder_name"],
    "employee_id": rows[0]["employee_id"],
    "department": rows[0]["department"],
    "compliant_count": compliant,
    "at_risk_count":   at_risk,
    "expired_count":   expired,
    "qualifications": [
        {
            "qualification_id": row["qualification_id"],
            "expiration_date": row["expiration_date"]
        }
        for row in rows
        if row["qualification_id"] is not None  # handles welders with no qualifications
    ]
    }
   
    conn.close()
    return welder

@router.post("/api/welders/full")
def create_welder(welder: dict):
    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO welders (
                employee_id,
                first_name,
                last_name,
                department,
                hire_date
            )
            VALUES (?, ?, ?, ?, ?)
        """, (
            welder["employee_id"],
            welder["first_name"],
            welder["last_name"],
            welder["department"],
            welder["hire_date"]
        ))

        conn.commit()

        return {"message": "Welder created successfully"}

    except sqlite3.IntegrityError as e:
        # ⭐ THIS is where HTTP 409 happens
        if "UNIQUE constraint failed: welders.employee_id" in str(e):
            raise HTTPException(
                status_code=409,
                detail="Employee ID already exists"
            )

        raise HTTPException(status_code=500, detail=str(e))

    finally:
        conn.close()
