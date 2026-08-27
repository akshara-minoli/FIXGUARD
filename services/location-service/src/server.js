import "dotenv/config";
import app from "./app.js";
import prisma from "./config/prisma.js";
const port = Number(process.env.PORT || 4003);
try {
  await prisma.$connect();
  console.log("location-service connected to PostgreSQL");
  const server = app.listen(port, () => console.log(`Location service listening on port ${port}`));
  async function shutdown() { server.close(async () => { await prisma.$disconnect(); process.exit(0); }); }
  process.on("SIGTERM", shutdown); process.on("SIGINT", shutdown);
} catch (error) {
  console.error("Unable to connect location-service to PostgreSQL:", error.message);
  await prisma.$disconnect(); process.exit(1);
}
