# Sponsor Listing

*   **Path**: `/sponsors`
*   **Persona Access**: Public (Guest, Member, Admin, Sponsor).
*   **Visual Layout**:
    *   **Hero Section**: High-impact banner with a dark blue background (`#3C3B6E`), containing a centered title with red highlights (`#E30613`) and a descriptive subtitle.
    *   **Sponsors Grid**: A responsive grid displaying active sponsors in 1 column (mobile), 2 columns (md), or 3 columns (lg).
    *   **Sponsor Cards**: White background cards with rounded corners (`2xl`), light shadow, and a subtle border. Content includes logo, name, tier badge, bio, and a website link.

## 2.1 Component Specifications

### Inputs/Forms
*   **N/A**: This is a read-only listing screen.

### Display Logic
*   **Sponsor Logo**: Uses `next/image` if `logoUrl` is provided; otherwise, displays a circular placeholder with the company's first initial.
*   **Sponsor Badge**: Displays the name of the sponsor's tier in a blue pill-shaped badge (`bg-blue-50`, `text-blue-700`).
*   **Website Link**: Only rendered if `websiteUrl` is present in the sponsor's profile.
*   **Empty State**: Renders a "No sponsors yet" message if the sponsors array is empty.

### State Management
*   **N/A**: This is a stateless Server Component.

## 2.2 Functional Data Flow

### Read Operations
*   **Hydration**: On mount, the screen calls `SponsorshipService.getAllActiveSponsors()` to retrieve the list of sponsors.
*   **Data Source**: Joins `Sponsorship` (filtered by status='ACTIVE' and date range), `SponsorTier` (for name/priority), and `SponsorProfile` (for branding details).

### Write Operations
*   **N/A**: No write actions are available on this screen.

### Optimistic Updates
*   **N/A**: No client-side state transitions occur.

## 2.3 Business Logic & Invariants
*   **Active Status**: Only sponsors with a sponsorship status of `ACTIVE` where the current date falls between `startDate` and `endDate` are displayed.
*   **Tier Sorting**: Sponsors are primarily sorted by tier `priority` (descending).
*   **Alphabetical Sorting**: Sponsors within the same tier priority are sorted alphabetically by `companyName` (ascending).

## 2.4 Error Handling
*   **Graceful Degrades**:
    *   Displays localized fallback text if biographical data or images are missing.
    *   If the database is unreachable, the standard global error boundary captures the failure.
