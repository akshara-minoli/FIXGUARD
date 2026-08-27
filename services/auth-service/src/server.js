import "dotenv/config";

import app from "./app.js";
import prisma from "./config/prisma.js";

const port = Number.parseInt(process.env.PORT ?? "4001", 10);

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Connected to PostgreSQL database");

    const server = app.listen(port, () => {
      console.log(`auth-service listening on port ${port}`);
    });

    async function shutdown(signal) {
      console.log(`${signal} received; shutting down`);
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    }

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Unable to connect to PostgreSQL:", error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();

