# Workbenches UI updates (hale-nb20-migration)

This file summarizes the UI/behavior changes made in this branch so others can review quickly.

## Create workbench (in-page wizard)

- Create workbench now uses the PatternFly **in-page wizard** pattern (not a modal).
  - Route: `/develop-train/workbenches/create`
  - Files:
    - `src/app/DevelopTrain/Workbenches/CreateWorkbenchPage.tsx`
    - `src/app/DevelopTrain/Workbenches/CreateWorkbenchPage.css`
    - `src/app/routes.tsx`
- Wizard uses **incrementally enabled steps** (users can’t skip ahead until completing the current step).

## Create workbench wizard content (Kubeflow parity, PatternFly styling)

- Wizard steps mirror the Kubeflow Workspaces frontend create flow content, but implemented with PatternFly components.
  - File: `src/app/DevelopTrain/Workbenches/CreateWorkbenchWizard.tsx`
- Logos rendered from static assets for consistent display:
  - `public/images/logos/*`
  - `src/app/assets/logos/*` (source copies)

### Properties step (workspace properties)

The Properties step was expanded to match Kubeflow’s structure:

- **Workspace name**
- **Volumes** (expandable)
  - Home directory
  - Volumes table: PVC Name / Mount Path / Read-only Access
  - Create/Edit volume modal + detach confirmation
- **Secrets** (expandable)
  - Secrets table: Secret Name / Mount Path / Default Mode
  - Attach existing secrets modal:
    - Multi-select dropdown (typeahead) with rich option rows
    - “Mounted to” labels include a teal wrench icon
    - Duplicate mount-path detection + inline error
  - Create secret modal:
    - Help text styling
    - Secret type (Opaque) shown
    - Key/value pairs with icon-only remove + left-aligned “Add key/value pair”

## Workbenches table: create → insert row + status transitions

When a workbench is created from the wizard:

- It is inserted into the Workbenches table as **Starting**
- After a few seconds it transitions to **Running**
- The insertion is **React 18 dev StrictMode-safe** (won’t insert twice)

Files:

- `src/app/DevelopTrain/Workbenches/CreateWorkbenchPage.tsx` (stores create payload in `sessionStorage`)
- `src/app/DevelopTrain/Workbenches/Workbenches.tsx` (reads payload once, inserts row, transitions status)

## Workbenches table: Start/Stop behavior (button + kebab + expanded actions)

Start/Stop is consistent across all entry points:

- Start: **Stopped → Starting → Running**
- Stop: **Running → Stopping → Stopped**

File: `src/app/DevelopTrain/Workbenches/Workbenches.tsx`

## Workbench “View details” drawer: Overview includes created details

The Overview tab shows the details created in the wizard (when present on the selected row):

- Pod config (type + CPU + Memory)
- Volumes table (PVC Name / Mount Path / Read-only Access)
- Secrets table (Secret Name / Mount Path / Default Mode)

Layout adjustments were made to align spacing with the rest of the Overview tab.

File: `src/app/DevelopTrain/Workbenches/Workbenches.tsx`

