# Implementation Plan: Externalizing Hardcoded Configurations

This document outlines the strategy for identifying and externalizing hardcoded environment configurations within the "Americans in Alsace" codebase to improve security, flexibility, and production readiness.

## Analysis & Findings

The following areas currently rely on hardcoded values or unsafe fallbacks:

1.  **Security & Auth**: `lib/auth.ts` uses `'fallback-secret-for-dev-only'` for `NEXTAUTH_SECRET`.
2.  **Email Communications**: `services/MailService.ts` hardcodes sender name/email and SMTP defaults (localhost:1025).
3.  **Application Metadata**: `app/[locale]/layout.tsx` hardcodes SEO titles and descriptions.
4.  **Jira Integration**: `services/JiraService.ts` hardcodes the issue type as `'Story'`.
5.  **Local Setup**: `.env.example` is missing several variables used in the code.

## Execution Steps

### 1. Synchronize `.env.example`
Update the template to include:
- `NEXTAUTH_SECRET` (Required)
- `MAIL_FROM_NAME`
- `MAIL_FROM_ADDRESS`
- `SMTP_SECURE` (boolean)
- `SMTP_USER`
- `SMTP_PASS`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_DESCRIPTION`
- `JIRA_ISSUE_TYPE`

### 2. Refactor `MailService.ts`
- Replace hardcoded sender string with values from `process.env.MAIL_FROM_NAME` and `process.env.MAIL_FROM_ADDRESS`.
- Update the SMTP transporter to support authentication and secure connections based on environment variables.
- Use `process.env.NEXTAUTH_URL` consistently for action URLs.

### 3. Harden `lib/auth.ts`
- Remove the fallback for `NEXTAUTH_SECRET` to ensure the application fails fast if it's missing in production.

### 4. Configurable Metadata in `app/[locale]/layout.tsx`
- Use `process.env.NEXT_PUBLIC_APP_NAME` and `process.env.NEXT_PUBLIC_APP_DESCRIPTION` for the `metadata` object.

### 5. Update `JiraService.ts`
- Reference `process.env.JIRA_ISSUE_TYPE || 'Story'` in the `createIssue` method.

## Validation Strategy

1.  **Environment Check**: Verify that the application starts correctly with a fully populated `.env` file.
2.  **Auth Verification**: Confirm that login and session management still function correctly.
3.  **Email Testing**: Use MailDev to verify that emails are sent with the new configurable sender identities.
4.  **Test Suite**: Run all unit and integration tests to ensure no regressions.
