const logClient = require("../services/logClient");

function loggingMiddleware(req, res, next) {
  const startTime = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startTime;
    const status = res.statusCode;
    const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
    const requestId = req.id || "unknown";
    const message = `${req.method} ${req.originalUrl} ${status} ${durationMs}ms reqId=${requestId}`;

    logClient.sendLog({
      stack: "backend",
      level,
      package: "handler",
      message
    });
  });

  next();
}

module.exports = loggingMiddleware;
