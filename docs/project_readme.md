# Welder Qualification & Continuity Management System

**CSCI 441 — Group 4 | Fort Hays State University**

---

## How to Run the Project

You need **two terminals open at the same time** — one for the backend, one for the frontend.

### Terminal 1 — Backend

```bash
# From the project root
pip install -r requirements.txt
uvicorn backend.login:app --reload --port 8000

#If that does not work try this in an administrator Powershell in the project root:
python -m pip install -r .\requirements.txt
python -m uvicorn backend.login:app --reload
```

Backend will be running at `http://localhost:8000`

### Terminal 2 — Frontend

```bash
# From the project root
npm install
npm run dev
```

Frontend will be running at `http://localhost:5173` (or 5174 — check your terminal output)

### First Time Setup — Create a Test User

1. Open `http://localhost:8000/docs` in your browser
2. Click **POST /register → Try it out**
3. Enter and execute:

```json
{
  "email": "admin@test.com",
  "password": "password123"
}
```

You can now log in with those credentials on the frontend.

---

## Project Structure

```
CSCI441_Group04_WelderContinuitySystem/
│
├── backend/
│   ├── __init__.py          # Makes backend a Python package
│   ├── login.py             # Auth routes: /register, /login (La Aries)
│   └── dashboard.py         # Dashboard route: /api/dashboard (Kimsean)
│
├── db/
│   ├── schema.sql           # Full database schema
│   └── myapp.db             # Auto-created on first run (gitignored)
│
├── frontend/
│   └── src/
│       ├── main.jsx         # React entry point
│       ├── App.jsx          # Root component, handles login state
│       ├── Login.jsx        # Login page (La Aries)
│       ├── Dashboard.jsx    # Dashboard component (Kimsean)
│       └── Dashboard.css    # Dashboard styles (Kimsean)
│
│
├── index.html               # Vite entry HTML
├── vite.config.js           # Vite config
├── package.json             # Frontend dependencies
├── requirements.txt         # Backend dependencies
└── .gitignore
```

---

## Module Ownership

| Feature                                | Owner               | Files                                                                              |
| -------------------------------------- | ------------------- | ---------------------------------------------------------------------------------- |
| Authentication & Search                | La Aries Winzerling | `backend/login.py`, `frontend/src/Login.jsx`                                       |
| Dashboard                              | Kimsean Bun         | `backend/dashboard.py`, `frontend/src/Dashboard.jsx`, `frontend/src/Dashboard.css` |
| Warnings & Current Qualifications      | Reyes Sanchez       | TBD                                                                                |
| Welder Records & Record Qualifications | Rachel White        | TBD                                                                                |

---

## Dashboard Module (Kimsean)

### What it does

The dashboard is the first screen after login. It shows:

- **Compliant / At Risk / Expired** counts as stat tiles
- **Donut chart** of overall compliance distribution
- **Action Needed** cards — every welder with an expiring or expired qualification, sorted by urgency

### API Endpoint

```
GET /api/dashboard
```

Returns:

```json
{
  "compliant_count": 10,
  "at_risk_count": 3,
  "expired_count": 2,
  "total_welders": 15,
  "chart_data": [...],
  "action_needed": [
    {
      "welder_id": 15,
      "name": "Victor Nguyen",
      "employee_id": "E015",
      "department": "Pipeline",
      "status": "EXPIRED",
      "expiration_date": "2026-03-23",
      "process_name": "SAW",
      "code_name": "AWS D1.1",
      "days_until_expiry": -7
    }
  ]
}
```

### Status Logic

| Condition                            | Status                |
| ------------------------------------ | --------------------- |
| `expiration_date > today + 30 days`  | IN_STATUS (Compliant) |
| `expiration_date <= today + 30 days` | AT_RISK               |
| `expiration_date <= today`           | EXPIRED               |

### Demo Data

On first run, `dashboard.py` automatically seeds the database with 15 demo welders and qualifications so the dashboard has data to display. To reset, delete `db/myapp.db` and restart the backend.

---

## Notes for Each Teammate

### La Aries (Auth)

- The dashboard currently has **no auth guard** on `/api/dashboard`
- Once auth is stable, add `user: dict = Depends(get_current_user)` as a parameter to the `get_dashboard()` function in `dashboard.py`
- Login flow is already wired up in `App.jsx` — after login, the JWT token is saved to `localStorage` and the dashboard loads automatically

### Reyes (Warnings / Qualifications)

- The `action_needed` list in the dashboard already surfaces AT_RISK and EXPIRED records
- Warnings module can read from the same `qualifications` and `notifications` tables — no duplicate data needed
- Any new qualifications you insert will automatically appear on the dashboard on next refresh

### Rachel (Welder Records)

- Dashboard reads from `welders`, `qualifications`, `processes`, and `codes` tables using the shared `db/myapp.db`
- Make sure new welders are inserted with `employment_status = 'Active'` — the dashboard filters out inactive welders
- The demo seed data in `dashboard.py` uses `INSERT OR IGNORE` so it won't conflict with real records you add

### La Aries NOTES FROM FRIDAY 4/3/2026

I could not add `user: dict = Depends(get_current_user)` as a parameter to the `get_dashboard()` because of Python's rule against reference cycles

I added Routing to the React App file to make it easier to navigate between files using the provided functions

Now the /dashboard link checks for a user to be logged in before loading. If not logged in it redirects to log in page

added a logout button to the dashboard. Needs Styling.

### La Aries NOTES FROM FRIDAY 4/10/2026

styled the login page and added an error message for invalid logins

still need to add a check for a valid email format when registering and password requirements

created the welder list page containing all the welders styled similarly to the dashboard. need to add a search bar.

Need to add a sidebar for page navigation as well.

Need to make it so that warning message goes away in login menu after pressing another button
