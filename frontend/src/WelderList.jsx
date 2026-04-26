import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getWelders, logout } from "../../services/api";
import { isLoggedIn } from "../../services/helpers";
import { Sidebar } from "./Dashboard";

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

// ── Welder card ───────────────────────────────────────────────────────────────
function WelderCard({ item }) {
  const cardClass = {
    IN_STATUS: "card-in-status",
    AT_RISK:   "card-at-risk",
    EXPIRED:   "card-expired",
  }[item.worst_status] ?? "card-in-status";

  return (
    <div className={`action-card ${cardClass}`}>
      <div className="action-card-top">
        <StatusBadge status={item.worst_status} />
        <span className="action-card-dept">{item.department}</span>
      </div>
      <div className="action-card-name">{item.name}</div>
      <div className="action-card-sub">ID: {item.employee_id}</div>
      <div className="action-card-desc">
        {item.total_qualifications} qualification{item.total_qualifications !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

// ── Main WelderList ───────────────────────────────────────────────────────────
export default function WelderListApp() {
  const [welders, setWelders]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState("");
  const [lastRefresh, setLastRefresh] = useState(null);
  const navigate = useNavigate();
  

  useEffect(() => {
    const p = isLoggedIn();
    if (!p) { navigate("/"); return; }
  }, []);

  const fetchWelders = async () => {
    try {
      const data = await getWelders();
      setWelders(data.welders);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  function handleLogout() {
    logout();
    navigate("/");
  }

  useEffect(() => { fetchWelders(); }, []);

  const filtered = welders.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.employee_id.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="app-shell">
      <Sidebar active="Welder List" />
      <main className="main-content">
        <div className="dash-loading"><div className="spinner" /><p>Loading…</p></div>
      </main>
    </div>
  );

  if (error) return (
    <div className="app-shell">
      <Sidebar active="Welder List" />
      <main className="main-content">
        <div className="dash-error">
          <div className="error-icon">⚠</div>
          <h3>Could not load welders</h3>
          <p>{error}</p>
          <button onClick={fetchWelders} className="btn-retry">Retry</button>
        </div>
      </main>
    </div>
  );

  return (
    <div className="app-shell">
      <Sidebar active="Welder List" />
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
          <h2 className="section-title">
            All Welders
            <span style={{ fontWeight: 400, color: "var(--muted)" }}>
              ({filtered.length})
            </span>
          </h2>
          {filtered.length === 0 ? (
            <div className="action-empty">No welders found.</div>
          ) : (
            <div className="welder-grid">
              {filtered.map((item, i) => (
                <WelderCard key={`${item.welder_id}-${i}`} item={item} />
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
