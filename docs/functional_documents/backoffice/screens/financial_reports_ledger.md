# Financial Reports & Transaction Ledger

*   **Path**: `/backoffice/financials`
*   **Persona Access**: `SUPERADMIN` only.
*   **Visual Layout**: 
    *   **Header**: Title "Financial Dashboard" with an "+ Add Manual Payment" primary action button.
    *   **KPI Summary Row**: Four cards displaying high-level metrics (Total Revenue, Total Expenses, Net Profit, Total Transactions).
    *   **Analytics Section**: 
        *   **Revenue Trend**: A bar/line chart showing monthly revenue comparisons.
        *   **Transaction Breakdown**: A pie chart categorizing transactions (Subscriptions, Events, Sponsorships, etc.).
    *   **Growth Section**: A line chart showing member growth trends over time.
    *   **Ledger Table**: A comprehensive, filterable data table titled "Recent Transactions" with search and pagination capabilities.

## 2.1 Component Specifications

### KPI Cards
*   **Total Revenue**: Sum of all successful income transactions.
*   **Total Expenses**: Sum of all successful expense/refund transactions.
*   **Net Profit**: Difference between revenue and expenses.
*   **Total Transactions**: Count of all transaction records in the system.
*   **Loading State**: Pulse animation while data is being fetched.

### Transaction Table (`TransactionTable.tsx`)
*   **Columns**:
    *   **Date**: Formatted as `DD MMM YYYY` (e.g., 12 May 2024). Sortable.
    *   **User**: Displays `FirstName LastName` or `Email`.
    *   **Type**: Uppercase label (e.g., "SUBSCRIPTION PAYMENT"). Sortable.
    *   **Amount**: Bolded value with currency symbol (e.g., €50.00). Sortable.
    *   **Status**: Colored badges:
        *   `SUCCESS`: Green
        *   `PENDING`: Yellow
        *   `FAILED`: Red
    *   **Description**: Italicized text for additional context.
    *   **PayPal ID**: Monospace font for the external transaction identifier.
*   **Filters**:
    *   **Type Selection**: Membership, Sponsorship, Event, Manual.
    *   **Status Selection**: Success, Pending, Failed.
*   **Search**: Global text search across User, Description, and PayPal ID.

### Manual Payment Modal (`ManualPaymentModal.tsx`)
*   **Inputs**:
    *   **User Selection**: Dropdown/Select to associate the transaction with an existing user.
    *   **Amount**: Number input with 0.01 step.
    *   **Currency**: Text input (defaults to `EUR`).
    *   **Type**: Select (Subscription Payment, Manual Payment, Refund, Other).
    *   **Status**: Select (Pending, Success, Failed).
    *   **Description**: Textarea for notes.
    *   **Date**: Date picker (defaults to today).
*   **Validation**:
    *   User selection is required.
    *   Amount must be a positive number.
    *   All required fields must be populated before submission.

## 2.2 Functional Data Flow

### Read Operations
*   **Dashboard Hydration**: On mount, `getDashboardStats()` (Server Action) is called to populate the KPI cards.
*   **Transaction Loading**: `getAllTransactions()` (Server Action) fetches the full history for the ledger table.
*   **Service Layer**: These actions utilize `FinancialService.ts` (`getFinancialSummary`, `getTransactionHistory`) which aggregates data directly from the Prisma database.

### Write Operations
*   **Record Manual Payment**: 
    1.  User submits the `ManualPaymentModal` form.
    2.  `recordManualPaymentAction` (Server Action) is invoked.
    3.  `FinancialService.recordManualPayment` rounds the amount to 2 decimal places and creates a record in the `Transaction` table.
    4.  `revalidatePath('/backoffice/financials')` is called to refresh the dashboard and ledger.

## 2.3 Business Logic & Invariants
*   **Decimal Precision**: All monetary values are handled using `Prisma.Decimal` to prevent floating-point errors. Amounts are rounded to exactly 2 decimal places before persistence.
*   **Currency Handling**: Defaults to the system currency (configured via `NEXT_PUBLIC_CURRENCY`), but allows manual override per transaction.
*   **Role Enforcement**: Access is strictly gated to the `SUPERADMIN` role via server-side session checks in every action.
*   **Transaction Integrity**: Manual payments do not have a `paypalTransactionId` but must have a `description` and `userId`.

## 2.4 Error Handling
*   **Fetch Failures**: If the summary data fails to load, a red error alert is displayed in the dashboard area.
*   **Unauthorized Access**: If a non-admin attempts to access the route or trigger actions, a "Unauthorized" error is thrown, typically leading to the error boundary or login redirect.
*   **Form Errors**: Validation errors in the manual payment modal are displayed in a red alert box at the top of the modal.
