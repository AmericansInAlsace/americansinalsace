# Implementation Plan: Centralized System Logging Dashboard

This document outlines the strategy for implementing a centralized system logging dashboard within the Backoffice. This feature will allow **Superadmins** to monitor health and performance across the entire stack.

## 1. Research & Analysis

### 1.1 Goals
- Capture logs from the **Web Server** (Node.js/Next.js actions and API).
- Capture logs from **Database** operations (Prisma middleware/extensions).
- Capture logs from the **Mail Server** (MailService integration).
- Capture **Client-side Browser** errors and critical logs.
- Provide a high-level visual summary of system health via charts.
- Offer granular filtering and search capabilities for deep-dive analysis.

### 1.2 Data Sources & Feasibility
- **Web Server:** Easy to capture via a centralized logging utility used in Server Actions and API routes.
- **Database:** Prisma `extensions` or `$use` middleware can intercept queries and errors.
- **Mail Server:** Existing `EmailLog` is specific to email delivery. We will create a general `SystemLog` that includes critical mail infrastructure errors.
- **Client Browser:** Can be achieved by exposing a `/api/system/logs` endpoint that the client can POST to in an `ErrorBoundary` or global `window.onerror`.

---

## 2. Technical Strategy

### 2.1 Data Model (`prisma/schema.prisma`)
We will introduce a `SystemLog` model to store all relevant events.

```prisma
model SystemLog {
  id        Int      @id @default(autoincrement())
  level     String   // ERROR, WARN, INFO, DEBUG
  origin    String   // WEB, DATABASE, MAIL, CLIENT
  message   String   @db.Text
  details   Json?    // Optional: stack traces, request metadata, user ID
  timestamp DateTime @default(now())

  @@index([level])
  @@index([origin])
  @@index([timestamp])
}
```

### 2.2 Centralized Logging Service (`services/LoggerService.ts`)
A singleton service to handle log creation. It will:
- Write to the database for persistence.
- (Optional) Still log to the standard console for container logs (Docker/GCP).
- Handle different log levels and origins.

### 2.3 Frontend Monitoring
- **Error Boundary:** Global React Error Boundary to catch UI crashes and send them to the server.
- **Global Listener:** Listen for unhandled promise rejections or script errors.

### 2.4 Backoffice UI
- **Route:** `/backoffice/system/logs`
- **Dashboard Layout:**
    - **Top Section:** A Bar Chart (using `recharts`) showing the count of Errors and Warnings per day over the last 14 days.
    - **Middle Section:** Filter Bar (Level, Origin, Date Range, Search).
    - **Bottom Section:** Paginated `DataTable` with the log list.

---

## 3. Execution Steps

### Phase 1: Database & Service Layer
1. **Update Schema:** Add the `SystemLog` model to `prisma/schema.prisma` and run a migration.
2. **Implement `LoggerService`:**
   - Create methods `error()`, `warn()`, `info()`, `debug()`.
   - Ensure it includes the `origin` parameter.
3. **Database Integration:**
   - Add a Prisma extension to the global `prisma` client in `lib/db.ts` to log query errors to the `SystemLog` table automatically.

### Phase 2: Capture Implementation
4. **Server Integration:**
   - Update `MailService` to log failures to `SystemLog`.
   - Update critical Server Actions (e.g., Auth, Financials) to use the new logger for errors.
5. **Client Integration:**
   - Create a `/api/system/logs` route to accept client-side logs.
   - Implement a global error handler in the Root Layout.

### Phase 3: Backoffice Development
6. **Navigation:** Update `components/ui/backoffice/Sidebar.tsx` to include "System Logs" under the "System" section.
7. **Server Actions:** Create `app/actions/system.ts` to fetch logs with filters and aggregate data for the bar chart.
8. **UI Components:**
   - **`LogChart.tsx`:** Bar chart component for daily error/warning counts.
   - **`LogTable.tsx`:** Specialized table for displaying logs with level-based color coding.
9. **Page Implementation:** Build `app/[locale]/backoffice/system/logs/page.tsx`.

---

## 4. Acceptance Criteria

### 4.1 Log Capture
- [ ] Server-side errors (Next.js actions) are automatically recorded in the database.
- [ ] Database query failures are recorded with the `DATABASE` origin.
- [ ] Browser runtime errors are sent to the server and recorded with the `CLIENT` origin.
- [ ] Mail infrastructure failures (e.g., SMTP connection) are recorded with the `MAIL` origin.

### 4.2 Dashboard & Visualization
- [ ] The Bar Chart correctly displays the last 14 days of data.
- [ ] Errors are shown in red, Warnings in amber/orange in the chart.
- [ ] The chart updates its counts correctly based on the database content.

### 4.3 Filtering & Search
- [ ] Users can filter by Log Level (Error, Warn, Info, Debug).
- [ ] Users can filter by Origin (Web, Database, Mail, Client).
- [ ] Users can filter by a custom date range.
- [ ] Users can search for specific text within the log message or details.

### 4.4 Access Control
- [ ] The "System Logs" section is only visible to and accessible by users with the `SUPERADMIN` role.

---

## 5. Final Definition of Done
- Database schema is updated and migrated.
- `LoggerService` is active and integrated into key areas of the app.
- Backoffice UI is functional, responsive, and adheres to the AIA design system.
- Performance: The dashboard remains fast even with thousands of log entries (due to proper indexing and pagination).
- No console errors in the dev environment.
