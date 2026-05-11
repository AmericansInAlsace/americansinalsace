# Project Instructions: Americans in Alsace

## Architecture
- **Framework:** Next.js 16+ (App Router).
- **Language:** TypeScript.
- **Principles:** Adhere to **SOLID principles** for all architectural and implementation decisions.
- **ORM:** Prisma.
- **Database:** PostgreSQL.
- **Mailing:** MailDev (for local/non-production email catching).
- **Deployment:** Dockerized (App + Postgres + MailDev).

## Conventions
- **Minimal Impact:** Make **minimal changes** when touching existing code; prioritize surgical updates over broad refactors unless explicitly requested.
- **Documentation:** Provide clear and precise **JSDoc comments** for all methods and functions, including those within test suites. Comments should describe purpose, parameters, and return values.
- **Testing:** Aim for at least **90% code coverage** for all core logic (services, lib, and app/actions). Thresholds are enforced in `vitest.config.ts`.
- **Integration Testing Strategy:** 
  1. Integration tests must verify the flow between API/Actions, Services, and the Database.
  2. Mocking should be minimized: only mock external third-party APIs (PayPal, MailDev) and highly non-deterministic components.
  3. All new features must include integration tests that cover successful paths and edge cases.
  4. Maintain at least 90% coverage for all new code before finishing a task.
- **API Routes:** All API logic should reside in `app/api/`.
- **Database Access:** Always use the `prisma` client exported from `lib/db.ts`.
- **Types:** Use Prisma-generated types (`@prisma/client`) for database entities.

## Workflows
- **Development:** Start the stack using `docker compose up`.
- **Feature Development Process:** When developing a new feature, always start with a detailed functional specification (.md file) in the `docs` folder. Then, proceed to the implementation phase following Test-Driven Development (TDD).
- **Database Updates:**
  1. Update `prisma/schema.prisma`.
  2. Run `npx prisma migrate dev --name <migration_name>` (this generates the SQL and updates the client).
  3. Commit the generated migration files in `prisma/migrations/`.
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
- **Testing:** Maintain a minimum of 90% code coverage for all new features and integrations. Always run tests with coverage (`npm test -- --coverage`) before finishing a task. Use Istanbul provider if V8 has parsing issues with Next.js components.
- **Model & Delegation Strategy:**
  - Before delegating tasks to a sub-agent, verify current model usage statistics.
  - Prioritize delegation to models that are under **50%** of their daily token quota limit to ensure sufficient capacity for complex tasks.
  - Do not attempt to delegate tasks if the primary model is over **95%** of its daily quota; handle the task in the main session to conserve resources.
