# Admin Dashboard

The Admin Dashboard provides a high-level overview of the community's health, including membership growth, financial performance, and quick access to administrative modules. It serves as the primary entry point for users with `SUPERADMIN` or `ADMIN` roles.

*   **Path**: `/backoffice` (and `/backoffice/financials` for extended metrics)
*   **Persona Access**: `SUPERADMIN`, `ADMIN`
*   **Visual Layout**:
    *   **KPI Summary Grid**: A responsive grid (1 to 4 columns) of cards showing critical community counts.
    *   **Quick Actions Grid**: A collection of interactive cards linking to management modules.
    *   **Financial Overview (Extended)**: Detailed financial KPIs and trend charts.
    *   **Recent Activity**: A list of the latest transactions.

## 1. Component Specifications

### 1.1 KPI Stat Cards
*   **Total Registered Users**: Total count of `User` records. (Icon: 👥, Color: Blue)
*   **Active Members**: Count of `Subscription` records with `status: 'ACTIVE'`. (Icon: ✅, Color: Green)
*   **Pending Payments**: Count of `Subscription` records with `status: 'PENDING'`. (Icon: ⏳, Color: Yellow)
*   **Active Tiers**: Count of `MembershipTier` records with `active: true`. (Icon: 💎, Color: Purple)
*   **Financial KPIs** (Used in Financial Dashboard):
    *   **Total Revenue**: Sum of all credit transactions.
    *   **Total Expenses**: Sum of all debit transactions.
    *   **Net Profit**: Revenue minus Expenses.
    *   **Total Transactions**: Count of all records in the `Transaction` table.

### 1.2 Data Visualization Components
*   **Revenue Trend (`RevenueChart`)**:
    *   **Type**: Multi-line chart (Current Revenue vs. Previous Revenue).
    *   **X-Axis**: Time period (e.g., Month).
    *   **Y-Axis**: Monetary value (formatted as currency).
    *   **Features**: Legend, Tooltip with currency formatting, Cartesian grid.
*   **Transaction Breakdown (`CategoryPieChart`)**:
    *   **Type**: Donut chart.
    *   **Segments**: Categorized by transaction source (Subscriptions, Event Tickets, Sponsorships, etc.).
    *   **Legend**: Shows category names and colors.
    *   **Tooltip**: Displays absolute value and percentage of total.
*   **Member Growth (`MemberGrowthChart`)**:
    *   **Type**: Multi-line chart (Active Members vs. New Members).
    *   **X-Axis**: Date.
    *   **Y-Axis**: Count.
    *   **Features**: Legend, Tooltip, Cartesian grid.

### 1.3 Quick Actions
*   **Navigation Links**: Large cards with icons and dashed borders.
    *   **Membership Tiers**: Links to `/backoffice/membership/tiers`.
    *   **Active Memberships**: Links to `/backoffice/membership/list`.
    *   **Manage Users**: Links to `/backoffice/users`.
    *   **Email Templates**: Links to `/backoffice/communications/templates`.

## 2. Functional Data Flow

### 2.1 Read Operations
*   **Basic Hydration**: On mount, the main dashboard performs direct Prisma counts:
    *   `prisma.user.count()`
    *   `prisma.subscription.count({ where: { status: 'ACTIVE' } })`
    *   `prisma.subscription.count({ where: { status: 'PENDING' } })`
    *   `prisma.membershipTier.count({ where: { active: true } })`
*   **Financial Hydration**: The dashboard metrics are fetched via Server Actions:
    *   `getDashboardStats()`: Calls `FinancialService.getFinancialSummary()` to calculate revenue, expenses, and profit.
    *   `getAllTransactions()`: Fetches the full transaction list with associated user details for the Recent Activity table.

### 2.2 Write Operations (Via Management Modules)
While the dashboard is primarily read-only, it provides entry points to write operations:
*   **Manual Payments**: Triggered via `recordManualPaymentAction` in the financials section.
*   **Status Updates**: Links to user/membership management allow for role or status changes via `updateUserRole` and `updateSubscriptionStatus`.

## 3. Business Logic & Invariants
*   **Role Enforcement**: Access is strictly limited to `SUPERADMIN` and `ADMIN` roles. Role-based redirection is handled at the layout level.
*   **Financial Accuracy**: Financial stats are calculated server-side to ensure consistency with the transaction ledger.
*   **Currency Handling**: All monetary values are processed as `Prisma.Decimal` and formatted using `formatCurrency` utility to avoid floating-point errors.

## 4. Error Handling
*   **Unauthorized Access**: If a non-admin user attempts to access `/backoffice`, they are redirected to the root (`/`) by `BackofficeLayout`.
*   **Data Fetch Failures**: If `getDashboardStats` or `getAllTransactions` fails, a red error alert is displayed instead of the charts/stats, prompting the user to try again later.
*   **Loading States**: `Suspense` is used with a pulse-animation skeleton for KPI cards while financial data is being fetched.
