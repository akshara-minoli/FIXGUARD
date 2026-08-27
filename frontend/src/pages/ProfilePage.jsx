import { useState } from "react";
import { authApi } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user.name, phoneNumber: user.phoneNumber ?? "", profileImageUrl: user.profileImageUrl ?? "" });
  const [message, setMessage] = useState("");
  async function submit(e) { e.preventDefault(); setMessage(""); try { const { user: updated } = await authApi("/api/users/me", { method: "PATCH", body: JSON.stringify({ name: form.name, phoneNumber: form.phoneNumber || null, profileImageUrl: form.profileImageUrl || null }) }); setUser(updated); setMessage("Profile updated successfully."); } catch (error) { setMessage(error.message); } }
  return <section className="page narrow"><div className="page-heading"><div><p className="eyebrow">Account</p><h1>Your profile</h1><p>Keep your contact details current for city follow-up.</p></div></div><section className="panel profile-panel"><div className="avatar">{user.name.charAt(0).toUpperCase()}</div><div className="identity"><h2>{user.name}</h2><p>{user.email}</p><span className="badge badge-citizen">{user.role}</span></div><form className="form-grid" onSubmit={submit}><label>Full name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Email<input disabled value={user.email} /></label><label>Phone number<input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} placeholder="+94 77 123 4567" /></label><label>Profile image URL<input type="url" value={form.profileImageUrl} onChange={(e) => setForm({ ...form, profileImageUrl: e.target.value })} placeholder="https://…" /></label>{message && <p className="form-message">{message}</p>}<button className="primary-button">Save changes</button></form></section></section>;
}
