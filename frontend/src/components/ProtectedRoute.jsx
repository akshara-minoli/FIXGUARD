import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ roles }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="screen-center">Checking your session…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === "ADMIN" ? "/admin/dashboard" : "/citizen/dashboard"} replace />;
  }
  return <Outlet />;
}
