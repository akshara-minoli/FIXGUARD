import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import adminRoutes from "./routes/admin.routes.js";
import reportRoutes from "./routes/report.routes.js";
import internalRoutes from "./routes/internal.routes.js";

const app = express();
app.use(helmet()); app.use(cors()); app.use(express.json({ limit: "20kb" }));
app.get("/health", (_request, response) => response.json({ service: "report-service", status: "healthy" }));
app.use("/api/reports", reportRoutes);
app.use("/api/admin/reports", adminRoutes);
app.use("/api/internal/reports", internalRoutes);
app.use(notFoundHandler); app.use(errorHandler);
export default app;
