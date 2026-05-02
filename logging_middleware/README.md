# Logging Middleware

Simple Express middleware that sends request logs to the evaluation Log API.

## Setup

```bash
npm install
```

Create `.env` based on `.env.example`:

```
PORT=3000
LOG_API_URL=http://20.207.122.201/evaluation-service/logs
AUTH_TOKEN=your_token_here
```

## Run

```bash
npm start
```

## Notes

- Logs are sent on response finish; 4xx are `warn`, 5xx are `error`.
- If the Log API is down, the request flow still completes.
