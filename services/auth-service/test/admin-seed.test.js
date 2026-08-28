import test from "node:test";
import assert from "node:assert/strict";

import { BCRYPT_ROUNDS, seedConfiguredAdmin } from "../prisma/admin-seed.js";

const identity = { username: "admin123", email: "admin123@fixguard.com", password: "Local-only-Password!9" };
const hashPassword = async (password, rounds) => {
  assert.equal(password, identity.password);
  assert.equal(rounds, BCRYPT_ROUNDS);
  return `bcrypt-hash-${rounds}`;
};

function fakePrisma(initialUsers = []) {
  const users = initialUsers.map((user) => ({ ...user }));
  return {
    users,
    user: {
      findUnique: async ({ where }) => users.find((user) => Object.entries(where).every(([key, value]) => user[key] === value)) ?? null,
      create: async ({ data }) => {
        const user = { id: `user-${users.length + 1}`, ...data };
        users.push(user);
        return user;
      },
      update: async ({ where, data }) => {
        const user = users.find((candidate) => candidate.id === where.id);
        Object.assign(user, data);
        return user;
      },
    },
  };
}

test("creates one ADMIN when no configured identity exists", async () => {
  const prisma = fakePrisma();
  assert.equal(await seedConfiguredAdmin({ prisma, ...identity, hashPassword }), "created");
  assert.equal(prisma.users.length, 1);
  assert.equal(prisma.users[0].role, "ADMIN");
  assert.equal("password" in prisma.users[0], false);
  assert.notEqual(prisma.users[0].passwordHash, identity.password);
});

test("rotates only the exact ADMIN password and preserves its ID and profile", async () => {
  const existing = { id: "stable-id", ...identity, password: undefined, passwordHash: "old-hash", role: "ADMIN", name: "Existing Name", phoneNumber: "123" };
  const prisma = fakePrisma([existing]);
  assert.equal(await seedConfiguredAdmin({ prisma, ...identity, hashPassword }), "updated");
  assert.equal(prisma.users[0].id, "stable-id");
  assert.equal(prisma.users[0].name, "Existing Name");
  assert.equal(prisma.users[0].phoneNumber, "123");
  assert.equal(prisma.users[0].passwordHash, `bcrypt-hash-${BCRYPT_ROUNDS}`);
});

test("rerunning with the same password leaves exactly one ADMIN", async () => {
  const prisma = fakePrisma([{ id: "stable-id", username: identity.username, email: identity.email, passwordHash: "old", role: "ADMIN" }]);
  await seedConfiguredAdmin({ prisma, ...identity, hashPassword });
  await seedConfiguredAdmin({ prisma, ...identity, hashPassword });
  assert.equal(prisma.users.length, 1);
  assert.equal(prisma.users.filter((user) => user.role === "ADMIN").length, 1);
});

test("refuses when configured username and email belong to different users", async () => {
  const prisma = fakePrisma([
    { id: "one", username: identity.username, email: "one@example.com", role: "ADMIN" },
    { id: "two", username: "other", email: identity.email, role: "ADMIN" },
  ]);
  await assert.rejects(seedConfiguredAdmin({ prisma, ...identity, hashPassword }), /different users/);
});

test("refuses a matching identity with a non-ADMIN role", async () => {
  const prisma = fakePrisma([{ id: "citizen", username: identity.username, email: identity.email, role: "CITIZEN" }]);
  await assert.rejects(seedConfiguredAdmin({ prisma, ...identity, hashPassword }), /conflicts/);
});

test("never persists the plaintext password", async () => {
  const prisma = fakePrisma();
  await seedConfiguredAdmin({ prisma, ...identity, hashPassword });
  assert.equal(JSON.stringify(prisma.users).includes(identity.password), false);
});
