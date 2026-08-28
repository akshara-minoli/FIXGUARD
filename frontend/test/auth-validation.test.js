import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { PASSWORD_REQUIREMENTS, safeAuthErrorMessage, validateRegistration } from "../src/authValidation.js";

const valid = { name: "Valid Citizen", email: "citizen@example.com", password: "SecurePass9", confirmPassword: "SecurePass9" };

test("valid registration satisfies the backend-aligned client policy", () => {
  assert.equal(validateRegistration(valid), "");
  assert.equal(PASSWORD_REQUIREMENTS, "8–72 characters with an uppercase letter, a lowercase letter, and a number.");
});

test("weak passwords, mismatch, and invalid email return useful messages", () => {
  assert.equal(validateRegistration({ ...valid, password: "akshara123", confirmPassword: "akshara123" }), "Password must contain an uppercase letter.");
  assert.equal(validateRegistration({ ...valid, confirmPassword: "Different9" }), "Passwords do not match.");
  assert.equal(validateRegistration({ ...valid, email: "invalid" }), "Email must be valid.");
});

test("safe backend validation detail is preferred over the generic summary", () => {
  assert.equal(safeAuthErrorMessage({ status: 400, message: "Validation failed", details: [{ field: "password", message: "Password must contain an uppercase letter" }] }), "Password must contain an uppercase letter");
});

test("login keeps the correct payload and generic invalid-credential UX", async () => {
  const login = await readFile(new URL("../src/pages/LoginPage.jsx", import.meta.url), "utf8");
  assert.match(login, /useState\(\{ identifier: "", password: "" \}\)/);
  assert.match(login, /requestError\.status === 401 \? "Invalid email, username, or password\."/);
  assert.match(login, /safeAuthErrorMessage\(requestError\)/);
});
