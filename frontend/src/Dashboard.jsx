import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/api";
import { isLoggedIn } from "../../services/helpers";
import "./Dashboard.css";

const API_BASE = "http://localhost:8000/api";


// ── Shared Sidebar ────────────────────────────────────────────────────────────
export function Sidebar({ active }) {
  const navigate = useNavigate();

  function handleNavigate(page) {
    if (page === "Dashboard")   navigate("/dashboard");
    if (page === "Welder List") navigate("/welderlist");
    if (page === "Notifications") navigate("/notifications");
    if (page === "Settings") navigate("/settings");
  }

  const links = ["Dashboard", "Welder List", "Notifications", "Settings"];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">Welder Management System</div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <button
            key={link}
            className={`sidebar-link ${active === link ? "sidebar-link-active" : ""}`}
            onClick={() => handleNavigate(link)}
          >
            {link}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button className="sidebar-add" onClick={() => navigate("/add-welder")}>
          + Add Welder
        </button>
      </div>
    </aside>
  );
}

// ── Donut chart ───────────────────────────────────────────────────────────────
function DonutChart({ data, size = 160 }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) return <div className="donut-empty">No Data</div>;
  const cx = size / 2, cy = size / 2;
  const r = size * 0.36, strokeW = size * 0.16;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const slices = data.map((d) => {
    const dash = (d.count / total) * circumference;
    const slice = { ...d, dash, gap: circumference - dash, offset };
    offset += dash;
    return slice;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--track)" strokeWidth={strokeW} />
      {slices.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none"
          stroke={s.color} strokeWidth={strokeW}
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={-s.offset + circumference * 0.25}
          strokeLinecap="butt" />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" className="donut-num">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" className="donut-lbl">total</text>
    </svg>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    IN_STATUS: { label: "In Status", cls: "badge-good" },
    AT_RISK:   { label: "At Risk",   cls: "badge-warn" },
    EXPIRED:   { label: "Expired",   cls: "badge-bad"  },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "" };
  return <span className={`badge ${cls}`}>{label}</span>;
}

// ── Action card ───────────────────────────────────────────────────────────────
function ActionCard({ item }) {
  const expDate = new Date(item.expiration_date).toLocaleDateString("en-US", {
    month: "short", day: "2-digit", year: "numeric",
  });
  return (
    <div className={`action-card ${item.status === "EXPIRED" ? "card-expired" : "card-at-risk"}`}>
      <div className="action-card-name">{item.name}</div>
      <div className="action-card-desc">{item.process_name} · {item.code_name}</div>
      <div className="action-card-footer">
        <StatusBadge status={item.status} />
        <span className="action-card-date">{expDate}</span>
      </div>
    </div>
  );
}

// ── Stat tile ─────────────────────────────────────────────────────────────────
function StatTile({ label, count }) {
  return (
    <div className="stat-tile">
      <span className="stat-label">{label}</span>
      <span className="stat-count">{count}</span>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState("");
  const [lastRefresh, setLastRefresh] = useState(null);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  useEffect(() => {
    const p = isLoggedIn();
    if (!p) { navigate("/"); return; }
  }, []);


  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/dashboard`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setData(await res.json());
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  fetchDashboard();

  let savedSettings = null;

  try {
    savedSettings = JSON.parse(localStorage.getItem("systemSettings"));
  } catch {
    savedSettings = null;
  }

  if (savedSettings?.autoRefresh !== "Disabled") {
    intervalRef.current = setInterval(fetchDashboard, 60_000);
  }

  return () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
}, []);

  if (loading) return (
    <div className="app-shell">
      <Sidebar active="Dashboard" />
      <main className="main-content">
        <div className="dash-loading"><div className="spinner" /><p>Loading…</p></div>
      </main>
    </div>
  );

  if (error) return (
    <div className="app-shell">
      <Sidebar active="Dashboard" />
      <main className="main-content">
        <div className="dash-error">
          <div className="error-icon">⚠</div>
          <h3>Could not load dashboard</h3>
          <p>{error}</p>
          <p className="error-hint">Make sure the backend is running on <code>localhost:8000</code></p>
          <button onClick={fetchDashboard} className="btn-retry">Retry</button>
        </div>
      </main>
    </div>
  );

  const { compliant_count, at_risk_count, expired_count, chart_data, action_needed } = data;
  const filtered = action_needed.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.employee_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-shell">
      <Sidebar active="Dashboard" />
      <main className="main-content">

        <div className="topbar">
          <div className="topbar-search">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search by name or ID"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {lastRefresh && (
            <span className="topbar-right">
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>

        <div className="page-body">

          <div className="stat-grid">
            <StatTile label="Non-Compliant" count={expired_count} />
            <StatTile label="At Risk"       count={at_risk_count} />
            <StatTile label="Compliant"     count={compliant_count} />
          </div>

          <div className="chart-row">
            <div className="chart-card">
              <DonutChart data={chart_data} size={160} />
            </div>
            <div className="chart-legend-card">
              {chart_data.map((d) => (
                <div key={d.label} className="legend-row">
                  <span className="legend-dot" style={{ background: d.color }} />
                  <span className="legend-label">{d.label}</span>
                  <span className="legend-count">{d.count}</span>
                  <span className="legend-pct">
                    {data.total_welders > 0 ? Math.round((d.count / data.total_welders) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="action-section">
            <h2 className="section-title">
              Action Needed
              {action_needed.length > 0 && (
                <span className="action-count">{action_needed.length}</span>
              )}
            </h2>
            {filtered.length === 0 ? (
              <div className="action-empty">✓ No action required.</div>
            ) : (
              <div className="action-grid">
                {filtered.map((item, i) => (
                  <ActionCard key={`${item.welder_id}-${i}`} item={item} />
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
