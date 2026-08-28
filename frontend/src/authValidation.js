export const PASSWORD_REQUIREMENTS = "8–72 characters with an uppercase letter, a lowercase letter, and a number.";

export function validateRegistration({ name, email, password, confirmPassword }) {
  const normalizedName = name.trim();
  const normalizedEmail = email.trim();

  if (normalizedName.length < 2) return "Full name must contain at least 2 characters.";
  if (normalizedName.length > 120) return "Full name must not exceed 120 characters.";
  if (normalizedEmail.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return "Email must be valid.";
  if (password.length < 8) return "Password must contain at least 8 characters.";
  if (password.length > 72) return "Password must not exceed 72 characters.";
  if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter.";
  if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain a number.";
  if (password !== confirmPassword) return "Passwords do not match.";
  return "";
}

export function safeAuthErrorMessage(error) {
  if (error.status === 400 && Array.isArray(error.details)) {
    const validationMessage = error.details.find((detail) => typeof detail?.message === "string")?.message;
    if (validationMessage) return validationMessage;
  }
  return error.message;
}
