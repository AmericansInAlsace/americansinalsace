# Implementation Plan: User Impersonation

This document outlines the strategy for implementing a "User Impersonation" feature, allowing **Superadmins** and **Admins** to view the application as another user for support and troubleshooting purposes.

## 1. Research & Analysis

### 1.1 Goals
- Enable authorized staff to "log in" as any other user without knowing their password.
- Maintain a clear visual indicator that impersonation is active.
- Ensure the original admin identity is preserved to allow "stopping" the session.
- Strictly restrict access to users with `SUPERADMIN` or `ADMIN` roles.

### 1.2 Security Considerations
- **Authorization:** Only users with high-level roles should be able to trigger this.
- **Audit Logging:** Every impersonation start/stop should be logged for security auditing.
- **Session Integrity:** The impersonated session must not allow the admin to change critical security settings (like the password) of the target user, or if it does, it must be highly visible. (Standard impersonation usually allows full access as the user).
- **Data Protection:** Impersonation should be logged in the database to prevent untraceable actions.

---

## 2. Technical Strategy

### 2.1 Database & Permissions
- **New Permission:** Add `IMPERSONATE` action for the `User` resource.
- **Database Tracking:** (Optional but recommended) A `ImpersonationLog` table to track who impersonated whom and when.

### 2.2 Auth Integration (NextAuth.js)
We will utilize the `jwt` and `session` callbacks in `lib/auth.ts` to manage the impersonated state.

**JWT Changes:**
- Add `impersonatorId` (the ID of the admin).
- The `sub` (subject) of the JWT will be swapped to the target user's ID.
- A flag `isImpersonating: true` will be added.

**Mechanism:**
1. Admin clicks "Impersonate".
2. A Server Action validates permissions.
3. The server sets a secure, HTTP-only cookie `aia_impersonation_target` containing the target user's ID.
4. On the next request, the NextAuth `jwt` callback:
   - Checks for the presence of the `aia_impersonation_target` cookie.
   - If present and the requester is an Admin, it fetches the target user data.
   - It modifies the token to represent the target user but keeps the original admin ID in `impersonatorId`.

### 2.3 Server Actions
Create `app/actions/impersonate.ts`:
- `startImpersonating(targetUserId: number)`: Validates admin status, sets the target cookie, and triggers a session refresh.
- `stopImpersonating()`: Clears the target cookie and restores the original session.

### 2.4 UI Components
- **Impersonate Button:** Added to the User Management tables and `UserDetailsModal`.
- **Impersonation Banner:** A global, high-visibility banner (e.g., sticky at the top) that appears when `isImpersonating` is true. It will show "Impersonating [User Name]" and a "Stop Impersonating" button.

---

## 3. Execution Steps

### Phase 1: Preparation
1. **Update Permissions:**
   - Modify `prisma/seed.ts` to add `IMPERSONATE` to the `User` resource.
   - Assign it to the `SUPERADMIN` and `ADMIN` roles.
   - Run the seed script.
2. **Update Type Definitions:**
   - Update `types/next-auth.d.ts` to include `impersonatorId` and `isImpersonating` in the `Session` and `User` interfaces.

### Phase 2: Auth Logic
3. **Refactor `lib/auth.ts`:**
   - Update the `jwt` callback to handle the impersonation logic by checking for a specific secure cookie.
   - Ensure `session` callback passes the new fields to the client.

### Phase 3: Server Actions & API
4. **Create `app/actions/impersonate.ts`:**
   - Implement `startImpersonating` and `stopImpersonating`.
   - Use `cookies().set()` for the impersonation target.
5. **Audit Logging:**
   - Add logic to log these actions (e.g., using `console.log` or a dedicated database table).

### Phase 4: UI Implementation
6. **Impersonate Button:**
   - Update `components/features/backoffice/UserDetailsModal.tsx` to include an "Impersonate User" button, visible only if the current admin has the required permission.
7. **Global Banner:**
   - Create `components/ui/ImpersonationBanner.tsx`.
   - Add it to `app/[locale]/layout.tsx` so it appears on all pages when active.

### Phase 5: Verification
8. **Testing:**
   - Verify that only admins can start impersonation.
   - Verify that the banner appears and correctly identifies the user.
   - Verify that "Stop Impersonating" correctly restores the admin's original session.
   - Verify that the impersonated user's permissions are correctly applied (the admin should see exactly what the user sees).

---

## 4. Acceptance Criteria

### 4.1 Role-Based Access Control
- [ ] Only users with `SUPERADMIN` or `ADMIN` roles can see the "Impersonate" button in User Management.
- [ ] Non-admin users attempting to call the `startImpersonating` server action receive an unauthorized error.

### 4.2 Impersonation Session
- [ ] When impersonating, the application identity (Session) reflects the target user's details (email, name, permissions).
- [ ] The administrator does not need to enter the target user's password to initiate impersonation.
- [ ] All pages (Frontend and Backoffice) respect the impersonated user's permissions. For example, if impersonating a basic member, the Backoffice should be inaccessible.

### 4.3 Visual Feedback
- [ ] A high-contrast, sticky banner is visible at the top of every page while impersonation is active.
- [ ] The banner explicitly states the name/email of the user being impersonated.
- [ ] The banner contains a clearly labeled "Stop Impersonating" (or "Exit") button.

### 4.4 Session Termination
- [ ] Clicking "Stop Impersonating" immediately restores the administrator's original identity and permissions.
- [ ] Closing the browser tab or logging out during impersonation terminates both the impersonated and the original session (standard behavior).

### 4.5 Auditing
- [ ] A log entry is created (at minimum in the console/server logs) whenever an impersonation session starts, identifying both the admin and the target user.

---

## 5. Final Definition of Done
- Admins can initiate impersonation from the backoffice.
- The UI clearly indicates when impersonation is active.
- Admins can stop impersonation with a single click.
- Security checks prevent unauthorized impersonation.
- Documentation is updated.
