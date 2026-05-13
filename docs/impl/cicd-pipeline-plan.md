# Execution Plan: GitHub Actions CI/CD Pipeline

**Recommended Agent:** `generalist`
**Recommended Skills:** `ci-cd-and-automation`, `quality-gatekeeper`, `unit-test-master`, `service-architect`

## Analysis
The objective is to implement a robust CI/CD pipeline using GitHub Actions that enforces code quality standards and provides a controlled path to deployment.

### Key Considerations:
1.  **Job Dependencies**: To ensure efficient use of resources and prevent testing/deploying broken builds, we will establish a linear dependency: `Build -> Test -> [Deploy Staging, Deploy Prod]`.
2.  **Coverage Enforcement**: The project already has a 90% coverage threshold defined in `vitest.config.ts`. The CI pipeline will leverage this by running `npm test -- --coverage`. Any drop below 90% will cause a non-zero exit code, failing the `test` job and blocking downstream deployments.
3.  **Manual Deployment Gates**:
    *   **Workflow Dispatch**: The entire workflow can be triggered manually for ad-hoc runs.
    *   **Environments**: For the `deploy` stages, we will utilize GitHub "Environments". This allows us to define "Protection Rules" (manual approvals) in the GitHub UI, ensuring that even if the code passes tests, a human must click "Approve" before the placeholder deployment logic executes.
4.  **Placeholder Logic**: Since actual deployment targets are not yet defined, the deploy jobs will use `echo` commands to demonstrate intent and state.

---

## Implementation Plan

### Step 1: Documentation & Setup
- Finalize this plan in `docs/impl/cicd-pipeline-plan.md`.
- Ensure the `.github/workflows` directory exists (to be created during implementation).

### Step 2: Define the Workflow Structure
Create `.github/workflows/ci.yml` with the following skeleton:
- **Triggers**: 
    - `push` to `main`.
    - `pull_request` to `main`.
    - `workflow_dispatch` (manual trigger).

### Step 3: Implement the `build` Job
- **Task**: Install dependencies and compile the Next.js application.
- **Action**: Run `npm ci` followed by `npm run build`.
- **Output**: This job serves as a "Canary" for syntax errors and build-time failures.

### Step 4: Implement the `test` Job
- **Dependency**: `needs: build`.
- **Task**: Execute all unit and integration tests with coverage reporting.
- **Action**: Run `npm test -- --coverage`.
- **Enforcement**: Verify that the job fails if Vitest reports coverage below the 90% threshold defined in `vitest.config.ts`.

### Step 5: Implement `deploy-staging` Job (Manual Placeholder)
- **Dependency**: `needs: test`.
- **Task**: Prepare for staging deployment.
- **Manual Gate**: Use `environment: staging` in the job definition.
- **Action**: `echo "Deploying to Staging..."`

### Step 6: Implement `deploy-prod` Job (Manual Placeholder)
- **Dependency**: `needs: test` (or optionally `needs: [test, deploy-staging]` for a strict promotion path).
- **Task**: Prepare for production deployment.
- **Manual Gate**: Use `environment: production` in the job definition.
- **Action**: `echo "Deploying to Production..."`

---

## Acceptance Criteria

- [ ] `.github/workflows/ci.yml` is present in the repository.
- [ ] **Dependency Check**: `test` job only runs if `build` job succeeds.
- [ ] **Dependency Check**: `deploy-*` jobs only run if `test` job succeeds.
- [ ] **Quality Gate**: The pipeline fails if any test fails.
- [ ] **Coverage Gate**: The pipeline fails if total coverage is less than 90%.
- [ ] **Manual Control**: Deployment jobs are gated by GitHub Environments (Staging/Production).
- [ ] **Documentation**: The implementation matches the steps described in `docs/impl/cicd-pipeline-plan.md`.
