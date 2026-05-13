# Backoffice: System & Communications Administration

This document specifies the functional behavior and visual layout for the system monitoring and automated communication management screens in the backoffice.

## 1. System Logs Dashboard
*   **Path**: `/backoffice/system/logs`
*   **Persona Access**: `SUPERADMIN`
*   **Visual Layout**: 
    *   **Health Chart**: A responsive bar chart at the top of the page visualizing system stability over the last 14 days.
    *   **Log Events Table**: A high-density data table below the chart listing individual log entries with filtering and search capabilities.

### 1.1 Component Specifications
#### LogChart (System Health)
*   **Type**: Multi-series Bar Chart (using `recharts`).
*   **X-Axis**: Date (Last 14 days).
*   **Y-Axis**: Count of events.
*   **Series**:
    *   **Errors**: Represented in Red (`#ef4444`).
    *   **Warnings**: Represented in Amber (`#f59e0b`).
*   **Interactivity**: Hover tooltips showing exact counts for the selected date.

#### LogTable (Event Listing)
*   **Columns**:
    *   **Time**: Formatted as `DD MMM YYYY, HH:mm:ss` (Monospaced).
    *   **Level**: Badge-styled indicators:
        *   `ERROR`: Red background.
        *   `WARN`: Amber background.
        *   `INFO`: Blue background.
        *   `DEBUG`: Purple background.
    *   **Origin**: Source of the log (e.g., `WEB`, `DATABASE`, `MAIL`, `CLIENT`).
    *   **Message**: The primary log message (truncated to 2 lines).
*   **Expansion Logic**: Clicking "View Details" on a row reveals a syntax-highlighted JSON block containing structured metadata/stack traces.

### 1.2 Functional Data Flow
*   **Read Operations**:
    *   `getLogStats()`: Aggregates daily counts of `ERROR` and `WARN` levels for the past 14 days.
    *   `getSystemLogs()`: Fetches the 100 most recent log entries.
*   **Filtering**: Client-side filtering via `DataTable` component:
    *   Search: Full-text search across message and origin.
    *   Level Filter: Dropdown to isolate specific severities.
    *   Origin Filter: Dropdown to isolate specific system components.

---

## 2. Email Delivery Logs
*   **Path**: `/backoffice/communications/logs`
*   **Persona Access**: `SUPERADMIN`, `ADMIN`
*   **Visual Layout**: A filterable list of all outbound email attempts.

### 2.1 Component Specifications
#### EmailLogTable
*   **Columns**:
    *   **Sent At**: Timestamp of the delivery attempt.
    *   **Recipient**: Email address of the target user.
    *   **Subject**: The subject line of the sent email.
    *   **Status**: Success/Failure badge (`SUCCESS` in green, `FAILED` in red).
    *   **Errors**: Raw SMTP error message (if applicable).

### 2.2 Functional Data Flow
*   **Read Operations**: Fetches the 500 most recent records from the `EmailLog` table on mount.
*   **Search**: Filters by recipient or subject.

---

## 3. Email Template Management
*   **Path**: `/backoffice/communications/templates`
*   **Persona Access**: `SUPERADMIN`, `ADMIN`
*   **Visual Layout**: A grid of cards representing automated system emails.

### 3.1 Component Specifications
#### Template Card
*   **Header**: Displays the unique system `slug` (e.g., `verification-email`).
*   **Body**: Shows the human-readable name and current subject line.
*   **Action**: "Edit Design & Content" button navigating to the editor.

#### Placeholder Reference Box
*   A persistent information box at the bottom explaining the usage of `{{placeholder}}` syntax.

---

## 4. Email Template Editor
*   **Path**: `/backoffice/communications/templates/[id]`
*   **Persona Access**: `SUPERADMIN`
*   **Visual Layout**: A split-view interface allowing toggling between code editing and visual preview.

### 4.1 Component Specifications
#### TemplateEditorForm
*   **Inputs**:
    *   **Display Name**: Text field for the internal template name.
    *   **Email Subject**: Text field for the actual subject line users will receive. Supports placeholders.
    *   **Template Content**: Rich HTML editor (via `EmailEditor`).
*   **Preview Mode**: A sandboxed view that replaces `{{placeholders}}` with realistic sample data (e.g., `John Doe`, `Annual BBQ`) to simulate the final user experience.

### 4.2 Functional Data Flow
*   **Read Operations**: Hydrates the form with data from the `EmailTemplate` table based on the route `id`.
*   **Write Operations**:
    *   `updateEmailTemplate()`: Server action that persists changes and triggers `revalidatePath('/backoffice/communications/templates')`.

### 4.3 Business Logic: Supported Placeholders
The system automatically injects data into templates based on their slug:
*   `verification-email` / `reset-password`: `{{actionUrl}}`
*   `event-rsvp-confirmation`: `{{eventTitle}}`, `{{eventDate}}`, `{{eventLocation}}`, `{{userName}}`
*   `data-export`: `{{userName}}`

---

## 5. Error Handling & Invariants
*   **Permission Gate**: Non-SUPERADMINs attempting to save template changes or view detailed system logs are blocked at the Server Action level.
*   **Logging Fail-safe**: If the database is unreachable, `LoggerService` defaults to standard console output to ensure errors are captured in container logs even during DB outages.
*   **Template Integrity**: Deleting templates is prohibited via the UI to prevent system-wide failures in automated workflows (verification, password reset).
