# Docker Task Manager

A beginner-friendly project for learning Docker with three services:

- **Frontend:** HTML, CSS, JavaScript served by Nginx
- **Backend:** Node.js + Express REST API
- **Database:** MongoDB

Docker Compose starts all three services and creates a named volume so MongoDB data remains available after containers are recreated.

## Requirements

- Docker Desktop (Windows/macOS) or Docker Engine + Compose (Linux)
- A terminal (PowerShell, CMD, or VS Code terminal)

## Run the project

Open a terminal in the project root (the folder containing `docker-compose.yml`) and run:

```bash
docker compose up --build
```

Wait until the MongoDB health check passes and the backend logs `MongoDB connected`.

Open:

- Frontend: http://localhost:8080
- API health: http://localhost:8080/api/health
- API tasks: http://localhost:8080/api/tasks

You can also access the backend directly at http://localhost:5000/api/health.

## Stop the project

```bash
docker compose down
```

This stops and removes the containers but keeps the MongoDB named volume.

To stop containers AND delete the saved database volume (this permanently deletes project data):

```bash
docker compose down -v
```

## Useful Docker learning commands

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# List local images
docker images

# View logs from all services
docker compose logs

# Follow logs from the backend
docker compose logs -f backend

# Open a shell inside the backend container
docker compose exec backend sh

# Open MongoDB shell
docker compose exec mongodb mongosh

# Rebuild and start after changing Dockerfile or dependencies
docker compose up --build

# Stop and remove containers/network (keeps named volume)
docker compose down
```

## REST API (Postman)

Base URL: `http://localhost:5000`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/tasks` | List all tasks |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Update title or completion |
| DELETE | `/api/tasks/:id` | Delete a task |

### Create task

POST `http://localhost:5000/api/tasks`

Body → raw → JSON:

```json
{
  "title": "Learn Docker images"
}
```

### Update task

PATCH `http://localhost:5000/api/tasks/PASTE_TASK_ID_HERE`

```json
{
  "completed": true
}
```

### Delete task

DELETE `http://localhost:5000/api/tasks/PASTE_TASK_ID_HERE`

Copy the task `_id` from the GET response and replace `PASTE_TASK_ID_HERE`.

## How the containers communicate

Inside Docker Compose, the backend connects to MongoDB using the service name:

`mongodb://mongodb:27017/taskmanager`

The hostname `mongodb` is Docker Compose service discovery. Do not use `localhost` from inside the backend container to reach the MongoDB container.

The Nginx frontend proxies `/api/...` requests to `backend:5000`, so the browser can use the same origin at port 8080.

## Learning exercises

1. Run `docker compose up --build` and inspect `docker ps`.
2. Stop only the backend: `docker compose stop backend`. Notice the frontend cannot load tasks.
3. Start it again: `docker compose start backend`.
4. Add a task, run `docker compose down`, then `docker compose up`. Confirm the task is still there (named volume).
5. Inspect logs with `docker compose logs -f`.
6. Change the frontend heading and rebuild the frontend: `docker compose up --build -d frontend`.

## Notes

This is a local learning project, not a production-ready deployment. It has no authentication, and its database port is published to your host for learning convenience. Do not expose it publicly without adding security, secret management, and appropriate network restrictions.
