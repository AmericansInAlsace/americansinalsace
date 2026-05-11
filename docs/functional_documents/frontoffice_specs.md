# Front Office Functional Specification

This document details the functional features available to end-users interacting with the main application.

## I. Authentication & User Management

*   **User Registration:**
    *   **Description:** Enables new users to create an account by providing essential details.
    *   **Functionality:** Users can submit their first name, last name, email, and password. The system hashes the password using Argon2, creates a new `User` record with a `BASIC_USER` role, and generates a verification token. An email verification process is initiated.
    *   **UI Components:** `components/features/auth/RegisterForm.tsx`
    *   **Key Services/Actions:** `AuthService.registerUser`, `MailService.sendVerificationEmail`, `app/actions/auth.ts` (Server Actions).
*   **User Login:**
    *   **Description:** Allows registered and verified users to log in to the application.
    *   **Functionality:** Utilizes NextAuth.js with a credentials provider. `AuthService.verifyCredentials` checks the Argon2 password hash against the stored password and ensures the user's email has been verified (`emailVerified` timestamp). A session is established upon successful authentication.
    *   **UI Components:** `components/features/auth/LoginForm.tsx`
    *   **Key Services/Actions:** NextAuth.js configuration, `AuthService.verifyCredentials`, `app/api/auth/` (NextAuth.js routes).
*   **Password Reset:**
    *   **Description:** Provides a secure mechanism for users to reset forgotten passwords.
    *   **Functionality:** Users can request a password reset via email. The system generates a secure `resetToken`, sends an email with a reset link, and allows the user to set a new password. `AuthService.resetPassword` updates the user's record.
    *   **UI Components:** `components/features/auth/ForgotPasswordForm.tsx`, `components/features/auth/ResetPasswordForm.tsx`
    *   **Key Services/Actions:** `AuthService.requestPasswordReset`, `AuthService.resetPassword`, `MailService`.
*   **Profile Management:**
    *   **Description:** Registered users can view and update their personal profile information.
    *   **Functionality:** Users can access their profile via the `/profile` route to edit details such as first name, last name, bio, avatar, and phone number. Changes are persisted via Server Actions.
    *   **UI Components:** `app/[locale]/profile/page.tsx`, `components/features/profile/ProfileForm.tsx`
    *   **Key Services/Actions:** `app/actions/profile.ts` (Server Actions).

## II. Membership Management (Front Office)

*   **View Membership Tiers:**
    *   **Description:** Displays available membership tiers (Young Adult, Individual, Couple, Family) with their associated benefits and annual pricing.
    *   **Functionality:** The system fetches active tiers from the database.
    *   **UI Components:** Likely integrated within `app/[locale]/membership/page.tsx`.
    *   **Key Services/API:** `GET /api/membership/tiers`, `services/MembershipService.ts`.
*   **Membership Checkout:**
    *   **Description:** Facilitates the process for users to select a membership tier and complete payment.
    *   **Functionality:** Integrates with PayPal Subscriptions. When a user selects a tier, a transaction is initiated via the PayPal JS SDK. A `custom_id` in the PayPal transaction is set as `userId|tierId` for precise mapping upon confirmation.
    *   **UI Components:** Integrated within `app/[locale]/membership/page.tsx`.
*   **View Subscription Status:**
    *   **Description:** Authenticated users can view their current membership details.
    *   **Functionality:** Displays the user's active membership tier, subscription status (`ACTIVE`, `PENDING`, `INACTIVE`), and expiration date, fetched from the `Subscription` model.
    *   **UI Components:** Displayed on the user's profile page (`/profile`).

## III. Events Management (Front Office)

*   **Event Discovery:**
    *   **Description:** Allows users to browse and discover upcoming community events.
    *   **Functionality:** Displays a list of events that are marked as `published: true`. Event summaries, pricing, and current RSVP counts are visible.
    *   **UI Components:** `app/[locale]/events/page.tsx` (and potentially sub-routes for details).
*   **Event Details View:**
    *   **Description:** Provides comprehensive information about a specific event.
    *   **Functionality:** Shows event title, description, date, location, pricing (member/non-member), and capacity.
*   **RSVP to Events:**
    *   **Description:** Enables authenticated users to register their attendance for published events.
    *   **Functionality:** Users can RSVP to events. The system tracks attendance against the `capacity` limit for each event, creating `RSVP` records.

## IV. Internationalization (i18n)

*   **Locale Handling:**
    *   **Description:** Supports multiple languages, currently English and French. Users can switch locales.
    *   **Functionality:** The application supports switching between locales, likely managed via routing and utilizing translation files (`messages/*.json`).
    *   **UI Components:** Potentially a language switcher in the UI.
    *   **Key Logic:** `i18n/request.ts`, `i18n/routing.ts`.
