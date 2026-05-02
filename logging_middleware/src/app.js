const crypto = require("crypto");
const express = require("express");
const dotenv = require("dotenv");
const loggingMiddleware = require("./middleware/loggingMiddleware");
const logClient = require("./services/logClient");
const errorHandler = require("./middleware/errorHandler");
const healthRoute = require("./routes/health");

dotenv.config();

const configStatus = logClient.validateConfig();
if (!configStatus.ok) {
  console.warn("Logging middleware config warnings:");
  for (const item of configStatus.errors) {
    console.warn(`- ${item}`);
  }
}

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  next();
});

app.use(loggingMiddleware);

app.use("/health", healthRoute);

app.use(errorHandler);

const port = Number(process.env.PORT || 3000);
if (require.main === module) {
  app.listen(port, () => {
    console.log(`logging-middleware listening on ${port}`);
  });
}

module.exports = app;
