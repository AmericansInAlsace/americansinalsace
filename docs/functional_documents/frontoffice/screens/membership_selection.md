# Membership Selection Screen

*   **Path**: `/membership`
*   **Persona Access**: 
    *   **Unauthenticated**: Can view tiers but must log in to subscribe.
    *   **Authenticated (Any Role)**: Can select a tier and initiate a PayPal subscription.

## 1. Visual Layout
The screen is designed as a focused, high-conversion landing page for community membership.

*   **Header Section**: Centered title "Become a Member" with a descriptive subtitle.
*   **Tier Grid**: A responsive grid (1 column mobile, 2 columns tablet, 4 columns desktop) displaying all active membership tiers.
*   **Registration Card**: A centered, elevated card that appears once a tier is selected, containing the final call-to-action (PayPal buttons).

### 1.1 Component Specifications: Tier Cards
Interactive cards used to showcase and select a membership level.

*   **Visual States**:
    *   **Default**: White background, light gray border (`border-[var(--color-border)]`).
    *   **Hover**: Border darkens to `gray-300`.
    *   **Selected**: Red border (`border-[var(--color-primary-red)]`), 1.05x scale, subtle red ring (`ring-4 ring-red-50`), and a "Selected" badge with a pulsing indicator.
*   **Content**:
    *   **Name**: Bold font-serif heading.
    *   **Description**: Muted text describing the benefits.
    *   **Price**: Large blue currency display (`formatCurrency`) with a "/ year" suffix.

### 1.2 Component Specifications: Registration Card
Appears below the grid once `selectedTier` is set.

*   **Summary**: Displays the selected tier name and price.
*   **Mock Payment Button**: Visible only in `development` mode. Allows developers to simulate a successful PayPal webhook event.
*   **PayPal Buttons**: Integrated via `@paypal/react-paypal-js`.
    *   **Style**: Vertical layout, rectangular shape.
    *   **Integration Type**: PayPal Subscriptions (Vaulting enabled).

## 2. Functional Data Flow

### 2.1 Read Operations (Hydration)
*   **On Mount**: The screen performs a client-side fetch to `/api/membership/tiers`.
*   **Data Transformation**: The API returns an array of active tiers sorted by price.
*   **Default State**: The first tier in the returned list is automatically selected.

### 2.2 Write Operations (Subscription Initiation)
1.  **PayPal Creation**:
    *   When the user clicks the PayPal button, `createSubscription` is triggered.
    *   The client sends the `paypalPlanId` from the selected tier.
    *   A `custom_id` is generated using the pattern `{userId}|{tierId}` (e.g., `42|2`). This is critical for the webhook to map the payment back to the user.
2.  **Approval Flow**:
    *   On successful authorization, `onApprove` displays a thank-you message.
    *   The user is redirected to `/profile`.
    *   **Note**: The actual activation of the membership happens asynchronously via the PayPal Webhook (`/api/webhooks/paypal`).

### 2.3 Write Operations (Mock Payment - Dev Only)
*   Sends a POST request to `/api/webhooks/paypal` with a manually constructed payload.
*   Sets a `mock: true` flag in the body to bypass server-side signature verification.

## 3. Business Logic & Invariants
*   **Active Tiers Only**: Only membership tiers marked as `active` in the database are fetched and displayed.
*   **Authenticated Context**: Subscription buttons are hidden from unauthenticated users, replaced by a "Go to Login" redirect.
*   **One Subscription Per User**: While not strictly enforced in the UI (users can see the buttons), the `MembershipService.upsertSubscription` logic in the backend ensures a user has only one primary subscription record.

## 4. Error Handling
*   **Loading State**: A full-page loading spinner is shown while `next-auth` session status is `loading`.
*   **Unauthenticated State**: Displays a call-to-action page prompting the user to login if they attempt to access while signed out.
*   **API Failures**: If the tiers API fails, an empty grid is shown (tiers state defaults to `[]`).
*   **PayPal Errors**: Standard PayPal error messaging is handled within the `PayPalButtons` component.
