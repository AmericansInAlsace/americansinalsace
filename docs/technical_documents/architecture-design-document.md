# Architecture Design Document

This document details the architectural design and structure of the Americans in Alsace project. It aims to provide a clear understanding of how the application is organized, the technologies used, and the rationale behind key design decisions.

## 1. Directory Overview

### `app/` (Next.js App Router)
The **Delivery Layer**. It handles routing, middleware, and entry points for user interaction.
- `[locale]/`: Contains page routes and layouts supporting internationalization (English/French).
- `actions/`: **Server Actions**. This is the primary bridge between the UI and the Business Logic. Actions validate input and call the appropriate `services`.
- `api/`: REST API endpoints for external integrations (e.g., PayPal webhooks) or client-side fetches.

### `services/`
The **Business Logic Layer**. This directory is decoupled from the Next.js `app` folder to ensure the core logic is framework-agnostic and reusable.
- **Responsibilities:** Complex data processing, integration with external APIs (PayPal, MailDev), and enforcement of business rules.
- **Examples:** `AuthService.ts`, `MembershipService.ts`, `PayPalService.ts`.

### `lib/`
**Infrastructure & Utilities**.
- `db.ts`: Exports the singleton Prisma client used by all layers to interact with the database.
- `auth.ts`: Contains `authOptions` for NextAuth configuration.
- Shared utility functions and common configuration.

### `components/`
The **UI Layer**.
- `ui/`: Generic, atomic UI components (Buttons, Inputs, Cards).
- `features/`: Complex components tied to specific business features (e.g., `RegisterForm`, `EmailEditor`).
- `providers/`: Context providers for authentication, error logging, and internationalization.

### `prisma/`
The **Persistence Layer**.
- `schema.prisma`: Defines the PostgreSQL database schema and relationships.
- `migrations/`: Version-controlled SQL scripts for database updates.

### `i18n/` & `messages/`
The **Internationalization Layer**.
- `messages/*.json`: Translation strings for all supported static UI elements.
- `i18n/`: Logic for locale detection, routing, and message loading using `next-intl`.

---

## 2. Security Architecture

### Authentication (NextAuth.js)
The application uses **NextAuth.js** for identity management, primarily utilizing the `CredentialsProvider`.
- **Strategy:** Stateless authentication using **JSON Web Tokens (JWT)**.
- **Verification:** Mandatory email verification before login is permitted. Verification tokens are generated and sent via `AuthService` and `MailService`.
- **Session Enrichment:** The JWT and Session objects are enriched with user `id`, `role`, and granular `permissions` to avoid redundant database lookups on every request.

### Authorization (RBAC)
A granular **Role-Based Access Control (RBAC)** system is enforced throughout the application.
- **Models:** `Role` (e.g., SUPERADMIN, ADMIN, BASIC_USER) and `Permission` (composed of an `Action` like READ/WRITE and a `Resource`).
- **Enforcement:** 
    - **Server Actions:** Manual role/permission checks at the beginning of sensitive actions.
    - **Middleware/Layouts:** Navigation guarding based on the user's role stored in the session.
    - **UI:** Conditional rendering of components based on session-provided permissions.

---

## 3. External Integrations

### Payment Lifecycle (PayPal)
Financial transactions are managed through **PayPal Subscriptions**.
- **Webhook Processing:** Asynchronous webhooks (via `app/api/webhooks/paypal/route.ts`) handle subscription events (ACTIVATED, RENEWED, CANCELLED).
- **Data Mapping:** The `custom_id` field in PayPal is used to pass `userId|tierId` to reconcile external payments with internal users.
- **Financial Audit:** Every successful payment triggers an entry in the `Transaction` table via `FinancialService`.

### Communication (Mail)
Email communication is handled by **MailService**, leveraging `nodemailer`.
- **Templates:** Dynamic emails are driven by the `EmailTemplate` model, allowing for subject and content injection.
- **Auditability:** Every sent email is recorded in the `EmailLog` table to ensure delivery tracking and troubleshooting.

---

## 4. Infrastructure & Observability

### Deployment Model
- **Staging/Local:** Docker-based environment managed by `docker-compose`. Staging is optimized for low-resource environments (e.g., Raspberry Pi).
- **Production:** Target deployment is **Google Cloud Run** for the application layer and **Cloud SQL** for the managed PostgreSQL instance, utilizing **Serverless VPC Access Connectors** for secure, private communication.
- **Asset Storage:** Static assets (avatars, sponsorship logos) are intended for cloud-native object storage (e.g., Google Cloud Storage).

### Observability & System Health
- **Structured Logging:** `LoggerService` provides centralized logging to the `SystemLog` database table, capturing `level` (ERROR, WARN, INFO) and `origin` (WEB, DATABASE, MAIL).
- **Client-Side Monitoring:** The `ErrorLogger` provider captures uncaught client-side errors and promise rejections, reporting them back to the server-side logs.
- **Audit Trails:** Database schemas include `createdAt` and `updatedAt` on all major entities to maintain a record of system changes.

---

## 5. Component Interactions

The application follows a strict data flow to maintain separation of concerns:

1.  **User Interaction:** A user interacts with a component in `components/features/`.
2.  **Trigger:** The component triggers a **Server Action** in `app/actions/`.
3.  **Logic Execution:** The Action validates the request and delegates business logic to a **Service** in `services/`.
4.  **Data Access:** The Service performs operations using **Prisma** or interacts with external providers (PayPal, Mail).
5.  **Response:** Results are returned to the Action, which handles UI-specific responses (redirects, error states).

---

## 6. Testing & Principles

- **SOLID Principles:** Decoupled logic ensures maintainability and testability.
- **Testing Strategy:**
    - **Unit Tests:** Isolated logic in services.
    - **Integration Tests:** Verifying the "Action -> Service -> DB" flow.
    - **UI Tests:** Verifying component behavior and accessibility.
    - **Coverage:** Hard requirement for **90% code coverage** for all core logic.
