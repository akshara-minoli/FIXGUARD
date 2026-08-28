import { useState } from "react";

export default function PasswordInput({ label, ...inputProps }) {
  const [visible, setVisible] = useState(false);
  const action = visible ? "Hide password" : "Show password";

  return <label>{label}<span className="password-input">
    <input {...inputProps} type={visible ? "text" : "password"} />
    <button type="button" className="password-toggle" aria-label={action} title={action} aria-pressed={visible} onClick={() => setVisible((current) => !current)}>
      {visible ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  </span></label>;
}

function EyeIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.75" /></svg>;
}

function EyeOffIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m3 3 18 18M10.6 6.1A10 10 0 0 1 12 6c6 0 9.5 6 9.5 6a15 15 0 0 1-2.1 2.8M6.2 6.2C3.8 8 2.5 12 2.5 12s3.5 6 9.5 6a10 10 0 0 0 3.1-.5M9.9 9.9A3 3 0 0 0 14.1 14" /></svg>;
}
