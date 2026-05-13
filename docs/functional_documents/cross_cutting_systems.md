# Cross-Cutting Systems

This document describes the global systems and UI components that persist across multiple routes or provide universal functionality (Navigation, Footer, Bug Reporting, Toasting/Feedback, and Global Error Handling).

## 1. Global Navigation (Navbar)

*   **Path**: Persistent at the top of all routes (defined in `app/[locale]/layout.tsx`).
*   **Persona Access**: Accessible to all users (Guest, Member, Admin). Content varies by role.
*   **Visual Layout**: 
    *   Sticky header (`z-50`) with white background and border-bottom.
    *   **Desktop**: Left-aligned logo and name, centered/left-aligned main links, right-aligned user actions (Profile, Login/Register, Backoffice), and locale switcher.
    *   **Mobile**: Hamburger menu for navigation, quick locale toggle.

### 1.1 Component Specifications
*   **Links (Guest)**: Home, Sponsors, Login, Register.
*   **Links (Authenticated)**: Home, Sponsors, Membership, Profile, Logout.
*   **Links (Backoffice Access)**: Adds a highlighted "Backoffice" button for users with `READ` permission on the `Backoffice` resource.
*   **Locale Switcher**: Buttons for "EN" and "FR" using `next-intl` for routing and state.
*   **Display Logic**: 
    *   "Backoffice" button only visible if user has appropriate permissions.
    *   "Membership" link only visible if authenticated.
    *   Current locale button is highlighted (`bg-blue-100`).

### 1.2 Functional Data Flow
*   **Session Management**: Uses `next-auth/react` (`useSession`) to retrieve user state and permissions.
*   **Internationalization**: Uses `next-intl` (`useTranslations`, `useLocale`, `usePathname`, `useRouter`) for localized strings and locale-aware navigation.
*   **Logout**: Triggers `signOut({ callbackUrl: '/' })`.

### 1.3 State Management
*   **Mobile Menu**: Local boolean state `isMenuOpen` to toggle the full-screen overlay.
*   **Loading State**: Displays a pulse skeleton for the auth section while `status === 'loading'`.

---

## 2. Global Footer

*   **Path**: Currently implemented in the Homepage (`app/[locale]/HomePageClient.tsx`), intended for global persistence.
*   **Persona Access**: Accessible to all.
*   **Visual Layout**: Dark theme (`bg-[var(--color-gray-900)]`) with three columns:
    *   **Column 1**: Logo, Branding, and Mission Statement.
    *   **Column 2**: "Quick Links" (Home, News, Events, Sponsors).
    *   **Column 3**: "Legal & Accessibility" (Accessibility Statement, Privacy Policy, Legal Mentions).
    *   **Bottom Bar**: Copyright notice and accessibility compliance status.

---

## 3. Bug Reporting System

*   **Path**: Triggered via modal from the Homepage (and potentially other routes).
*   **Persona Access**: Accessible to all users (Guests and Authenticated).

### 3.1 Component Specifications
*   **BugReportModal**: A wrapper modal with a success popover.
*   **BugReportForm**:
    *   **Subject (Input)**: Required, text.
    *   **Description (Textarea)**: Required, uses a pre-filled markdown template (Steps to Reproduce, Expected/Actual Results, Environment).
*   **Success Popover**: Displays a confirmation message and the JIRA Ticket ID after successful submission.

### 3.2 Functional Data Flow
*   **Write Operation**: On submit, calls the Server Action `submitBugReport` (`app/actions/bugs.ts`).
*   **JIRA Integration**: The server action sends data to the JIRA API and returns a `jiraKey`.

---

## 4. Feedback & Notification Systems (Toasting/Banners)

The application currently uses contextual banners and modals instead of a floating toast library.

### 4.1 Verification Banner
*   **Visual Layout**: Full-width top banner on the Homepage.
*   **States**:
    *   **Success (Green)**: "Your email has been successfully verified!"
    *   **Error (Red)**: Displays error message if verification failed.
*   **Trigger**: Presence of `verified=true` or `error=...` in URL search parameters.

### 4.2 Success Popovers
*   Used in `BugReportModal` and potentially other transaction flows to provide high-impact confirmation of success.

---

## 5. Global Error & Loading Systems

### 5.1 Error Logger
*   **Path**: Invisible component rendered in `app/[locale]/layout.tsx`.
*   **Functional Data Flow**:
    *   Listens to `window.error` and `window.unhandledrejection`.
    *   Sends error details (message, filename, stack trace) to `/api/system/logs` via POST.

### 5.2 Global Loading States
*   **Navbar Pulse**: Skeleton loaders for auth-dependent elements during session hydration.
*   **Button Loading**: All `Button` components support an `isLoading` prop which replaces text with a spinner and disables the button.
*   **Form States**: Local `isSubmitting` states in forms (e.g., Bug Report, Login) to prevent double submissions.

---

## 6. Business Logic & Invariants
*   **RBAC Persistence**: Navbar navigation and Backoffice access are strictly governed by the permissions array found in the `session.user` object.
*   **Locale Persistence**: Navigation between routes preserves the current locale prefix (e.g., `/fr/events` -> `/fr/sponsors`).
