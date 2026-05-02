const apiClient = require("./notificationApiClient");

const TYPE_SCORES = {
  Placement: 1,
  Result: 0.7,
  Event: 0.4
};

function parseTimestamp(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeNotification(item, index) {
  const id = item.ID || item.id || `n_${index}`;
  const type = item.Type || item.type || "Event";
  const message = item.Message || item.message || "";
  const createdAt = item.Timestamp || item.timestamp || item.createdAt || new Date().toISOString();
  const studentId = item.StudentID || item.studentId || item.student_id || null;

  return {
    id,
    studentId,
    type,
    message,
    isRead: false,
    createdAt
  };
}

function scoreNotification(item) {
  const created = parseTimestamp(item.createdAt) || new Date();
  const minutes = Math.max(0, (Date.now() - created.getTime()) / 60000);
  const recencyWeight = Math.exp(-minutes / 60);
  const impactWeight = TYPE_SCORES[item.type] || 0.4;
  return 0.6 * recencyWeight + 0.4 * impactWeight;
}

function notSupported(message) {
  const error = new Error(message);
  error.status = 501;
  return error;
}

async function createNotification() {
  throw notSupported("Write operations are disabled. This service runs in read-only mode.");
}

async function listNotifications({ studentId, isRead, limit, cursor, priority }) {
  if (isRead === true) {
    return { items: [], nextCursor: null };
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);
  const data = await apiClient.getNotifications();
  let items = data.map(normalizeNotification);

  if (studentId) {
    const hasStudentField = items.some((item) => item.studentId);
    if (hasStudentField) {
      items = items.filter((item) => item.studentId === studentId);
    }
  }

  if (cursor) {
    items = items.filter((item) => {
      const ts = parseTimestamp(item.createdAt);
      if (!ts) {
        return false;
      }
      return ts.toISOString() < cursor;
    });
  }

  items.sort((a, b) => {
    const tsA = parseTimestamp(a.createdAt) || new Date(0);
    const tsB = parseTimestamp(b.createdAt) || new Date(0);
    return tsB - tsA;
  });

  if (priority) {
    const scored = items.map((item) => ({
      item,
      score: scoreNotification(item)
    }));
    scored.sort((a, b) => b.score - a.score);
    const topCount = Math.max(1, Math.ceil(scored.length * 0.1));
    items = scored.slice(0, topCount).map((entry) => entry.item);
  }

  items = items.slice(0, safeLimit);

  const nextCursor = items.length ? items[items.length - 1].createdAt : null;
  return { items, nextCursor };
}

async function markRead() {
  throw notSupported("Write operations are disabled. This service runs in read-only mode.");
}

module.exports = {
  createNotification,
  listNotifications,
  markRead
};
