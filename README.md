# Americans in Alsace

A minimal Dockerized Next.js + TypeScript + Node + PostgreSQL scaffold.

## Local Development

1.  **Build and start services:**
    ```bash
    docker compose up --build
    ```
2.  **Open the app:**
    Navigate to `http://localhost:3000` in your browser.
3.  **API endpoint:**
    The API is available at `http://localhost:3000/api/users`.

## Project Structure & Architecture

For a detailed understanding of the project's architecture, directory organization, and data flow, please refer to the [Architecture Design Document](./docs/architecture-design-document.md).

## Documentation

This project includes comprehensive documentation within the `docs/` directory. The main index can be found at [docs/index.md](./docs/index.md).

## Key Files

- `app/` — Next.js app router pages and server logic.
- `app/actions/auth.ts` — Server Actions for user authentication flows.
- `lib/db.ts` — Prisma client singleton for database interactions.
- `services/` — Core business logic, decoupled from the framework.
- `docker-compose.yml` — Defines local development services (app + database).
- `Dockerfile` — Production build image configuration.
- `prisma/schema.prisma` — Database schema and Prisma configuration.
