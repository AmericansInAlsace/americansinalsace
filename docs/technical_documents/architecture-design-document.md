# Architecture Design Document

This document details the architectural design and structure of the Americans in Alsace project. It aims to provide a clear understanding of how the application is organized, the technologies used, and the rationale behind key design decisions.

## Directory Overview

### 1. `app/` (Next.js App Router)
The **Delivery Layer**. It handles routing, middleware, and entry points for user interaction.
- `[locale]/`: Contains page routes and layouts supporting internationalization (English/French).
- `actions/`: **Server Actions**. This is the primary bridge between the UI and the Business Logic. Actions validate input and call the appropriate `services`.
- `api/`: REST API endpoints for external integrations (e.g., PayPal webhooks) or client-side fetches.

### 2. `services/`
The **Business Logic Layer**. This directory is decoupled from the Next.js `app` folder to ensure the core logic is framework-agnostic and reusable.
- **Responsibilities:** Complex data processing, integration with external APIs (PayPal, MailDev), and enforcement of business rules.
- **Examples:** `AuthService.ts`, `MembershipService.ts`, `PayPalService.ts`.

### 3. `lib/`
**Infrastructure & Utilities**.
- `db.ts`: Exports the singleton Prisma client used by all layers to interact with the database.
- Shared utility functions and common configuration.

### 4. `components/`
The **UI Layer**.
- `ui/`: Generic, atomic UI components (Buttons, Inputs, Cards).
- `features/`: Complex components tied to specific business features (e.g., `RegisterForm`, `EmailEditor`).

### 5. `prisma/`
The **Persistence Layer**.
- `schema.prisma`: Defines the PostgreSQL database schema and relationships.
- `migrations/`: Version-controlled SQL scripts for database updates.

### 6. `i18n/` & `messages/`
The **Internationalization Layer**.
- `messages/*.json`: Translation strings for all supported languages.
- `i18n/`: Logic for locale detection and message loading.

---

## Component Interactions

The application follows a strict data flow to maintain separation of concerns and adhere to SOLID principles:

1.  **User Interaction:** A user interacts with a component in `components/features/`.
2.  **Trigger:** The component triggers a **Server Action** in `app/actions/`.
3.  **Logic Execution:** The Action validates the request (e.g., schema validation) and delegates the core business logic to a **Service** in `services/`.
4.  **Data Access:** The Service performs operations using the **Prisma Client** from `lib/db.ts` or interacts with external providers (like `PayPalService`).
5.  **Response:** The Service returns results to the Action, which then returns data to the UI or handles redirects/errors.

---

## Testing & Principles

- **SOLID Principles:** The architecture is designed to keep logic decoupled, making it easier to maintain and extend.
- **Minimal Impact:** Changes should be surgical.
- **Testing Strategy:**
    - **Unit Tests:** Focused on isolated service and utility logic.
    - **Integration Tests:** Located in `tests/integration/` to verify the "Action -> Service -> DB" flow.
    - **Coverage:** Aim for at least **90% code coverage** for all core logic.
