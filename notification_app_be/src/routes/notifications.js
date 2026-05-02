const express = require("express");
const service = require("../services/notificationsService");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { studentId, type, message } = req.body;
    if (!studentId || !type || !message) {
      return res.status(400).json({ error: "studentId, type, and message are required" });
    }

    const result = await service.createNotification({ studentId, type, message });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const { studentId, isRead, limit, cursor, priority } = req.query;
    if (!studentId) {
      return res.status(400).json({ error: "studentId is required" });
    }

    const parsedIsRead = isRead === undefined ? undefined : isRead === "true";
    const parsedPriority = priority === "true";
    const result = await service.listNotifications({
      studentId,
      isRead: parsedIsRead,
      limit,
      cursor,
      priority: parsedPriority
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/read", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;
    if (typeof isRead !== "boolean") {
      return res.status(400).json({ error: "isRead must be boolean" });
    }

    const result = await service.markRead(id, isRead);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: "Request failed",
    message: err.message
  });
});

module.exports = router;
