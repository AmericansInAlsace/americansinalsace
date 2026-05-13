# Event Management Admin Screens

## 1. Events Command Center
*   **Path**: `/backoffice/events`
*   **Persona Access**: `SUPERADMIN`
*   **Visual Layout**:
    *   **Header**: Page title "Events Command Center" with a subtitle description. Top-right contains a "+ Create New Event" button.
    *   **Filters**: A search bar for filtering by title or location, and dropdown filters for Category and Publication Status (Visible/Hidden).
    *   **Event Table**: A data table displaying:
        *   **Event**: Multi-line cell with Title (bold), formatted Date (e.g., "15 MAY 2026, 18:00"), and Location (italic).
        *   **Category**: A colored badge indicating the event category.
        *   **Capacity**: A fraction showing `Confirmed RSVPs / Total Capacity` (shows "∞" if no limit is set).
        *   **Prices**: Displays both Member and Guest prices with currency formatting.
        *   **Status**: Status badges: "Visible" (Green) for published, "Hidden" (Gray) for drafts.
        *   **Actions**: "Edit" link and "Attendees" placeholder button.

### 1.1 Component Specifications

#### Event Form Modal
*   **Inputs**:
    *   **Event Title**: Text input, required.
    *   **Description**: Rich text editor (utilizing `EmailEditor` component) for formatted HTML content.
    *   **Location**: Text input, required.
    *   **Date & Time**: `datetime-local` input, required.
    *   **Category**: Select dropdown populated from the `EventCategory` table, required.
    *   **Registration Limit**: Number input, optional. If empty, the event has unlimited capacity.
    *   **Member Price**: Numeric input (step 0.01), required. Default is 0.
    *   **Non-Member Price**: Numeric input (step 0.01), required. Default is 0.
    *   **Visible to Community**: Checkbox. When checked, sets the event as `published`.
*   **Display Logic**:
    *   Modal title changes based on mode: "Create New Event" vs. "Edit Event".
    *   Submit button label changes: "Create Event" vs. "Update Event".
*   **State Management**:
    *   `isSubmitting`: Disables the submit button and shows a "Saving..." label during processing.
    *   `error`: Displays a red alert box if the server action returns an error.

### 1.2 Functional Data Flow
*   **Read Operations**:
    *   The page is a Server Component that fetches all events using `prisma.event.findMany` with `include: { category: true, _count: { select: { rsvps: true } } }`.
    *   Categories are fetched using `prisma.eventCategory.findMany`.
*   **Write Operations**:
    *   **Create**: Submits the form to the `createEvent` server action.
    *   **Update**: Submits the form and event ID to the `updateEvent` server action.
    *   **Revalidation**: Successful writes trigger `revalidatePath('/backoffice/events')` to refresh the listing.

### 1.3 Business Logic & Invariants
*   **Authorization**: All operations are gated by a session check for the `SUPERADMIN` role.
*   **Price Precision**: Prices are rounded to two decimal places on the server before storage.
*   **Capacity**: Capacity is stored as an integer or `null`. RSVP counts only include "CONFIRMED" status registrations.

### 1.4 Error Handling
*   Server action errors are caught and displayed within the modal's error state.
*   Unauthorized attempts result in an "Unauthorized" error thrown from the server actions.

---

## 2. Event Categories Admin
*   **Path**: `/backoffice/events/categories`
*   **Persona Access**: `SUPERADMIN`
*   **Visual Layout**:
    *   **Header**: Title "Event Categories" and "+ Add Category" button.
    *   **Categories Table**:
        *   **Category Name**: Displayed in primary blue.
        *   **Description**: Text description or "No description" placeholder.
        *   **Events**: Numeric count of events associated with the category.
        *   **Actions**: "Edit" and "Delete" buttons.

### 2.1 Functional Data Flow
*   **Read Operations**:
    *   Server-side fetch of all categories with an event count aggregate (`_count: { select: { events: true } }`).
*   **Write Operations**: (Placeholders in current UI)
    *   "Add Category", "Edit", and "Delete" buttons are present but functional implementation is handled via standard CRUD patterns for categories.

### 2.2 Business Logic
*   **Referential Integrity**: Categories cannot be deleted if they are assigned to existing events (enforced by DB constraints).
