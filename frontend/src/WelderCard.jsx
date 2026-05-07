import { getWelder, logout } from "../../services/api";
import { Sidebar } from "./Dashboard";
import {useParams, useNavigate} from "react-router-dom";
import { useState, useEffect } from "react";
import { isLoggedIn } from "../../services/helpers";

function WelderCard() {
    const navigate = useNavigate();

    const [lastRefresh, setLastRefresh] = useState(null);
    const [welder, setWelder] = useState(null);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const { welder_id } = useParams();

    //edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [editError, setEditError] = useState("");
   
    useEffect(() => {
        const p = isLoggedIn();
        if (!p) { navigate("/"); return; }
      }, []);
    
    const fetchWelder = async (welder_id) => {
        try {
          const data = await getWelder(welder_id);
          setWelder(data);
          console.log(data)
          setLastRefresh(new Date());
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

    useEffect(() => {
        fetchWelder(welder_id)
    },[welder_id])

    //edit form
    useEffect(() => {
        if (welder) {
            setEditForm({
                employee_id: welder.employee_id,
                first_name: welder.welder_name.split(" ")[0] || "",
                last_name: welder.welder_name.split(" ")[1] || "",
                department: welder.department
             });
            }
    }, [welder]);

    const handleEditChange = (e) => {
        if (!editForm) return;

        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });
    };

    //update welder
    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            setEditError("");

            const res = await fetch(
                `http://localhost:8000/api/welders/${welder_id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editForm)
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || "Update failed");
            }

            alert("Welder updated!");

            setIsEditing(false);
            fetchWelder(welder_id);
        } catch (err) {
            setEditError(err.message);
        }
    };
      
    function handleLogout() {
        logout();
        navigate("/");
    }

// ── Welder Profile ──────────────────────────────────────────────────────────────
    function WelderProfile({welder}){
        function getWorstStatus(welder) {
        if (welder.expired_count > 0) return "EXPIRED";
        if (welder.at_risk_count > 0) return "AT_RISK";
        return "IN_STATUS";
        }
        
        const STATUS_LABEL = {
        EXPIRED:   "Expired",
        AT_RISK:   "At-Risk",
        IN_STATUS: "Compliant",
        };
        
        const STATUS_CLASS = {
        EXPIRED:   "status--expired",
        AT_RISK:   "status--at-risk",
        IN_STATUS: "status--compliant",
        };

         if (!welder) return null;
 
    const worstStatus = getWorstStatus(welder);
    const total = welder.compliant_count + welder.at_risk_count + welder.expired_count;
    const pct = (n) => total > 0 ? Math.round((n / total) * 100) : 0;
    return (
        <section className="wp-section">
    
        {/* ── Top row ── */}
        <div className="wp-top-row">
    
            {/* Info card */}
            <div className="wp-card wp-info-card">
            <div className="wp-info-header">
                <span className="wp-name">{welder.welder_name}</span>
                <span className="wp-id">ID: {welder.employee_id}</span>
            </div>
            <div className="wp-divider" />
            <div className="wp-info-body">
                <span className="wp-dept">{welder.department}</span>
                <span className="wp-meta">Employment Status: {welder.employment_status ?? "Active"}</span>
                {welder.hire_date && (
                <span className="wp-meta">
                    Hire Date:{" "}
                    {new Date(welder.hire_date).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                    })}
                </span>
                )}
            </div>
            </div>
    
    
            {/* Status card */}
            <div className={`wp-card wp-status-card ${STATUS_CLASS[worstStatus]}`}>
            <span className="wp-status-label">Qualification Status</span>
            <span className="wp-status-value">{STATUS_LABEL[worstStatus]}</span>
            </div>
            {/* Percentage card */}
            <div className="wp-card wp-percent-card">
            <span className="wp-status-label">Breakdown</span>
            <div className="wp-percent-row">
                <span className="wp-percent-title">Compliant</span>
                <span className="wp-percent-num wp-count--compliant">{pct(welder.compliant_count)}%</span>
            </div>
            <div className="wp-percent-row">
                <span className="wp-percent-title">At-Risk</span>
                <span className="wp-percent-num wp-count--at-risk">{pct(welder.at_risk_count)}%</span>
            </div>
            <div className="wp-percent-row">
                <span className="wp-percent-title">Expired</span>
                <span className="wp-percent-num wp-count--expired">{pct(welder.expired_count)}%</span>
            </div>
            </div>
        </div>
        
    
        {/* ── Bottom row – counts ── */}
        <div className="wp-bottom-row">
            <div className="wp-card wp-count-card wp-count--expired">
            <span className="wp-count-title">Expired</span>
            <span className="wp-count-num">{welder.expired_count}</span>
            </div>
            <div className="wp-card wp-count-card wp-count--at-risk">
            <span className="wp-count-title">Caution</span>
            <span className="wp-count-num">{welder.at_risk_count}</span>
            </div>
            <div className="wp-card wp-count-card wp-count--compliant">
            <span className="wp-count-title">In-Status</span>
            <span className="wp-count-num">{welder.compliant_count}</span>
            </div>
        </div>
    
        </section>
        );
    }


    return(
        <div className="app-shell">
        <Sidebar active="Dashboard" />
        <main className="main-content">
        <div className="topbar">
          <div className="">Welder Detailed Information</div>
          
          <button
            onClick={() => setIsEditing(true)}
            className="btn-edit"
            >
                Edit
            </button>

          {lastRefresh && (
            <span className="topbar-right">
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>

        {/*edit form*/}
        {isEditing && editForm && (
            <form className="edit-form" onSubmit={handleUpdate}>

                <h3>Edit Welder</h3>

                {editError && (
                    <div className="error-banner">{editError}</div>
                )}

                <input
                    name="employee_id"
                    value={editForm.employee_id}
                    onChange={handleEditChange}
                />

                <input
                    name="first_name"
                    value={editForm.first_name}
                    onChange={handleEditChange}
                />

                <input
                    name="last_name"
                    value={editForm.last_name}
                    onChange={handleEditChange}
                />

                <select
                    name="department"
                    value={editForm.department}
                    onChange={handleEditChange}
                 >
                    <option value="">Select a Department</option>
                            <option>Structural</option>
                            <option>Fabrication</option>
                            <option>Pipeline</option>
                </select>

                <div className="edit-actions">
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => setIsEditing(false)}>
                        Cancel
                    </button>
                </div>
            </form>
        )}

          
            {welder && <WelderProfile welder={welder}/>}
    

        </main>
    </div>
    );
}

export default WelderCard;