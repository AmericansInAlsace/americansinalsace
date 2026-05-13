# User & Role Management

## 1. User Management Screen
*   **Path**: `/backoffice/users`
*   **Persona Access**: `SUPERADMIN`, `ADMIN`
*   **Visual Layout**:
    *   **Header**: High-level summary with title "User Management" and description "Oversee all registered members, their roles, and subscription status."
    *   **User Table**: A filterable and searchable `DataTable` containing all registered users.

### 1.1 Component Specifications

#### **User Table (DataTable)**
*   **Search**: A text input with placeholder "Search name or email...". Filters the list by `firstName`, `lastName`, or `email`.
*   **Filters**:
    *   **All Roles**: Dropdown populated with all system roles.
    *   **All Tiers**: Dropdown populated with membership tier names, plus a "No Active Plan" option.
*   **Columns**:
    *   **User**: Displays a rounded avatar with user initials (`firstName[0] + lastName[0]`), the full name in bold, and the email address in a smaller font.
    *   **Status**: A badge showing if the email is verified.
        *   *Verified*: Green badge (`bg-green-100 text-green-800`).
        *   *Pending*: Yellow badge (`bg-yellow-100 text-yellow-800`).
    *   **Role**: Displays the `UserRoleSelector` dropdown.
    *   **Membership**: Shows the active tier name in blue and the subscription status (e.g., active, expired) in small text.
    *   **Joined**: The account creation date formatted as "DD MMM YYYY".
    *   **Actions**: A "View Details" button that opens the `UserDetailsModal`.

#### **UserRoleSelector**
*   **Type**: Dropdown `select` element.
*   **Options**: Dynamically populated from the `Role` table.
*   **Behavior**:
    *   Selecting a new role immediately triggers the `updateUserRole` server action.
    *   **State**: Shows a loading state (`disabled`) while the update is in progress.
    *   **Validation**: Only `SUPERADMIN` can successfully perform this action.

#### **UserDetailsModal**
*   **Visuals**: A centered overlay with a white background, scrollable content, and a sticky header.
*   **Profile Section**: Detailed display of user metadata (Status, Role, Phone, Joined Date, and Biography).
*   **Subscription Section**:
    *   If active: Shows Tier name, Status, and Renewal Date in a blue-themed card.
    *   If inactive: Displays a "No active membership plan" placeholder with a dashed border.
*   **GDPR Actions (Footer)**:
    *   **Export**: Triggers `exportUserData` to send a JSON data dump to the user's email. Includes a loading spinner.
    *   **Anonymize**: Triggers a `ConfirmationModal`. Upon confirmation, scrubs all PII from the database record. Irreversible action.

### 1.2 Functional Data Flow

#### **Read Operations**
*   On page load, the `UsersAdminPage` (Server Component) fetches:
    *   All users with their `role` and `subscription` (including `tier`).
    *   All available roles for the selector.
    *   All membership tiers for the filters.

#### **Write Operations**
*   **Update Role**: Calls `updateUserRole(userId, roleId)`. Revalidates the `/backoffice/users` path.
*   **Export Data**: Calls `exportUserData(userId)`. Service-side logic redacts internal secrets (password, tokens) and sends the JSON via `MailService`.
*   **Anonymize User**: Calls `anonymizeUserData(userId)`. 
    *   Deletes `SponsorProfile` if present.
    *   Updates `User` record with placeholder names and randomized email/password.

### 1.3 Business Logic & Invariants
*   **RBAC Protection**: Access to `/backoffice/` routes is restricted to users with `roleId` corresponding to `SUPERADMIN` or `ADMIN`.
*   **Role Assignment**: Role changes are only committed by `SUPERADMIN` personas. `ADMIN` personas may view the UI but the server action will block updates.
*   **Data Integrity**: Anonymization preserves financial records (`Transaction` table) but disconnects them from the original identity by scrubbing the user profile.

### 1.4 Error Handling
*   **Action Failures**: A standard browser `alert` is shown if role updates fail.
*   **Modal Messages**: The `UserDetailsModal` displays inline success/error messages for GDPR actions.
*   **Access Control**: Unauthorized attempts to access the page redirect to the home page via the `BackofficeLayout`.

---

## 2. Role Management Screen
*   **Path**: `/backoffice/roles`
*   **Persona Access**: `SUPERADMIN`, `ADMIN`
*   **Visual Layout**:
    *   **Defined Roles Section**: A table listing all roles, their member counts, and associated permissions.
    *   **Master Permission Matrix**: A grid view of all available `Action:Resource` pairs in the system.

### 2.1 Component Specifications

#### **Defined Roles Table**
*   **Role Name**: Bold text in primary brand blue.
*   **Users**: Count of users currently assigned to this role.
*   **Permissions**: A flex-wrap list of small blue badges in the format `resource:action` (e.g., `USERS:READ`, `EVENTS:WRITE`).
*   **Actions**: "Edit" button (currently a placeholder for future granular permission management).

#### **Master Permission Matrix**
*   Displays the full set of system permissions. Each card shows the `Action` (e.g., READ) in small uppercase and the `Resource` (e.g., financials) in bold.

### 2.2 Functional Data Flow

#### **Read Operations**
*   On page load, the `RolesAdminPage` (Server Component) fetches:
    *   All roles with their associated permissions and user counts.
    *   The master list of all permissions, ordered by resource and action.

### 2.3 Business Logic & Invariants
*   **Uniqueness**: Roles must have a unique `name`.
*   **Permission Structure**: Permissions are defined as unique combinations of an `Action` (READ/WRITE) and a `Resource` string.

### 2.4 Error Handling
*   Protected by the standard `BackofficeLayout` authorization check.
