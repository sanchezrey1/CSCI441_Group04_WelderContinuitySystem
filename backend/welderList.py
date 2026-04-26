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

@router.get("/api/welderlist")
def welderList():
    
    conn = get_db()
    rows = conn.execute("""
    SELECT
        w.welder_id,
        w.first_name || ' ' || w.last_name AS welder_name,
        w.employee_id,
        w.department,
        CASE
            WHEN SUM(CASE WHEN q.status = 'EXPIRED'   THEN 1 ELSE 0 END) > 0 THEN 'EXPIRED'
            WHEN SUM(CASE WHEN q.status = 'AT_RISK'   THEN 1 ELSE 0 END) > 0 THEN 'AT_RISK'
            ELSE 'IN_STATUS'
        END AS worst_status,
        COUNT(q.qualification_id) AS total_qualifications
        FROM welders w
        LEFT JOIN qualifications q ON q.welder_id = w.welder_id
        WHERE w.employment_status = 'Active'
        GROUP BY w.welder_id
        ORDER BY w.last_name ASC
    """).fetchall()
    
    today = date.today()
    welders = []
    
    for r in rows:
        welders.append({
            "welder_id":         r["welder_id"],
            "name":              r["welder_name"],
            "employee_id":       r["employee_id"],
            "department":        r["department"],
            "worst_status":            r["worst_status"],
            "total_qualifications": r["total_qualifications"]
        })
    
    conn.close()
    return {"welders": welders}

#POST Model
class WelderCreate(BaseModel):
    employee_id: str
    first_name: str
    last_name: str
    department: str
    hire_date: str

@router.post("/api/welders")
def add_welder(welder: WelderCreate):
    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO welders
            (employee_id, first_name, last_name, department, employment_status, hire_date)
            VALUES (?, ?, ?, ?, 'Active', ?)
        """, (
            welder.employee_id,
            welder.first_name,
            welder.last_name,
            welder.department,
            welder.hire_date
        ))

        conn.commit()

        welder_id = cursor.lastrowid
        return {"message": "Welder added", "welder_id": welder_id}

    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Employee ID already exists")
 
    finally:
        conn.close()
    
    
    
