export const BCRYPT_ROUNDS = 12;

export async function seedConfiguredAdmin({ prisma, username, email, password, hashPassword }) {
  const [userWithUsername, userWithEmail] = await Promise.all([
    prisma.user.findUnique({ where: { username } }),
    prisma.user.findUnique({ where: { email } }),
  ]);

  if (userWithUsername && userWithEmail && userWithUsername.id !== userWithEmail.id) {
    throw new Error("Configured admin username and email belong to different users; review them manually");
  }

  const existingAdmin = userWithUsername ?? userWithEmail;
  const passwordHash = await hashPassword(password, BCRYPT_ROUNDS);

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        username,
        name: "FixGuard Administrator",
        email,
        passwordHash,
        role: "ADMIN",
      },
    });
    return "created";
  }

  const identityMatches =
    existingAdmin.username === username &&
    existingAdmin.email === email &&
    existingAdmin.role === "ADMIN";

  if (!identityMatches) {
    throw new Error("Configured admin identity conflicts with an existing user; review it manually");
  }

  await prisma.user.update({
    where: { id: existingAdmin.id },
    data: { passwordHash },
  });
  return "updated";
}
