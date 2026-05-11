# Implementation Plan: AIA-15 Automated Event Emails

## 1. Overview
This plan outlines the implementation of automated RSVP confirmation and event reminder emails, as requested in Jira ticket AIA-15.

## 2. Requirements
- **RSVP Confirmation:** Send an email immediately after a user successfully RSVPs to an event.
- **Configurable Reminders:** Events should allow up to 2 reminder emails to be scheduled (e.g., 7 days and 2 days before the event).
- **Target Audience:** All users with a "CONFIRMED" RSVP for the event.

## 3. Database Schema Updates (`prisma/schema.prisma`)

### `Event` Model
Add fields to store reminder configuration:
```prisma
model Event {
  // ... existing fields
  reminder1DaysBefore Int?
  reminder2DaysBefore Int?
}
```

### `RSVP` Model
Add fields to track sent reminders to avoid duplicate emails:
```prisma
model RSVP {
  // ... existing fields
  reminder1Sent Boolean @default(false)
  reminder2Sent Boolean @default(false)
}
```

## 4. Email Templates
Seed two new templates in the `EmailTemplate` table:
1. `event-rsvp-confirmation`: "Thank you for registering for {{eventTitle}}!"
2. `event-reminder`: "Reminder: {{eventTitle}} is coming up on {{eventDate}}!"

## 5. MailService Enhancements (`services/MailService.ts`)
Add the following methods:
- `static async sendEventRSVPConfirmation(userEmail: string, eventDetails: any)`
- `static async sendEventReminder(userEmail: string, eventDetails: any)`

## 6. Implementation Steps

### Step 1: Database Migration
- Run `npx prisma migrate dev --name add_event_reminders` after updating `schema.prisma`.

### Step 2: Update Seed Data
- Update `prisma/seed.ts` to include the new email templates.

### Step 3: Trigger RSVP Emails
- Update the RSVP creation logic (likely in a new server action `rsvpToEvent` in `app/actions/events.ts`) to call `MailService.sendEventRSVPConfirmation`.

### Step 4: Reminder Script (`scripts/send-event-reminders.ts`)
- Create a script that:
  1. Fetches all events with `published: true` occurring in the future.
  2. Identifies which events have reminders due today (based on `date` and `reminderXDaysBefore`).
  3. For each due reminder, find RSVPs where `reminderXSent` is `false`.
  4. Send emails via `MailService.sendEventReminder`.
  5. Update `RSVP` records to set `reminderXSent: true`.

### Step 5: Backoffice UI Update
- Update `EventFormModal.tsx` to include inputs for `reminder1DaysBefore` and `reminder2DaysBefore`.

## 7. Verification Plan
- **Unit Tests:** Test `MailService` template processing for event placeholders.
- **Integration Tests:**
  - Verify RSVP confirmation email is logged in `EmailLog` upon registration.
  - Verify the reminder script correctly identifies due reminders and logs successful sends.
- **Manual Verification:**
  - Create an event with a reminder set for "0 days before" (today).
  - Register a user.
  - Run the reminder script and check MailDev for both emails.
