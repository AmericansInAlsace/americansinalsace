# User Profile Screen

*   **Path**: `/profile`
*   **Persona Access**: Logged-in users (`USER`, `ADMIN`, `SUPERADMIN`).
*   **Visual Layout**: 
    *   **Header**: Page title "Member Profile" with status badges for "Active Member" (green) and "Active Sponsor" (blue) if applicable. If not a member, a "Get Membership" CTA is displayed.
    *   **Membership Details Section**: A read-only card visible only to active members showing status, join date, and renewal date.
    *   **Advertising Profile Section**: A form visible only to users with an active sponsorship for managing their community presence.
    *   **Personal Information Section**: The main profile editing form.
    *   **GDPR & Privacy Section**: Tools for data portability and account anonymization.

## 1. Component Specifications

### 1.1 Personal Information Form (`ProfileForm`)
*   **First Name**: Text input, required.
*   **Last Name**: Text input, required.
*   **Email**: Text input, disabled. Shows a hint that emails cannot be changed.
*   **Phone Number**: Tel input, optional. Placeholder for French format.
*   **Bio / About You**: Textarea, optional. Used for community interaction.
*   **Save Changes**: Primary button. Triggers `handleUpdateProfile`.

### 1.2 Advertising Profile Form (`SponsorProfileForm`)
*   **Company Name**: Text input, required.
*   **Website URL**: URL input, optional.
*   **Logo URL**: URL input, optional. Intended for icon/square assets.
*   **Short Bio**: Textarea, optional. Business description for members.
*   **Update Advertising Space**: Primary button. Triggers `updateSponsorProfileAction`.

### 1.3 GDPR & Privacy Tools
*   **Export My Data**: Button. Triggers `exportUserData`.
*   **Anonymize My Account**: Destructive button. Triggers a `ConfirmationModal` before executing `anonymizeUserData`.

## 2. Functional Data Flow

### 2.1 Read Operations
On page load, the following data is fetched via Server Components:
*   **User Record**: Fetched via `AuthService.getUserByEmail(session.user.email)`.
*   **Subscription**: Fetched via `MembershipService.getUserSubscription(user.id)`.
*   **Active Sponsorship**: Fetched via `SponsorshipService.getActiveSponsorship(user.id)`.
*   **Sponsor Profile**: Fetched via `SponsorshipService.getSponsorProfile(user.id)` (only if an active sponsorship exists).

### 2.2 Write Operations
*   **Profile Update**: `handleUpdateProfile(formData)` - Updates basic user details in the `User` table. Revalidates `/profile`.
*   **Sponsorship Update**: `updateSponsorProfileAction(data)` - Updates the `SponsorProfile` record.
*   **Data Export**: `exportUserData(userId)` - Generates a JSON blob of all user data (RSVPs, Transactions, Profile) and sends it to the user's email via `MailService`.
*   **Account Anonymization**: `anonymizeUserData(userId)` - 
    1. Deletes the `SponsorProfile`.
    2. Overwrites `User` PII (First Name to "Anonymized", Last Name to "User", Email to a unique random string).
    3. Resets sensitive tokens and passwords.
    4. Triggers `signOut` on the client side.

## 3. Business Logic & Invariants
*   **Conditional Visibility**: The "Membership Details" and "Advertising Profile" cards are strictly gated by the presence of an active subscription/sponsorship.
*   **Immutable Email**: Users cannot change their email via the profile form.
*   **Anonymization Invariant**: Financial records (`Transaction` table) are kept for accounting but become disconnected from the user's real identity as the `User` record itself is anonymized.
*   **Sponsor PII**: Anonymization explicitly deletes the `SponsorProfile` record rather than updating it, as it contains corporate identity data that is no longer valid for an anonymized user.

## 4. Error Handling
*   **Unauthorized Access**: If no session is found, the user is redirected to the home page.
*   **Missing User**: If the user record is not found in the database (e.g., after manual deletion), the page redirects to home.
*   **Update Failures**: Validation errors (e.g., missing required fields) are caught in the Server Actions and returned to the client as an `error` string, displayed in a red alert box.
*   **GDPR Failures**: Errors in export (e.g., mail server down) or anonymization are displayed as UI alerts.
