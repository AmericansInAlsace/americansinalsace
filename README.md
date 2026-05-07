# Americansinalsace

A minimal Dockerized Next.js + TypeScript + Node + PostgreSQL scaffold.

## Run locally with Docker

1. Build and start services:

```bash
docker compose up --build
```

2. Open the app:

```bash
http://localhost:3000
```

3. API endpoint:

```bash
http://localhost:3000/api/users
```

## Project structure

- `app/` — Next.js app router pages
- `app/api/users/route.ts` — server route that queries PostgreSQL
- `lib/db.ts` — PostgreSQL pool helper
- `docker-compose.yml` — app + database services
- `Dockerfile` — production build image
- `database/init.sql` — database initialization script
