import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import PasswordInput from "../components/PasswordInput.jsx";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={user.role === "ADMIN" ? "/admin/dashboard" : "/citizen/dashboard"} replace />;

  async function submit(event) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const loggedInUser = await login(form);
      navigate(loggedInUser.role === "ADMIN" ? "/admin/dashboard" : "/citizen/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.status === 401 ? "Invalid email, username, or password." : requestError.message);
    } finally { setBusy(false); }
  }

  return <AuthPanel title="Welcome back" subtitle="Sign in to protect and improve your city.">
    <form onSubmit={submit} className="form-stack">
      <label>Email or username<input required autoComplete="username" value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} /></label>
      <PasswordInput label="Password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
    </form>
    <p className="auth-switch">New to FixGuard? <Link to="/register">Create a citizen account</Link></p>
  </AuthPanel>;
}

export function AuthPanel({ title, subtitle, children }) {
  return <main className="auth-page"><section className="auth-story"><span className="brand-mark">FG</span><p className="eyebrow">Smart city response</p><h1>Small reports.<br />Safer streets.</h1><p>Connect residents and city teams around the infrastructure that matters every day.</p></section><section className="auth-card"><h2>{title}</h2><p>{subtitle}</p>{children}</section></main>;
}
