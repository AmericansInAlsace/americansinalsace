# Home Page

*   **Path**: `/`
*   **Persona Access**: Public (Guest, Member, Admin)
*   **Visual Layout**:
    *   **Hero Banner**: A full-width header with a primary blue background, featuring a bold title and a descriptive tagline about the association.
    *   **Verification Banner**: A conditional top-level alert bar (green for success, red for error) appearing after email verification attempts.
    *   **Main Content (Two Columns)**:
        *   **Latest News Column (Left/Main)**:
            *   **Latest News Header**: Section title with a decorative horizontal line.
            *   **News Article**: A card displaying a featured announcement (currently "Welcome to our new platform").
            *   **Empty State/More News**: A placeholder for additional news items.
            *   **Upcoming Events Header**: Section title with a decorative horizontal line.
            *   **Upcoming Events Grid**: A grid showing the next 3 upcoming events as cards.
        *   **Side Info Column (Right/Sidebar)**:
            *   **Membership CTA Card (Guest Only)**: A high-contrast blue card with a list of membership benefits and a "Join Today" button.
            *   **Contact Us Card**: Displays contact email information.
            *   **Bug Report Card**: A CTA to open the bug reporting modal.
    *   **Footer**: Contains the AIA logo, "Quick Links", "Legal & Accessibility" links, and copyright information.

## 1. Component Specifications

### 1.1 Inputs / Forms
*   **Bug Report Modal**:
    *   Triggered by the "Report Issue" button in the sidebar.
    *   *See `BugReportModal.tsx` documentation for full field specs.*

### 1.2 Display Logic
*   **Verification Banner**:
    *   Shown only if `verified=true` or `error=[message]` is present in the URL search parameters.
    *   Green background for `verified=true`.
    *   Red background for `error=[message]`.
*   **Membership CTA (Sidebar)**:
    *   Visible only to `unauthenticated` users (Guests).
*   **Upcoming Events Grid**:
    *   Displays up to 3 events fetched from the database.
    *   If no upcoming events exist, displays a "No events scheduled" message.
*   **Hero Banner Rich Text**:
    *   The title supports rich text formatting (e.g., non-breaking spans for specific words).

### 1.3 State Management
*   **Local UI State**:
    *   `isBugModalOpen` (Boolean): Controls the visibility of the `BugReportModal`.
*   **Global State**:
    *   `useSession` (Auth): Used to determine if the user is a guest or authenticated member.

## 2. Functional Data Flow

### 2.1 Read Operations
*   **`EventService.getUpcomingEvents(3)`**: Called server-side in `UpcomingEventsSection` to hydrate the events grid.
*   **`useSession()`**: Called client-side to check authentication status.
*   **`useSearchParams()`**: Called client-side to read verification status from the URL.
*   **`useTranslations('HomePage')`**: Hydrates internationalized strings for all UI elements.

### 2.2 Write Operations
*   **Open Bug Modal**: Clicking "Report Issue" sets `isBugModalOpen` to `true`.
*   **Navigation Links**:
    *   "Join Today" -> `/register`
    *   "Read More" -> `/news` (Internal link)
    *   "View All Events" -> `/events`
    *   "Home", "News", "Events", "Sponsors" (Footer)
    *   Legal links (Footer)

## 3. Business Logic & Invariants
*   **Event Visibility**: Only events with dates in the future (Upcoming) are displayed on the home page.
*   **Priority Display**: The home page prioritizes the 3 most immediate upcoming events.

## 4. Error Handling
*   **Verification Error**: If the `error` parameter is present in the URL (e.g., expired token), a red banner displays the specific error message.
*   **Empty Events State**: Graceful fallback UI when no events are found in the database.
