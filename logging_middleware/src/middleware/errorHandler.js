const logClient = require("../services/logClient");

function errorHandler(err, req, res, next) {
  const requestId = req.id || "unknown";
  const message = `Unhandled error: ${err.message} reqId=${requestId}`;

  logClient.sendLog({
    stack: "backend",
    level: "error",
    package: "handler",
    message
  });

  res.status(500).json({
    error: "Internal Server Error",
    requestId: req.id
  });
}

module.exports = errorHandler;
