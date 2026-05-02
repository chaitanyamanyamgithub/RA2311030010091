# Notification System Design

## Stage 1 - API Design

Base URL: `/api/v1`

Headers (all requests):
- `Content-Type: application/json`
- `Authorization: Bearer <token>` (single shared token, no user login)

Endpoints:
1. `POST /notifications`
   - Body:
     ```json
     {
       "studentId": "S12345",
       "type": "Event",
       "message": "Hackathon starts at 5 PM"
     }
     ```
   - Response:
     ```json
     {
       "id": "n_01HZY3WJ9W9F2E2V6G7C7C",
       "studentId": "S12345",
       "type": "Event",
       "message": "Hackathon starts at 5 PM",
       "isRead": false,
       "createdAt": "2026-05-02T10:20:30Z"
     }
     ```

2. `GET /notifications?studentId=S12345&isRead=false&limit=20&cursor=...`
   - Response:
     ```json
     {
       "items": [
         {
           "id": "n_01HZY3WJ9W9F2E2V6G7C7C",
           "studentId": "S12345",
           "type": "Event",
           "message": "Hackathon starts at 5 PM",
           "isRead": false,
           "createdAt": "2026-05-02T10:20:30Z"
         }
       ],
       "nextCursor": "2026-05-02T10:20:30Z"
     }
     ```

3. `PATCH /notifications/{id}/read`
   - Body:
     ```json
     { "isRead": true }
     ```
   - Response:
     ```json
     { "id": "n_01HZY3WJ9W9F2E2V6G7C7C", "isRead": true }
     ```

Notes:
- `type` is one of: `Placement`, `Event`, `Result`.
- Pagination uses a cursor on `createdAt` for stable ordering.

## Stage 2 - Storage and Implementation

Database: PostgreSQL (relational, supports indexes and sorting by time).

Implementation note: For Stage 6, the backend runs in read-only mode and uses the provided Notification API without persisting data. The schema below is the storage design if persistence is required later.

Schema:
```sql
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_student_read_time
  ON notifications (student_id, is_read, created_at DESC);
```

REST handlers map 1:1 to the API above. The service layer validates `type`, and the repository layer uses parameterized queries.

## Stage 3 - Query Optimization

Slow query:
```sql
SELECT * FROM notifications
WHERE student_id = ? AND is_read = false
ORDER BY created_at DESC;
```

Optimization:
- Add a composite index on `(student_id, is_read, created_at DESC)`.
- Select only required columns.
- Use keyset pagination to avoid `OFFSET`.

Optimized query:
```sql
SELECT id, student_id, type, message, is_read, created_at
FROM notifications
WHERE student_id = ? AND is_read = false
  AND created_at < ?
ORDER BY created_at DESC
LIMIT ?;
```

## Stage 4 - Scaling and Performance

When reads overwhelm writes:
- Add a read replica for `GET /notifications`.
- Add Redis cache for unread counts and recent notifications.
- Use short TTLs (30-60 seconds) with cache invalidation on write.
- Use batch writes for high-volume events.

Tradeoffs: caching improves latency but risks slightly stale reads; replicas add cost and operational complexity.

## Stage 5 - Reliability at 50k Emails/Minute

Design:
- Use a message broker (Kafka/RabbitMQ/SQS) with a worker pool.
- Persist notifications first, then enqueue send tasks.
- Use exponential backoff and dead-letter queue for retries.
- Idempotency key per notification to prevent duplicate sends.
- Track delivery status in a separate table.

## Stage 6 - Priority and Polling

Priority definition (top 10%):
- Score = 0.6 * recencyWeight + 0.4 * impactWeight
- recencyWeight: newer notifications rank higher (exponential decay by minutes)
- impactWeight: `Placement` > `Result` > `Event`

Queue design:
- Maintain two queues per student: `priority` and `normal`.
- When polling, return up to 10 items from priority first, then normal.
- Mark items as delivered with a `delivered_at` timestamp to avoid repeats.
- API example: `GET /notifications?studentId=S12345&limit=10&priority=true`.
