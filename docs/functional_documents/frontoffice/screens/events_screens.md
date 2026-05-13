# Events Screens (Frontoffice)

## 1. Events Listing Screen
*   **Path**: `/events`
*   **Persona Access**: Public (All users)
*   **Visual Layout**:
    *   **Header**: Features a prominent title ("Community Events") and a descriptive subtitle.
    *   **Grid**: A responsive grid (1 col mobile, 2 md, 3 lg) displaying `EventCard` components.
    *   **Empty State**: Displays a dashed-border card with "No upcoming events scheduled" and "Check back soon" if no published events are found.

### 1.1 Component Specifications: Event Card
*   **Category Badge**: Displays the `EventCategory` name in a small, uppercase, blue-themed badge.
*   **Date/Time Display**: Shows the date in `DD MMM YYYY` format and the time in `HH:mm` (using `en-GB` locale).
*   **Content**: Title and a 3-line truncated description (`line-clamp-3`).
*   **Meta Info**:
    *   **Location**: Venue name with a pin emoji.
    *   **Attendance**: Shows current RSVPs versus Capacity (e.g., "10 / 50 attending"). Displays "Unlimited" if capacity is not set.
*   **Pricing**: Shows the member price (formatted as currency) with a "for members" label.
*   **Navigation**: A "View Details →" link pointing to `/events/[id]`.

### 1.2 Functional Data Flow
*   **Read Operations**: Fetches events on the server using `prisma.event.findMany` where `published` is true. Includes the category and the count of RSVPs.
*   **State Management**: This is a Server Component with no local client state.

---

## 2. Event Detail Screen
*   **Path**: `/events/[id]`
*   **Persona Access**: Public (View), Registered Users (RSVP)
*   **Status**: This screen is currently represented by a detailed view accessible via the `EventCard` link, though it might redirect or share logic with listing in a simplified state.

### 2.1 Component Specifications: RSVP Component
*   **Inputs**: The RSVP process is triggered by a "Register" or "RSVP" button.
*   **Display Logic**:
    *   The RSVP button is intended for authenticated users.
    *   Validation logic in the action prevents RSVP if the event is full.

### 2.2 Functional Data Flow
*   **Write Operations**: 
    *   **RSVP Action**: Calls `rsvpToEvent(eventId)`.
    *   **Validation**: Checks authentication, user existence, event existence, and capacity.
    *   **Persistence**: Upserts an `RSVP` record with `status: 'CONFIRMED'`.
    *   **Email**: Triggers `MailService.sendEventRSVPConfirmation`.
    *   **Cache**: Revalidates `/events` and `/events/[id]`.

### 2.3 Business Logic & Invariants
*   **Capacity Control**: The RSVP action strictly enforces capacity limits: `currentRSVPs >= event.capacity` throws an error.
*   **Pricing**: While displayed on the listing, the non-member price is stored in the database but currently unused in the simplified RSVP flow (which assumes member access for now).
*   **Uniqueness**: A user can only have one RSVP per event due to a unique constraint on `[userId, eventId]`.

### 2.4 Error Handling
*   **RSVP Full**: Throws "This event is full."
*   **Unauthenticated**: Throws "You must be logged in to RSVP."
*   **Not Found**: Throws "Event not found."
