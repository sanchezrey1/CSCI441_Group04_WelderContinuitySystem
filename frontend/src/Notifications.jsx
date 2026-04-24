import { useState } from "react";
import { Sidebar } from "./Dashboard";
import "./Dashboard.css";

const initialNotifications = [
  {
    id: 1,
    name: "Victor Nguyen",
    employeeId: "W-1042",
    process: "SAW",
    code: "AWS D1.1",
    status: "Expired",
    severity: "Critical",
    date: "Apr 06, 2026",
    reviewed: false,
    message: "Qualification has expired and requires renewal before additional work."
  },
  {
    id: 2,
    name: "Nina Owens",
    employeeId: "W-1088",
    process: "FCAW",
    code: "ASME Section IX",
    status: "At Risk",
    severity: "Warning",
    date: "Apr 23, 2026",
    reviewed: false,
    message: "Qualification is nearing expiration and should be reviewed soon."
  },
  {
    id: 3,
    name: "Devon Brown",
    employeeId: "W-1120",
    process: "GTAW",
    code: "AWS D1.1",
    status: "At Risk",
    severity: "Warning",
    date: "May 03, 2026",
    reviewed: true,
    message: "Continuity date is approaching the warning threshold."
  }
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredNotifications = notifications.filter((item) => {
    const matchesFilter =
      filter === "All" ||
      item.status === filter ||
      (filter === "Reviewed" && item.reviewed) ||
      (filter === "Unreviewed" && !item.reviewed);

    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      item.process.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  function markReviewed(id) {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, reviewed: true } : item
      )
    );
  }

  function dismissNotification(id) {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }

  function markAllReviewed() {
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, reviewed: true }))
    );
  }

  return (
    <div className="app-shell">
      <Sidebar active="Notifications" />

      <main className="main-content">
        <div className="topbar">
          <div className="topbar-search">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search alerts by name, ID, process, or code"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button className="btn-logout" onClick={markAllReviewed}>
            Mark All Reviewed
          </button>
        </div>

        <div className="page-body">
          <div className="stat-grid">
            <div className="stat-tile">
              <span className="stat-label">Total Alerts</span>
              <span className="stat-count">{notifications.length}</span>
            </div>

            <div className="stat-tile">
              <span className="stat-label">Critical</span>
              <span className="stat-count">
                {notifications.filter((n) => n.severity === "Critical").length}
              </span>
            </div>

            <div className="stat-tile">
              <span className="stat-label">Unreviewed</span>
              <span className="stat-count">
                {notifications.filter((n) => !n.reviewed).length}
              </span>
            </div>
          </div>

          <div style={{ margin: "25px 0", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {["All", "Expired", "At Risk", "Reviewed", "Unreviewed"].map((item) => (
              <button
                key={item}
                className={filter === item ? "sidebar-link sidebar-link-active" : "sidebar-link"}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="action-section">
            <h2 className="section-title">
              Qualification Alerts
              <span className="action-count">{filteredNotifications.length}</span>
            </h2>

            {filteredNotifications.length === 0 ? (
              <div className="action-empty">✓ No matching alerts.</div>
            ) : (
              <div className="action-grid">
                {filteredNotifications.map((item) => (
                  <div
                    key={item.id}
                    className={`action-card ${
                      item.status === "Expired" ? "card-expired" : "card-at-risk"
                    }`}
                  >
                    <div className="action-card-name">
                      {item.name}
                      {item.reviewed && (
                        <span style={{ marginLeft: "8px", color: "#64748b", fontSize: "12px" }}>
                          Reviewed
                        </span>
                      )}
                    </div>

                    <div className="action-card-desc">
                      {item.employeeId} · {item.process} · {item.code}
                    </div>

                    <p style={{ marginTop: "12px", color: "#64748b" }}>
                      {item.message}
                    </p>

                    <div className="action-card-footer">
                      <span className={`badge ${item.status === "Expired" ? "badge-bad" : "badge-warn"}`}>
                        {item.status}
                      </span>
                      <span className="action-card-date">{item.date}</span>
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                      <button className="btn-retry" onClick={() => markReviewed(item.id)}>
                        Mark Reviewed
                      </button>
                      <button className="btn-logout" onClick={() => dismissNotification(item.id)}>
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}