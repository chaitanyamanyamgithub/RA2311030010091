# Vehicle Maintenance Scheduler

Generates an optimal maintenance plan per depot based on mechanic-hours and vehicle impact.

## Setup

```bash
npm install
```

Create `.env` based on `.env.example`:

```
PORT=4000
BASE_URL=http://20.207.122.201/evaluation-service
AUTH_TOKEN=your_token_here
LOG_API_URL=http://20.207.122.201/evaluation-service/logs
```

## Run

```bash
npm start
```

## API

`GET /schedule` returns the schedule per depot and any unassigned task IDs.
