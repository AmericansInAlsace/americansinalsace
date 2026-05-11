# Execution Plan: Reaching 90% Code Coverage (Integration Suite)

## Overview
This document outlines the strategic plan to achieve 90% code coverage for the integration test suite (`tests/integration`). While unit tests have validated the core business logic, the integration tests are essential for validating API routes, database operations, and multi-service workflows.

## 1. Objectives
- Reach 90% coverage for the integration test suite (`tests/integration`).
- Ensure all API routes are tested (Status codes, error states, and valid responses).
- Validate critical system flows (Auth, Membership, Payments).

## 2. Technical Strategy

### 2.1 Database Integration
- Transition from mocking `prisma` to utilizing a dedicated integration test database.
- Use `testcontainers` or a similar approach to spin up a temporary Postgres instance during test execution to guarantee valid SQL execution and schema compatibility.

### 2.2 Coverage Priority Matrix
| Priority | Target Area | Goal |
| :--- | :--- | :--- |
| **High** | `app/api/**` | Full API route coverage, including all status code branches. |
| **High** | `app/actions/**` | Validate server-action execution with real db state. |
| **Medium** | `components/features/**` | Partial E2E coverage for main forms (using Playwright/Cypress if available). |
| **Low** | UI components | Targeted coverage for complex UI logic. |

## 3. Step-by-Step Implementation

### Phase 1: Infrastructure Setup
1. **Database Containerization**: Configure the integration suite to use a real temporary database instead of mocking `prisma`.
2. **Test Utilities**: Create a standardized `IntegrationTestHelper` to seed the temporary database with valid test data before running suites.

### Phase 2: High-Priority Coverage (API & Actions)
3. **API Route Coverage**: Implement comprehensive tests for `app/api/webhooks/paypal/route.ts` (remaining branches) and other API endpoints.
4. **Action Integration**: Implement integration tests for the remaining `app/actions` that interact heavily with the DB (e.g., `sponsorship.ts`, `backoffice.ts`).

### Phase 3: Flow Testing
5. **Critical Flows**: Implement integration tests for:
   - Authentication Flow (Login, Register, Logout).
   - Membership Flow (Tier selection, Subscription activation).
   - GDPR Flow (Data export, Anonymization).

### Phase 4: Verification & Refinement
6. **Continuous Integration**: Ensure integration tests run in the CI pipeline with the test database environment.
7. **Coverage Audit**: Run `make coverage SUITE=integration` to confirm that the 90% threshold is reached.

## 4. Acceptance Criteria
- [ ] Integration suite coverage report confirms >= 90% for statements, branches, functions, and lines.
- [ ] All integration tests pass consistently against a real database instance.
- [ ] No regressions introduced in core logic during test expansion.
