# Notification App (Backend)

Read-only notification service that fetches data from the test server API.

## Setup

```bash
npm install
```

Create `.env` based on `.env.example`:

```
PORT=5000
BASE_URL=http://20.207.122.201/evaluation-service
AUTH_TOKEN=your_token_here
LOG_API_URL=http://20.207.122.201/evaluation-service/logs
```

## Run

```bash
npm start
```

## API

- `GET /notifications?studentId=...&isRead=false&limit=20&cursor=...&priority=true`
- `POST /notifications` (returns 501 in read-only mode)
- `PATCH /notifications/:id/read` (returns 501 in read-only mode)
