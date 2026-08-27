import "dotenv/config";
import app from "./app.js";
import prisma from "./config/prisma.js";

const port = Number.parseInt(process.env.PORT ?? "4002", 10);
try {
  await prisma.$connect();
  console.log("report-service connected to PostgreSQL");
  const server = app.listen(port, () => console.log(`report-service listening on port ${port}`));
  const shutdown = (signal) => { console.log(`${signal} received; shutting down`); server.close(async () => { await prisma.$disconnect(); process.exit(0); }); };
  process.on("SIGINT", () => shutdown("SIGINT")); process.on("SIGTERM", () => shutdown("SIGTERM"));
} catch (error) { console.error("Unable to connect report-service to PostgreSQL:", error.message); await prisma.$disconnect(); process.exit(1); }
