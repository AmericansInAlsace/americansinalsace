# Plan: Screen-by-Screen Functional Specification Rewrite

## 1. Goal
To create a high-fidelity documentation set that describes the application "screen-by-screen". This approach ensures that a developer in a clean-room situation can recreate the exact UI, business logic, and data flow of each view without access to the original source code.

## 2. Specification Template (Per Screen)
Each screen-specific document will follow this structure, derived from the established `events.md` standard:

### [Screen Name]
*   **Path**: The URL path (e.g., `/backoffice/events`).
*   **Persona Access**: Which roles can view this screen.
*   **Visual Layout**: Description of core UI components (e.g., "A filterable data table with columns X, Y, Z").

#### 2.1 Component Specifications
*   **Inputs/Forms**: Field labels, types, validation rules, and placeholders.
*   **Display Logic**: Conditional rendering rules (e.g., "Show 'Edit' button only if user is the owner").
*   **State Management**: Local UI states (e.g., loading, error, success modals).

#### 2.2 Functional Data Flow
*   **Read Operations**: Which services/actions are called on mount to hydrate the screen.
*   **Write Operations**: User actions (button clicks, form submits) and their corresponding Server Actions.
*   **Optimistic Updates**: Any client-side state changes that happen before server confirmation.

#### 2.3 Business Logic & Invariants
*   Specific rules enforced on this screen (e.g., "Event date cannot be in the past").

#### 2.4 Error Handling
*   Screen-specific error scenarios (e.g., "Display 404 if event ID is invalid").

---

## 3. Execution Phases

### Phase 1: Frontoffice Mapping
Systematically document all user-facing routes:
- [ ] Home Page (`/`)
- [ ] Login / Register / Forgot Password
- [ ] Membership Selection (`/membership`)
- [ ] Events Listing & Detail (`/events`, `/events/[id]`)
- [ ] Sponsor Listing (`/sponsors`)
- [ ] User Profile (`/profile`)

### Phase 2: Backoffice Mapping
Systematically document all administrative routes:
- [ ] Admin Dashboard (`/backoffice`)
- [ ] User & Role Management (`/backoffice/users`, `/backoffice/roles`)
- [ ] Membership & Sponsorship Admin
- [ ] Event Management Admin
- [ ] Financial Reports & Transaction Ledger
- [ ] System Logs & Communication Management

### Phase 3: Cross-Cutting Systems
Document global elements present across screens:
- [ ] Navigation Bar (dynamic roles/permissions)
- [ ] Footer & Bug Report Modal
- [ ] Toast Notification System
- [ ] Global Loading States

---

## 4. Verification & Consistency Check
*   Ensure all Server Actions listed in the specs exist in `app/actions`.
*   Verify that all DB constraints described align with `prisma/schema.prisma`.
*   Cross-reference `auth_rbac.md` to ensure permission levels in screen specs are accurate.

## 5. Delivery Format
Documents will be stored in:
- `docs/functional_documents/frontoffice/screens/`
- `docs/functional_documents/backoffice/screens/`
