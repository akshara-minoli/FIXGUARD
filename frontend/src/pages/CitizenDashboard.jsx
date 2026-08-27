import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { reportApi } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ summary: { total: 0, active: 0, inProgress: 0, resolved: 0 }, recent: [] });
  const [error, setError] = useState("");
  useEffect(() => { reportApi("/api/reports/my/summary").then(setData).catch(() => setError("Report statistics are temporarily unavailable.")); }, []);
  return <section className="page"><div className="page-heading"><div><p className="eyebrow">Citizen dashboard</p><h1>Welcome, {user.name.split(" ")[0]}</h1><p>See what you have reported and what the city is working on.</p></div><Link className="primary-button" to="/citizen/reports/new">+ Report an issue</Link></div>
    {error && <p className="notice">{error}</p>}
    <div className="stat-grid"><Stat label="Total reports" value={data.summary.total} /><Stat label="Submitted / review" value={data.summary.active} /><Stat label="In progress" value={data.summary.inProgress} /><Stat label="Resolved" value={data.summary.resolved} /></div>
    <section className="panel"><div className="panel-title"><h2>Recent reports</h2><Link to="/citizen/reports">View all</Link></div>{data.recent.length ? <div className="report-list">{data.recent.map((report) => <Link to={`/citizen/reports/${report.id}`} className="report-row" key={report.id}><div><strong>{report.title}</strong><span>{report.category.replaceAll("_", " ")}</span></div><StatusBadge value={report.status} /></Link>)}</div> : <div className="empty-state"><h3>No reports yet</h3><p>Your submitted infrastructure issues will appear here.</p></div>}</section>
  </section>;
}
function Stat({ label, value }) { return <article className="stat-card"><span>{label}</span><strong>{value}</strong></article>; }
