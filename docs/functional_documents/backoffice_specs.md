# Back Office Functional Specification

These features are administrative tools for managing the application's content, users, and operations, typically accessible to users with specific roles (e.g., `ADMIN`, `SUPERADMIN`).

## I. Event Management

*   **List All Events:**
    *   **Description:** Provides administrators with a comprehensive view of all events, including unpublished ones.
    *   **Functionality:** Displays a list of all `Event` records, regardless of their publication status.
    *   **UI Components:** `app/[locale]/backoffice/events/page.tsx`.
*   **Create/Edit Events:**
    *   **Description:** Allows administrators to add new events or modify existing ones.
    *   **Functionality:** Administrators can define event details: title, description, date, location, capacity, pricing (`memberPrice`, `nonMemberPrice`), publication status (`published` boolean), and assign them to `EventCategory` instances.
*   **Manage Event Categories:**
    *   **Description:** Enables administrators to create, edit, and manage categories used for grouping events.
    *   **Functionality:** Admins can define and organize event categories to aid in filtering and discovery.

## II. Membership Management

*   **Manage Membership Tiers:**
    *   **Description:** Administrators can configure the available membership tiers.
    *   **Functionality:** Allows management of tier details (name, description, price), activation status (`active` flag), and their corresponding PayPal plan IDs.
*   **View User Subscriptions:**
    *   **Description:** Provides an overview of all user subscriptions.
    *   **Functionality:** Admins can view a list of all `Subscription` records, including the associated user, tier, status, and dates.

## III. User Role Management

*   **View and Manage Users:**
    *   **Description:** Administrators can view a list of all registered users and manage their accounts.
    *   **Functionality:** Access to user lists, potentially including their email verification status and assigned roles.
    *   **UI Components:** Potentially related to `components/features/backoffice/UserRoleSelector.tsx`.
*   **Role Assignment:**
    *   **Description:** Enables administrators to assign roles (e.g., `BASIC_USER`, `ADMIN`, `SUPERADMIN`) to users.
    *   **Functionality:** Modifying the `roleId` for users. This determines access to back-office functionalities.

## IV. Financial Management

*   **Financial Dashboard:**
    *   **Description:** A centralized view for monitoring the organization's financial health.
    *   **Functionality:**
        *   **Summary KPIs:** Displays key metrics like Total Revenue (current vs. previous month), Active Subscriptions count, Pending Payments, and Average Transaction Value.
        *   **Revenue Charts:** Visualizes monthly revenue trends and breaks down revenue by category (Memberships, Events, Manual) using Recharts.
        *   **Subscription Trends:** Charts showing member growth over time.
        *   **Recent Transactions:** A paginated, filterable table listing all financial `Transaction` records (date, user, amount, status, type). Supports CSV export.
        *   **Manual Payment Entry:** A modal form to record offline payments (cash, check), including user selection, amount, date, description, and resource linkage.
    *   **UI Components:** `app/[locale]/backoffice/financials/page.tsx`, `KpiCards.tsx`, `RevenueChart.tsx`, `TransactionTable.tsx`, `ManualPaymentModal.tsx`.
    *   **Data Model:** Relies on `Transaction` (proposed), `Subscription`, and `User` models.
*   **Transaction History:**
    *   **Description:** Detailed view of all financial transactions, accessible via the dashboard.
    *   **Functionality:** Allows filtering by date range, transaction type, and status, with an option to export the data.

## V. Communications Management

*   **Email Template Management:**
    *   **Description:** Administrators can manage and create templates for system-generated emails.
    *   **Functionality:** Tools for editing email content, likely for transactional emails like verification, password resets, and event notifications.
    *   **UI Components:** `components/features/backoffice/TemplateEditorForm.tsx`, `components/features/backoffice/EmailEditor.tsx`.
*   **Email Log Viewing:**
    *   **Description:** Provides a log of emails sent by the system.
    *   **Functionality:** Administrators can review past email communications.
