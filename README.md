EcoTrack – Front-End (React SPA)

Scope (Journeys covered in UI)

- Onboarding (login + site setup)
- Frameworks & Thresholds (Compliance)
- Metrics & Ingest Token UX
- Dashboard overview (status & KPIs)

Stack

- React 18 + TypeScript
- Vite
- React Router
- shadcn/ui (Radix primitives + Tailwind)
- AWS Amplify (API client)

---

1. Architecture & Routing

Vite Dev Server / Amplify Hosting └── React SPA (React Router) ├─
Dashboard page ├─ Compliance / Thresholds page ├─ Sites page └─ Ingest
Tokens page (Generate API tokens for metrics ingestion)

- Routing handled by React Router.
- Layout components (header/side-nav) wrap all protected pages.
- All backend calls go through Amplify API → API Gateway → Lambdas.

---

2. Pages & User Journeys

2.1 Dashboard

- Displays KPIs and overall site compliance status.
- Shows:
  - Site list with OK / WARN / CRIT states.
  - Latest PUE/WUE/CUE metrics.
  - Shortcuts to Compliance and Site pages.

  2.2 Compliance / Thresholds (Journey 2)

- Framework multi-select:
  - GMDC_SG_2024
  - CORP_DEFAULT
  - SLA_STRICT
  - GDCR_SG_2034, etc.
- Drag-to-reorder precedence.
- PUE mode:
  - Static
  - Load-aware bands (25/50/75/100% load)
- Threshold editor:
  - Editable WARN/CRIT values for PUE/WUE/CUE
  - “Comparator is ≤. Breach occurs when measured > threshold.”
- APIs used:
  - GET /frameworks
  - GET /site_frameworks
  - POST /site_frameworks
  - GET /thresholds
  - POST /thresholds

  2.3 Sites (Journey 1)

- Site list: name, country, timezone.
- Add Site modal:
  - Name
  - Country
  - Timezone
- APIs used:
  - GET /sites
  - POST /sites

  2.4 Ingest Tokens (Journey 3 support)

- Generate new ingestion token (plaintext shown once).
- List masked tokens.
- Metadata: name, created_at, last_used_at.
- APIs used:
  - POST /ingest_tokens
  - GET /ingest_tokens

---

3. App Structure & Layout

src/ main.tsx App.tsx api/ components/ pages/ dashboard/ compliance/
sites/ ingest-tokens/ context/ EcoAuthContext.tsx EcoAuthProvider.tsx
lib/ utils.ts types.ts

- Sidebar layout wraps all protected pages.
- Top navigation bar includes user info + sign-out.

---

4. State, Auth & Context

Auth handled via EcoAuthProvider: - Stores: - accessToken - userName,
email, roles - isLoading, isRestored - Provides: - login() - logout() -
session restoration - Injects Authorization header for authenticated
calls.

---

5. API Integration (Amplify)

All backend calls made via AWS Amplify API.

Example helper:

    async function apiPost(path, body, token) {
      return post({
        apiName: "BackendApi",
        path,
        options: {
          body,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        }
      }).response;
    }

Used by: - /auth/login - /sites - /frameworks - /site_frameworks -
/thresholds - /ingest_tokens - /reports

---

6. Environment Variables

Variable Description

---

VITE_AMPLIFY_REGION AWS region
VITE_AMPLIFY_API_NAME Amplify API name
VITE_AMPLIFY_API_ENDPOINT Backend base URL
VITE_APP_ENV local / dev / prod

---

7. UI Components & Design System

- Built using shadcn/ui components:
  - Buttons, Cards, Tables, Forms, Dialogs
- Tailwind for spacing & layout
- Icons from lucide-react
- Shared components:
  - SiteSelector
  - FrameworkMultiSelect
  - ThresholdEditor
  - TokenList
  - Page headers, breadcrumbs

---

8. Local Development

Install & run:

    npm install
    npm start

Runs at: http://localhost:3001

Ensure .env.local contains valid Amplify API values.

---

9. Build & Deploy (Amplify Hosting)

Amplify YAML example:

    frontend:
      phases:
        preBuild:
          commands:
            - npm install
        build:
          commands:
            - npm build
      artifacts:
        baseDirectory: dist
        files:
          - '**/*'

Amplify hosts the SPA at:

https://main.dsjpt9q46sspn.amplifyapp.com/

---

10. Appendix: Example UI Flow

Onboarding / Sites

1.  Login
2.  Go to Sites
3.  Add a new site
4.  Appears immediately on Dashboard & Compliance pages

Compliance / Thresholds

1.  Select a site
2.  Choose frameworks
3.  Adjust thresholds
4.  Save → backend upserts rules

Ingest Tokens

1.  Go to Tokens page
2.  Generate a new token
3.  Copy plaintext token
4.  Use in ingestion pipeline via X-Api-Key header

---

End of document.
