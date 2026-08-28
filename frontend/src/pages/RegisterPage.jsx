import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { authApi } from "../api/client.js";
import { AuthPanel } from "./LoginPage.jsx";
import PasswordInput from "../components/PasswordInput.jsx";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const change = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function submit(event) {
    event.preventDefault(); setError("");
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    setBusy(true);
    try {
      await authApi("/api/auth/register", { method: "POST", body: JSON.stringify({ name: form.name, email: form.email, password: form.password }) });
      navigate("/login", { replace: true, state: { registered: true } });
    } catch (requestError) { setError(requestError.message); } finally { setBusy(false); }
  }

  return <AuthPanel title="Create your account" subtitle="Join your neighborhood's infrastructure response network."><form onSubmit={submit} className="form-stack">
    <label>Full name<input required value={form.name} onChange={change("name")} autoComplete="name" /></label>
    <label>Email<input required type="email" value={form.email} onChange={change("email")} autoComplete="email" /></label>
    <PasswordInput label="Password" required minLength="8" value={form.password} onChange={change("password")} autoComplete="new-password" />
    <PasswordInput label="Confirm password" required minLength="8" value={form.confirmPassword} onChange={change("confirmPassword")} autoComplete="new-password" />
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="primary-button" disabled={busy}>{busy ? "Creating account…" : "Create citizen account"}</button>
  </form><p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p></AuthPanel>;
}
