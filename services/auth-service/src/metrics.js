import client from "prom-client";

const service = "auth-service";
const register = new client.Registry();

client.collectDefaultMetrics({ register, prefix: "fixguard_nodejs_", labels: { service } });

const requests = new client.Counter({
  name: "fixguard_http_requests_total",
  help: "Total completed FixGuard HTTP requests.",
  labelNames: ["service", "method", "route", "status_code"],
  registers: [register],
});

const duration = new client.Histogram({
  name: "fixguard_http_request_duration_seconds",
  help: "FixGuard HTTP request duration in seconds.",
  labelNames: ["service", "method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

function routeLabel(request) {
  const route = typeof request.route?.path === "string" ? request.route.path : "unmatched";
  if (route === "unmatched") return route;
  const routeParts = route.split("/").filter(Boolean);
  const pathParts = request.originalUrl.split("?", 1)[0].split("/").filter(Boolean);
  const mountParts = pathParts.slice(0, Math.max(0, pathParts.length - routeParts.length));
  return `/${[...mountParts, ...routeParts].join("/")}`;
}

export function installMetrics(app) {
  app.get("/metrics", async (_request, response, next) => {
    try {
      response.set("Content-Type", register.contentType).send(await register.metrics());
    } catch (error) {
      next(error);
    }
  });

  app.use((request, response, next) => {
    if (request.path === "/health" || request.path === "/metrics") return next();
    const stopTimer = duration.startTimer();
    response.on("finish", () => {
      const labels = {
        service,
        method: request.method,
        route: routeLabel(request),
        status_code: String(response.statusCode),
      };
      requests.inc(labels);
      stopTimer(labels);
    });
    next();
  });
}
