import { useState, useEffect, useRef } from "react";

// ── Config ────────────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:8000/api";

// ── Tiny donut chart (no library needed) ─────────────────────────────────────
function DonutChart({ data, size = 200 }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) {
    return (
      <div className="donut-empty">
        <span>No Data</span>
      </div>
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const strokeW = size * 0.18;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const slices = data.map((d) => {
    const pct = d.count / total;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const slice = { ...d, dash, gap, offset };
    offset += dash;
    return slice;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut-svg">
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--track)" strokeWidth={strokeW} />
      {/* Slices */}
      {slices.map((s, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={s.color}
          strokeWidth={strokeW}
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={-s.offset + circumference * 0.25}
          strokeLinecap="butt"
          className="donut-slice"
        />
      ))}
      {/* Center label */}
      <text x={cx} y={cy - 8} textAnchor="middle" className="donut-total-num">
        {total}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="donut-total-label">
        total
      </text>
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
  const isExpired = item.status === "EXPIRED";
  const days = Math.abs(item.days_until_expiry);
  const dayLabel = isExpired
    ? `Expired ${days} day${days !== 1 ? "s" : ""} ago`
    : `Expires in ${days} day${days !== 1 ? "s" : ""}`;

  return (
    <div className={`action-card ${isExpired ? "card-expired" : "card-at-risk"}`}>
      <div className="action-card-top">
        <StatusBadge status={item.status} />
        <span className="action-card-dept">{item.department}</span>
      </div>
      <div className="action-card-name">{item.name}</div>
      <div className="action-card-sub">ID: {item.employee_id}</div>
      <div className="action-card-process">
        {item.process_name} · {item.code_name}
      </div>
      <div className={`action-card-days ${isExpired ? "days-expired" : "days-at-risk"}`}>
        {dayLabel}
      </div>
    </div>
  );
}

// ── Stat tile ─────────────────────────────────────────────────────────────────
function StatTile({ label, count, accent, icon }) {
  return (
    <div className="stat-tile" style={{ "--accent": accent }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-count">{count}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-bar" />
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const intervalRef = useRef(null);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      setData(json);
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
    // Auto-refresh every 60 seconds
    intervalRef.current = setInterval(fetchDashboard, 60_000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // ── Loading state
  if (loading) {
    return (
      <div className="dash-loading">
        <div className="spinner" />
        <p>Loading compliance data…</p>
      </div>
    );
  }

  // ── Error state
  if (error) {
    return (
      <div className="dash-error">
        <div className="error-icon">⚠</div>
        <h3>Could not load dashboard</h3>
        <p>{error}</p>
        <p className="error-hint">Make sure the backend is running on <code>localhost:5000</code></p>
        <button onClick={fetchDashboard} className="btn-retry">Retry</button>
      </div>
    );
  }

  const { compliant_count, at_risk_count, expired_count, chart_data, action_needed } = data;

  return (
    <div className="dashboard">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Compliance Dashboard</h1>
          <p className="dash-subtitle">Welder Qualification &amp; Continuity Status</p>
        </div>
        <div className="dash-header-right">
          {lastRefresh && (
            <span className="last-refresh">
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button onClick={fetchDashboard} className="btn-refresh">
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* ── Stat tiles ─────────────────────────────────────────────────────── */}
      <div className="stat-grid">
        <StatTile
          label="Compliant"
          count={compliant_count}
          accent="#22c55e"
          icon="✓"
        />
        <StatTile
          label="At Risk"
          count={at_risk_count}
          accent="#f59e0b"
          icon="!"
        />
        <StatTile
          label="Expired"
          count={expired_count}
          accent="#ef4444"
          icon="✕"
        />
      </div>

      {/* ── Chart + legend ──────────────────────────────────────────────────── */}
      <div className="chart-section">
        <div className="chart-card">
          <h2 className="section-title">Compliance Distribution</h2>
          <div className="chart-body">
            <DonutChart data={chart_data} size={220} />
            <div className="chart-legend">
              {chart_data.map((d) => (
                <div key={d.label} className="legend-row">
                  <span className="legend-dot" style={{ background: d.color }} />
                  <span className="legend-label">{d.label}</span>
                  <span className="legend-count">{d.count}</span>
                  <span className="legend-pct">
                    {data.total_welders > 0
                      ? Math.round((d.count / data.total_welders) * 100)
                      : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Action needed ───────────────────────────────────────────────────── */}
      <div className="action-section">
        <div className="action-header">
          <h2 className="section-title">
            Action Needed
            {action_needed.length > 0 && (
              <span className="action-count">{action_needed.length}</span>
            )}
          </h2>
          <p className="action-subtitle">
            Welders with expired or soon-to-expire qualifications
          </p>
        </div>

        {action_needed.length === 0 ? (
          <div className="action-empty">
            <span className="action-empty-icon">✓</span>
            <p>All qualifications are current — no action required.</p>
          </div>
        ) : (
          <div className="action-grid">
            {action_needed.map((item, i) => (
              <ActionCard key={`${item.welder_id}-${i}`} item={item} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
