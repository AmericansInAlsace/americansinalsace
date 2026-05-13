# Membership & Sponsorship Administration

## 1. Membership Administration

### 1.1 Membership Tiers Configuration
*   **Path**: `/backoffice/membership/tiers`
*   **Persona Access**: SUPERADMIN
*   **Visual Layout**: 
    *   Header with title and "+ Add New Tier" button.
    *   Data table displaying: Tier Name (with description), Price (per year), PayPal Plan ID, and Status (Active/Inactive).
    *   "Integration Tip" info card reminding admins to sync PayPal Plan IDs.
*   **Component Specs**:
    *   **Tier List Table**: Displays all active tiers fetched via `MembershipService.getActiveTiers()`.
    *   **Actions**: "Edit" and "Deactivate" buttons for each tier.
*   **Business Logic**:
    *   **PayPal Sync**: The `paypalPlanId` field is critical for connecting the local tier to the PayPal subscription engine. Changes reflect immediately on the public membership selection page.

### 1.2 Membership List (Subscribers)
*   **Path**: `/backoffice/membership/list`
*   **Persona Access**: SUPERADMIN, ADMIN
*   **Visual Layout**:
    *   Filterable `MembershipTable` showing Member Name/Email, Tier, Status, Start Date, and Renewal Date.
*   **Functional Data Flow**:
    *   **Read**: Hydrated by `prisma.subscription.findMany` with user and tier inclusions.
    *   **Write**: Managed via `MembershipActions` component using server actions:
        *   `updateSubscriptionStatus(subId, status)`: Transitions status (ACTIVE, CANCELLED, EXPIRED).
        *   `updateSubscriptionTier(subId, tierId)`: Changes the user's assigned tier.
*   **State Management**: Uses `useTransition` for non-blocking UI updates and an "Edit Membership" modal for tier changes.

---

## 2. Sponsorship Administration

### 2.1 Sponsor Tiers Configuration
*   **Path**: `/backoffice/sponsors/tiers`
*   **Persona Access**: SUPERADMIN
*   **Visual Layout**:
    *   Managed by `SponsorTierManager`, providing a CRUD interface for sponsorship levels.
*   **Functional Data Flow**:
    *   **Read**: Fetches tiers via `getSponsorTiers` action (ordered by priority).
    *   **Write**: 
        *   `createSponsorTier`: Adds new levels with price and priority.
        *   `updateSponsorTier`: Modifies existing levels.
        *   `deleteSponsorTier`: Removes a tier.

### 2.2 Sponsorship Assignments (List)
*   **Path**: `/backoffice/sponsors/list`
*   **Persona Access**: SUPERADMIN, ADMIN
*   *Visual Layout**:
    *   `SponsorshipManager` interface for assigning and editing user sponsorships.
*   **Business Logic**:
    *   **Fixed Duration**: Sponsorships created via `SponsorshipService.createSponsorship` are hardcoded to a 12-month duration.
    *   **Reactivation Logic**: Activating an EXPIRED or CANCELLED sponsorship via `updateSponsorshipStatus` resets the `startDate` to "today" and extends the `endDate` by 12 months.
*   **Data Flow**:
    *   **Search**: `searchUsersForSponsorship` allows admins to find users by name or email to assign new sponsorships.
    *   **Write**: `createSponsorshipAction` and `updateSponsorshipAction` manage the lifecycle of sponsorship records.

---

## 3. Error Handling & Invariants
*   **Role Enforcement**: All write actions are gated by `getServerSession` and role checks (SUPERADMIN for most modifications).
*   **Transaction Integrity**: Monetary values are handled as `Decimal` in the database and rounded/parsed correctly in actions to prevent floating-point errors.
*   **User Feedback**: Client-side actions include `try/catch` blocks with `alert` or console logging for error reporting.
