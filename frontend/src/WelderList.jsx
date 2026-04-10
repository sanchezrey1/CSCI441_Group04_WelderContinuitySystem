import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getWelders } from "../../services/api"
import { isLoggedIn } from "../../services/helpers";
import {logout} from "../../services/api"
// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    IN_STATUS: { label: "In Status", cls: "badge-good" },
    AT_RISK:   { label: "At Risk",   cls: "badge-warn" },
    EXPIRED:   { label: "Expired qualification(s)",   cls: "badge-bad"  },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "" };
  return <span className={`badge ${cls}`}>{label}</span>;
}

function WelderCard({ item }) {
  const inStatus = item.worst_status === "IN_STATUS";
  const isAtRisk = item.worst_status === "AT_RISK";
  const isExpired = item.worst_status === "EXPIRED";
  
  const cardStatus = {
    IN_STATUS: "card-in-status",
    AT_RISK:   "card-at-risk",
    EXPIRED:   "card-expired",
}[item.worst_status] ?? "card-in-status";
  return (
    <div className={`action-card ${cardStatus}`}>
      <div className="action-card-top">
        <StatusBadge status={item.worst_status} />
        <span className="action-card-dept">{item.department}</span>
      </div>
      <div className="action-card-name">{item.name}</div>
      <div className="action-card-sub">ID: {item.employee_id}</div>
      <div className="total-qualifications"></div>
    </div>
  );
}

function WelderListApp() {
    const [welders, setWelders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [credentials, setCredentials] = useState(null);
    const [lastRefresh, setLastRefresh] = useState(null);
    const navigate = useNavigate();

//check if user is logged in and return to login page if not
  useEffect( () => {
    const p = isLoggedIn()
      if(!p){
        navigate("/");
        return;
      }
    setCredentials(p);
  },[] );

    const weldersList = async () => {
        try{
            const data = await getWelders();
            setWelders(data.welders);
            setLoading(false);
        } 
        catch(error){
            setError(error.message);
            setLoading(false);
        }
    }
    
    
    useEffect(() => {
        weldersList(); 
        setLastRefresh(new Date());
    },[])

    function handleLogout(){
    logout();
    navigate("/");
  }

    if(loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

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
            <button onClick={weldersList} className="btn-refresh">
                ↻ Refresh
            </button>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
            </div>
        </div>
       

            <div className="list-section">
            <div className="welder-grid">
                {welders.map((item, i) => (
                  <WelderCard key={`${item.welder_id}-${i}`} item={item} />
                ))}
              </div>
            </div>
       </div>
    )
}

//FIX: figure out how to get data now that python is changed
export default WelderListApp


