import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const client = await readFile(new URL("../src/api/client.js", import.meta.url), "utf8");
const routes = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");

test("frontend centralizes public service URLs and invalid-token handling", () => {
  for (const name of ["AUTH", "REPORT", "LOCATION", "ASSIGNMENT", "NOTIFICATION", "ANALYTICS"]) {
    assert.match(client, new RegExp(`VITE_${name}_API_URL`));
  }
  assert.match(client, /response\.status === 401/);
  assert.match(client, /fixguard-auth-invalid/);
});

test("citizen and admin routes remain protected by role", () => {
  assert.match(routes, /ProtectedRoute roles=\{\["CITIZEN"\]\}/);
  assert.match(routes, /ProtectedRoute roles=\{\["ADMIN"\]\}/);
});
