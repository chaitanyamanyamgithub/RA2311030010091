const axios = require("axios");

function createClient() {
  const baseUrl = process.env.BASE_URL || "http://20.207.122.201/evaluation-service";
  const token = process.env.AUTH_TOKEN;

  if (!token) {
    throw new Error("AUTH_TOKEN is missing. Add it to .env to call protected APIs.");
  }

  if (!baseUrl) {
    throw new Error("BASE_URL is missing. Add it to .env to call the test server.");
  }

  return axios.create({
    baseURL: baseUrl,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    timeout: 4000
  });
}

async function getNotifications() {
  const client = createClient();
  const response = await client.get("/notifications");
  const data = response.data || {};
  return data.notifications || data.items || [];
}

module.exports = {
  getNotifications
};
