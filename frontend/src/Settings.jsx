import { useState } from "react";
import { Sidebar } from "./Dashboard";
import "./Dashboard.css";

export default function Settings() {
  const [warningDays, setWarningDays] = useState(30);
  const [autoRefresh, setAutoRefresh] = useState("Enabled");
  const [notificationType, setNotificationType] = useState("In-App");
  const [role, setRole] = useState("Admin / CWI");
  const [saved, setSaved] = useState(false);

  function saveSettings() {
  const settings = {
    warningDays,
    autoRefresh,
    notificationType,
    role,
  };

  localStorage.setItem("systemSettings", JSON.stringify(settings));

  setSaved(true);
  setTimeout(() => setSaved(false), 2500);
}

  return (
    <div className="app-shell">
      <Sidebar active="Settings" />

      <main className="main-content">
        <div className="topbar">
          <h2>Settings</h2>
          <button className="btn-logout" onClick={saveSettings}>
            Save Settings
          </button>
        </div>

        <div className="page-body">

          {saved && (
            <div className="action-empty" style={{ marginBottom: "20px" }}>
              ✓ Settings saved successfully.
            </div>
          )}

          {/* Top Summary */}
          <div className="stat-grid">
            <div className="stat-tile">
              <span className="stat-label">Current Role</span>
              <span className="stat-count">{role}</span>
            </div>

            <div className="stat-tile">
              <span className="stat-label">Warning Threshold</span>
              <span className="stat-count">{warningDays} Days</span>
            </div>

            <div className="stat-tile">
              <span className="stat-label">Auto Refresh</span>
              <span className="stat-count">{autoRefresh}</span>
            </div>
          </div>

          {/* Editable Settings */}
          <div className="chart-legend-card" style={{ marginTop: "30px" }}>
            <h2 className="section-title">Editable System Preferences</h2>

            <div className="settings-row">
              <label className="settings-label">Expiration Warning Window</label>
              <select
                className="settings-select"
                value={warningDays}
                onChange={(e) => setWarningDays(e.target.value)}
              >
                <option value={15}>15 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>

            <div className="settings-row">
              <label className="settings-label">Dashboard Auto Refresh</label>
              <select
                className="settings-select"
                value={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.value)}
              >
                <option>Enabled</option>
                <option>Disabled</option>
              </select>
            </div>

            <div className="settings-row">
              <label className="settings-label">Notification Type</label>
              <select
                className="settings-select"
                value={notificationType}
                onChange={(e) => setNotificationType(e.target.value)}
              >
                <option>In-App</option>
                <option>Email</option>
                <option>In-App + Email</option>
              </select>
            </div>

            <div className="settings-row">
              <label className="settings-label">Access Level</label>
              <select
                className="settings-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option>Admin / CWI</option>
                <option>Supervisor</option>
                <option>Viewer</option>
              </select>
            </div>
          </div>

          {/* Summary Section */}
          <div className="action-section">
            <h2 className="section-title">System Configuration Summary</h2>

            <div className="action-grid">
              <div className="action-card">
                <div className="action-card-name">Notification Rule</div>
                <div className="action-card-desc">
                  Alerts are created {warningDays} days before a qualification expires.
                </div>
              </div>

              <div className="action-card">
                <div className="action-card-name">Refresh Behavior</div>
                <div className="action-card-desc">
                  Dashboard auto refresh is currently {autoRefresh.toLowerCase()}.
                </div>
              </div>

              <div className="action-card">
                <div className="action-card-name">User Access</div>
                <div className="action-card-desc">
                  Current access level is set to {role}.
                </div>
              </div>

              <div className="action-card">
                <div className="action-card-name">Notification Delivery</div>
                <div className="action-card-desc">
                  Notifications are delivered via {notificationType}.
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}