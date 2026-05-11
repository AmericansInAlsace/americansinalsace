# Execution Plan: Reaching 90% Code Coverage (UI Suite)

## Overview
This document outlines the strategic plan to achieve 90% code coverage for the UI test suite (`tests/ui`). Achieving high coverage for UI components is critical to ensure that our user-facing interfaces, form logic, and data presentation correctly consume the business logic verified in the unit and integration suites.

## 1. Objectives
- Reach 90% coverage for the UI test suite (`tests/ui`).
- Verify full interaction and state rendering for complex components (`EmailEditor`, `EventForm`, `ProfileForm`).
- Ensure all pages in the `app/[locale]/` directory are rendered and basic elements verified.

## 2. Technical Strategy

### 2.1 Component Isolation
- Leverage the existing `vitest` + `@testing-library/react` setup.
- Continue using `vi.mock` for Next.js features (`usePathname`, `useTranslations`, `useSession`, `Link`) and complex sub-components.
- Use `mocking` patterns for Prisma-related data fetches to keep UI tests fast and predictable.

### 2.2 Coverage Priority Matrix
| Priority | Target Area | Goal |
| :--- | :--- | :--- |
| **High** | `components/features/**` | Full coverage for form-heavy components and modals. |
| **High** | `components/ui/**` | Test reusable primitives (`DataTable`, `Navbar`, `Input`). |
| **Medium** | `app/[locale]/backoffice/**` | Validate admin page rendering with varied permissions (Admin/SuperAdmin). |
| **Low** | `app/[locale]/` (Public) | Ensure basic content rendering for public pages. |

## 3. Step-by-Step Implementation

### Phase 1: Interactive Component Coverage
1. **Forms & Modals**: Implement comprehensive tests for `EmailEditor`, `EventFormModal`, `UserDetailsModal`, and `SponsorshipManager`. Focus on state transitions, validation triggers, and submission handling.
2. **Data Presentation**: Test `DataTable` and `CategoryPieChart` with varied mock data sets to ensure empty, single-entry, and multi-entry states are rendered correctly.

### Phase 2: Page-Level Coverage
3. **Backoffice Pages**: Add tests for remaining backoffice pages (e.g., `sponsors/list`, `financials/page`). Verify conditional rendering based on mocked user session roles.
4. **Public Pages**: Add lightweight tests for public pages (e.g., `sponsors`, `events`) to ensure layout and translation strings load successfully.

### Phase 3: Robustness & Refinement
5. **Mocking Utilities**: Centralize common mocks (e.g., `next-auth`, `prisma`) into a shared test utility to reduce boilerplate and improve maintainability.
6. **Coverage Audit**: Run `make coverage SUITE=ui` to identify remaining branches/files.

## 4. Acceptance Criteria
- [ ] UI suite coverage report confirms >= 90% for statements, branches, functions, and lines.
- [ ] All UI tests pass in the CI pipeline without runtime errors.
- [ ] Critical path components (forms, navbars, tables) show 100% statement coverage.
