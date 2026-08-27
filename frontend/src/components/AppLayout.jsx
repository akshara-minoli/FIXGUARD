import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const citizen = user.role === "CITIZEN";

  function signOut() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink className="brand" to={citizen ? "/citizen/dashboard" : "/admin/dashboard"}>
          <span className="brand-mark">FG</span><span>FixGuard</span>
        </NavLink>
        <p className="eyebrow">{citizen ? "Citizen portal" : "Admin console"}</p>
        <nav>
          <NavLink to={citizen ? "/citizen/dashboard" : "/admin/dashboard"}>Dashboard</NavLink>
          {citizen ? (
            <>
              <NavLink to="/citizen/reports/new">Report issue</NavLink>
              <NavLink to="/citizen/reports">My reports</NavLink>
              <NavLink to="/citizen/profile">Profile</NavLink>
            </>
          ) : (
            <><NavLink to="/admin/reports">All reports</NavLink><NavLink to="/admin/assignments">Assignments</NavLink><NavLink to="/admin/teams">Maintenance teams</NavLink><NavLink to="/admin/locations">Locations</NavLink></>
          )}
        </nav>
        <button className="text-button" onClick={signOut}>Log out</button>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div><span className="status-dot" /> City operations online</div>
          <div className="user-chip"><strong>{user.name}</strong><span>{user.role}</span></div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
