import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const component = await readFile(new URL("../src/components/PasswordInput.jsx", import.meta.url), "utf8");
const login = await readFile(new URL("../src/pages/LoginPage.jsx", import.meta.url), "utf8");
const register = await readFile(new URL("../src/pages/RegisterPage.jsx", import.meta.url), "utf8");

test("password toggle is an accessible non-submit button with changing visibility", () => {
  assert.match(component, /useState\(false\)/);
  assert.match(component, /type=\{visible \? "text" : "password"\}/);
  assert.match(component, /type="button"/);
  assert.match(component, /visible \? "Hide password" : "Show password"/);
  assert.match(component, /aria-label=\{action\}/);
});

test("login and registration use password visibility controls", () => {
  assert.equal((login.match(/<PasswordInput/g) ?? []).length, 1);
  assert.equal((register.match(/<PasswordInput/g) ?? []).length, 2);
});
