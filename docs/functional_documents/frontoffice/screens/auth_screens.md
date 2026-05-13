# Auth Screens (Login, Register, Forgot Password, Reset Password)

This document describes the user-facing authentication screens, including their layout, component specifications, data flow, and business logic.

---

## 1. Login Screen
*   **Path**: `/login`
*   **Persona Access**: Public (Unauthenticated)
*   **Visual Layout**:
    *   Centered container with a "Welcome Back" header and a link to the registration page.
    *   A `Card` component containing the login form.
    *   Form fields are stacked vertically with standard spacing.
    *   "Forgot Password?" link positioned below the password field, aligned to the right.

### 1.1 Component Specifications
*   **Card Title**: "Login" (localized via `Auth.login`).
*   **Card Description**: "Enter your credentials to access your account."
*   **Inputs**:
    *   **Email**: `type="email"`, `name="email"`, required, placeholder: `john@example.com`.
    *   **Password**: `type="password"`, `name="password"`, required.
*   **Buttons**:
    *   **Login**: Submit button, full width, displays a loading spinner during the `signIn` process.

### 1.2 Functional Data Flow
*   **Read Operations**: None on mount.
*   **Write Operations**:
    *   **Form Submission**: Calls NextAuth `signIn('credentials', ...)` client-side.
    *   **Successful Login**: Redirects to the homepage (`/`) and refreshes the router to update session state.
*   **Optimistic Updates**: None. Loading state is managed via `isLoading` state.

### 1.3 Business Logic & Invariants
*   **Credential Validation**: NextAuth delegates authorization to `AuthService.verifyCredentials`.
*   **Redirection**: If authentication is successful, the user is redirected to `/`.

### 1.4 Error Handling
*   **Invalid Credentials**: Displays a red alert box with the error message returned by NextAuth (e.g., "Invalid credentials" or specific messages like "Please verify your email").
*   **Network Error**: Displays a generic "Something went wrong" message.

---

## 2. Register Screen
*   **Path**: `/register`
*   **Persona Access**: Public (Unauthenticated)
*   **Visual Layout**:
    *   Centered container with a "Create an Account" header and a link to the login page.
    *   A `Card` component containing the registration form.
    *   First name and Last name fields are displayed side-by-side in a grid.
    *   Email and Password fields are stacked vertically.

### 2.1 Component Specifications
*   **Card Title**: "Create an Account".
*   **Card Description**: "Enter your details below to create your account."
*   **Inputs**:
    *   **First Name**: `name="firstName"`, required, placeholder: `John`.
    *   **Last Name**: `name="lastName"`, required, placeholder: `Doe`.
    *   **Email**: `type="email"`, `name="email"`, required, placeholder: `john@example.com`.
    *   **Password**: `type="password"`, `name="password"`, required.
*   **Buttons**:
    *   **Register**: Submit button, full width, displays a loading spinner during the registration process.

### 2.2 Functional Data Flow
*   **Read Operations**: None on mount.
*   **Write Operations**:
    *   **Form Submission**: Calls the `handleRegister` Server Action (`app/actions/auth.ts`).
    *   **Successful Registration**: Replaces the form with a success message and a "Go to Login" button.
*   **Optimistic Updates**: None. Loading state is managed via `isLoading` state.

### 2.3 Business Logic & Invariants
*   **Duplicate Emails**: The `AuthService.registerUser` (called by the action) ensures that the email is not already in use.
*   **Password Requirements**: Enforced by the backend service.

### 2.4 Error Handling
*   **Validation Errors**: Error messages from the server (e.g., "Email already in use") are displayed in a red text block below the form fields.

---

## 3. Forgot Password Screen
*   **Path**: `/forgot-password`
*   **Persona Access**: Public (Unauthenticated)
*   *Visual Layout**:
    *   Centered container with a "Reset Your Password" header and a link back to login.
    *   A `Card` component containing the request form.
    *   Single email input field.

### 3.1 Component Specifications
*   **Card Title**: "Forgot Password".
*   **Card Description**: "Enter your email and we'll send you a reset link."
*   **Inputs**:
    *   **Email**: `type="email"`, `name="email"`, required, placeholder: `john@example.com`.
*   **Buttons**:
    *   **Send Reset Link**: Submit button, full width, displays a loading spinner.

### 3.2 Functional Data Flow
*   **Read Operations**: None on mount.
*   **Write Operations**:
    *   **Form Submission**: Calls the `handleRequestReset` Server Action (`app/actions/reset-password.ts`).
*   **Optimistic Updates**: None.

### 3.3 Business Logic & Invariants
*   **Silent Fail**: For security, the server action returns success even if the email does not exist in the database, preventing user enumeration.

### 3.4 Error Handling
*   **Generic Errors**: Red alert box for system-level errors.
*   **Success Message**: Green alert box confirming the email has been sent (if account exists).

---

## 4. Reset Password Screen
*   **Path**: `/reset-password`
*   **Persona Access**: Public (via token link)
*   **Visual Layout**:
    *   Centered `Card` component.
    *   Two password fields (New and Confirm) stacked vertically.
    *   Uses a `Suspense` boundary for token retrieval from the URL.

### 4.1 Component Specifications
*   **Card Title**: "Reset Password".
*   **Card Description**: "Enter your new password below."
*   **Inputs**:
    *   **New Password**: `type="password"`, `name="password"`, required.
    *   **Confirm Password**: `type="password"`, `name="confirmPassword"`, required.
*   **Buttons**:
    *   **Update Password**: Submit button, full width, displays a loading spinner.

### 4.2 Functional Data Flow
*   **Read Operations**: Retrieves the `token` from URL search parameters on mount.
*   **Write Operations**:
    *   **Form Submission**: Calls the `handleResetPassword` Server Action (`app/actions/reset-password.ts`), passing the token and new password.
    *   **Successful Reset**: Displays a success message and redirects to `/login` after 3 seconds.
*   **Optimistic Updates**: None.

### 4.3 Business Logic & Invariants
*   **Token Requirement**: If no `token` is present in the URL, an "Invalid Link" error is displayed immediately, and the form is not rendered.
*   **Password Match**: Client-side check ensures "New Password" and "Confirm Password" are identical before calling the server action.

### 4.4 Error Handling
*   **Invalid/Expired Token**: Displays an error message returned by the `AuthService` (e.g., "Invalid or expired token").
*   **Mismatch Error**: "Passwords do not match" displayed if the confirm field differs.
