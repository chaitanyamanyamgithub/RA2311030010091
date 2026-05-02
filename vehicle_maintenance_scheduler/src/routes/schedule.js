const express = require("express");
const apiClient = require("../services/apiClient");
const scheduler = require("../services/scheduler");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const [depots, vehicles] = await Promise.all([
      apiClient.getDepots(),
      apiClient.getVehicles()
    ]);

    const plan = scheduler.createSchedule(depots, vehicles);
    res.status(200).json(plan);
  } catch (error) {
    next(error);
  }
});

router.use((err, req, res, next) => {
  res.status(500).json({
    error: "Failed to generate schedule",
    message: err.message || "Unexpected error"
  });
});

module.exports = router;
