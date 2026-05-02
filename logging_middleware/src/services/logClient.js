const axios = require("axios");

const ALLOWED_STACK = ["backend", "frontend"];
const ALLOWED_LEVEL = ["debug", "info", "warn", "error", "fatal"];
const ALLOWED_PACKAGE = [
  "cache",
  "controller",
  "cron_job",
  "domain",
  "handler",
  "repository",
  "route",
  "service"
];

function normalize(value, allowed, fallback) {
  const lower = String(value || "").toLowerCase();
  return allowed.includes(lower) ? lower : fallback;
}

function validateConfig() {
  const errors = [];

  if (!process.env.LOG_API_URL) {
    errors.push("LOG_API_URL is missing");
  }

  if (!process.env.AUTH_TOKEN) {
    errors.push("AUTH_TOKEN is missing");
  }

  return {
    ok: errors.length === 0,
    errors
  };
}

async function sendLog({ stack, level, package: packageName, message }) {
  const config = validateConfig();
  if (!config.ok) {
    return;
  }

  const logApiUrl = process.env.LOG_API_URL;
  const token = process.env.AUTH_TOKEN;

  const payload = {
    stack: normalize(stack, ALLOWED_STACK, "backend"),
    level: normalize(level, ALLOWED_LEVEL, "info"),
    package: normalize(packageName, ALLOWED_PACKAGE, "handler"),
    message: String(message || "")
  };

  try {
    await axios.post(logApiUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      timeout: 2000
    });
  } catch (error) {
    // Best effort logging to avoid breaking request flow.
  }
}

module.exports = {
  sendLog,
  validateConfig
};
