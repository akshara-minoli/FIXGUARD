import cors from "cors";
import express from "express";
import helmet from "helmet";

import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import { installMetrics } from "./metrics.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:5173" }));
app.use(express.json({ limit: "10kb" }));
installMetrics(app);

app.get("/health", (_request, response) => {
  response.status(200).json({
    service: "auth-service",
    status: "healthy",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
