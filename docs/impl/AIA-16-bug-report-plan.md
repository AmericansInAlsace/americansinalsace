# Implementation Plan: AIA-16 - Bug Report System

## Overview
This document outlines the implementation plan for the Bug Report System (AIA-16), allowing users to submit website issues directly to JIRA.

## 1. Research & Analysis
- **Ticket AIA-16:** Requirements include a public-facing form with a structured template and automatic JIRA ticket creation (Type: Bug).
- **Current System:** The existing `JiraService` and `ImprovementForm` handle suggestions (Type: Story) but are restricted to backoffice users.
- **Constraints:** Must be accessible to "all users".

## 2. Technical Strategy

### 2.1 JiraService Refactoring
Update `services/JiraService.ts` to allow dynamic `issuetype`.
- Current: `issuetype: { name: 'Story' }` is hardcoded.
- Change: Add `issueType?: string` to `createIssue` (defaulting to 'Story' for backward compatibility).

### 2.2 Server Action: `submitBugReport`
Create `app/actions/bugs.ts`:
- Purpose: Handle the submission from the public bug report form.
- Logic:
  - If user is logged in, use their info for the reporter.
  - If guest, allow submission but tag as "Guest Reporter" (or as per project policy).
  - Call `JiraService.createIssue` with `issuetype: 'Bug'`.

### 2.3 UI Components
Create `components/features/BugReportForm.tsx`:
- Template:
  ```text
  [STEPS TO REPRODUCE]
  1. 
  2. 
  
  [EXPECTED RESULT]
  - 
  
  [ACTUAL RESULT]
  - 
  
  [ENVIRONMENT]
  - Browser:
  - Device:
  ```
- Validation: Subject and Description required.

### 2.4 Routing
Create `app/[locale]/report-bug/page.tsx`:
- A clean, accessible page for all users to report issues.

## 3. Step-by-Step Implementation

### Phase 1: Service Enhancement
1.  **Modify `services/JiraService.ts`**:
    - Add `issueType` parameter to `createIssue`.
    - Ensure it correctly maps to the JIRA API body.

### Phase 2: Server Logic
2.  **Create `app/actions/bugs.ts`**:
    - Implement `submitBugReport` server action.

### Phase 3: Frontend Implementation
3.  **Create `components/features/BugReportForm.tsx`**:
    - Implement the form with the specified template.
4.  **Create `app/[locale]/report-bug/page.tsx`**:
    - Wrap the form in a layout consistent with the public site.

### Phase 4: Verification
5.  **Unit Tests**:
    - Test `JiraService` with different issue types.
    - Test `submitBugReport` action.
6.  **Integration Tests**:
    - Verify JIRA ticket creation with a "Bug" type.

## 4. Acceptance Criteria
- [ ] Bug report form accessible at `/report-bug`.
- [ ] Description follows the defined template.
- [ ] Submitting creates a "Bug" ticket in JIRA.
- [ ] Users receive a confirmation message with the JIRA key.
