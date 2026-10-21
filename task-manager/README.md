# Task Manager

A full-stack task manager. Add tasks, tick them off, filter by open or done, and delete them. Built with a React frontend, a Node.js/Express REST API, and Docker.

## Tech stack

- **Frontend:** React 18, Vite, plain CSS
- **Backend:** Node.js, Express, JSON-file storage
- **Testing:** Node's built-in test runner (API tests), Postman for manual checks
- **DevOps:** Docker, Docker Compose

## Run it with Docker

```bash
docker compose up --build
```

Open http://localhost:4000. Tasks are saved in a Docker volume, so they survive restarts.

## Run it without Docker

Terminal 1, the API:

```bash
cd server
npm install
npm run dev
```

Terminal 2, the frontend:

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173. Vite forwards `/api` calls to the API on port 4000.

## Run the tests

```bash
cd server
npm test
```

## API

| Method | Endpoint | What it does |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/tasks` | List all tasks |
| POST | `/api/tasks` | Create a task. Body: `{ "title": "..." }` |
| PATCH | `/api/tasks/:id` | Update `done` and/or `title` |
| DELETE | `/api/tasks/:id` | Delete a task |

Validation errors return `400` with `{ "error": "..." }`, and unknown ids return `404`.

## Project structure

```
server/   Express API, JSON store, tests
client/   React app (Vite)
Dockerfile, docker-compose.yml
```

## Ideas for next steps

- Swap the JSON store for MongoDB or PostgreSQL (only `server/src/store.js` changes)
- Add user accounts with JWT authentication
- Add due dates and priorities
- Deploy to Render or Railway
