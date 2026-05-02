const crypto = require("crypto");
const express = require("express");
const dotenv = require("dotenv");
const scheduleRoute = require("./routes/schedule");
const loggingMiddleware = require("./middleware/loggingMiddleware");
const errorHandler = require("./middleware/errorHandler");
const logClient = require("./services/logClient");

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

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/schedule", scheduleRoute);

app.use(errorHandler);

const port = Number(process.env.PORT || 4000);
if (require.main === module) {
  app.listen(port, () => {
    console.log(`vehicle-maintenance-scheduler listening on ${port}`);
  });
}

module.exports = app;
