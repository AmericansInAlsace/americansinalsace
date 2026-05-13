# Technical Design Document (TDD)

This document provides granular technical specifications for core features and architectural components of the Americans in Alsace project.

## 1. Authentication & Identity Management
- **NextAuth.js Configuration:** The authentication module is encapsulated in `lib/auth.ts`, exporting `authOptions` which defines the `CredentialsProvider`.
- **Session Strategy:** Uses JWT strategy. On `signIn`, the `AuthService` validates credentials and returns a user object. The `jwt` callback is used to inject roles and permissions from the database into the token, reducing subsequent DB queries.
- **Verification Flow:** `forgot-password` and `register` flows utilize `reset-password.ts` actions to generate cryptographically secure tokens stored in the `User` model, sent via `MailService`.

## 2. Granular RBAC Implementation
- **Permission Model:** Permissions are defined as objects: `{ action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE', resource: 'USER' | 'EVENT' | 'FINANCIAL' }`.
- **Enforcement:**
    - **Global Middleware:** `authMiddleware` checks for route-level access based on session roles.
    - **Service Level:** Each action checks for the required permission before calling the underlying `Service`. E.g., `await checkPermission(user, 'CREATE', 'EVENT')`.

## 3. Financial Integration (PayPal)
- **State Machine:** Transactions follow a strict state transition model (`PENDING` -> `COMPLETED` | `FAILED` | `REFUNDED`).
- **Webhook Security:** The PayPal webhook endpoint (`app/api/webhooks/paypal/route.ts`) implements request signature verification using the PayPal SDK to ensure requests originate from the verified source.
- **Data Reconciliation:** The `custom_id` mapping pattern ensures that subscriptions triggered externally correctly update the local `Membership` and `Transaction` records.

## 4. Infrastructure & Observability Patterns
- **Deployment Specification:** Containerization via `Dockerfile` (multi-stage) targets `Google Cloud Run`. Environment-specific configuration is injected via Secret Manager at runtime.
- **Observability:** 
    - **Structured Logging:** All backend logs are emitted as JSON, ensuring compatibility with Cloud Logging.
    - **Error Boundary:** The `ErrorLogger` provider in `components/providers/` catches React-tree errors and submits them as `SystemLog` entries to ensure full lifecycle visibility.
