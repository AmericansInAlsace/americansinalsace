# Project Instructions: Americans in Alsace

## Architecture
- **Framework:** Next.js 16+ (App Router).
- **Language:** TypeScript.
- **ORM:** Prisma.
- **Database:** PostgreSQL.
- **Mailing:** MailDev (for local/non-production email catching).
- **Deployment:** Dockerized (App + Postgres + MailDev).

## Conventions
- **API Routes:** All API logic should reside in `app/api/`.
- **Database Access:** Always use the `prisma` client exported from `lib/db.ts`.
- **Types:** Use Prisma-generated types (`@prisma/client`) for database entities.

## Workflows
- **Development:** Start the stack using `docker compose up`.
- **Database Updates:** 
  1. Update `prisma/schema.prisma`.
  2. Run `npx prisma migrate dev --name <migration_name>` (this generates the SQL and updates the client).
  3. Commit the generated migration files in `prisma/migrations/`.
- **Database Management:** Access Adminer at `http://localhost:8080` (System: PostgreSQL, Server: db, User: postgres, Password: postgres, Database: app_db).
- **Email Testing:** Access the MailDev web interface at `http://localhost:1080`.
- **CI/CD:** Use `npx prisma migrate deploy` to apply migrations.

## Agent Guidelines
- When asked to modify the database schema, I will update `prisma/schema.prisma` and run the migration command.
- For any features requiring email, configure SMTP to point to the `maildev` service on port `1025` in development.
