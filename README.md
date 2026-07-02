# ResumePilot AI

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.10-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)

**AI-powered resume review SaaS** — upload a PDF resume, receive structured ATS analysis, and chat with AI about improvements.

---

# Overview

ResumePilot AI helps job seekers improve their resumes before recruiters review them. Users upload a PDF, receive AI-generated feedback on ATS compatibility, grammar, formatting, missing skills, and actionable recommendations, then ask follow-up questions in a resume-scoped chat.

**Who it is for**

- Job seekers who want structured resume feedback
- Developers evaluating a production-style full-stack SaaS MVP

**Why it exists**

Most resume tools either score superficially or provide unstructured AI text. ResumePilot AI combines file upload, PDF text extraction, structured Gemini output, persistent analysis history, and grounded resume chat in one authenticated workspace.

**Overall workflow**

1. User signs up or signs in with email and password.
2. User uploads a PDF resume (max 5 MB).
3. UploadThing stores the file and triggers server-side processing.
4. The server extracts PDF text, sends it to Gemini, validates JSON output, and saves results in PostgreSQL.
5. User reviews ATS scores, findings, and missing skills on the dashboard.
6. User starts a chat thread tied to a specific resume and asks grounded follow-up questions.

---

# Features

Implemented features in this repository:

- **Marketing landing page** with product overview and sign-up CTAs
- **Authentication** — email/password signup, login, logout via Auth.js Credentials provider
- **Password security** — bcrypt hashing with 12 rounds and strong password validation
- **Protected routes** — `/dashboard/*` requires authentication via Next.js 16 route proxy (`proxy.ts`)
- **JWT sessions** — 30-day session lifetime with user id and role in the session token
- **Dashboard overview** — welcome card, statistics, recent uploads, and quick actions
- **Resume PDF upload** — UploadThing integration with client and server validation
- **Upload constraints** — PDF only, maximum 5 MB, single-file upload
- **Upload progress UI** — validating, uploading, saving, success, and error states
- **PDF text extraction** — server-side extraction with retry logic and host allowlisting
- **AI resume analysis** — Gemini structured JSON output with Zod validation
- **Analysis results** — ATS score, overall score, summary, strengths, weaknesses, missing skills, grammar, formatting, and recommendations
- **Analysis history** — list and detail views for past analyses
- **Resume management** — create draft, rename, soft delete, and list uploads
- **Resume title generation** — automatic title from uploaded PDF filename
- **Open uploaded PDFs** — direct links to stored resume files from analysis and resume views
- **Start chat from resume list** — create a chat thread for analyzed resumes from the resumes page
- **Resume-scoped AI chat** — thread creation, message history, chat index, and grounded responses
- **Chat safeguards** — resume-only context, truncated history, and anti-hallucination prompt rules
- **Settings page** — read-only profile display (name and email)
- **Responsive dashboard UI** — persistent sidebar on large screens, mobile sheet navigation
- **Loading and empty states** — skeleton loaders and reusable empty-state components
- **Error handling** — global and dashboard-specific error boundaries, plus a custom not-found page
- **Form accessibility** — ARIA labels and error associations on auth and chat forms
- **Security headers** — `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and `X-DNS-Prefetch-Control`
- **Automated tests** — Vitest unit and integration test suite with mocked external services

---

# Tech Stack

| Category | Technologies |
|---|---|
| **Frontend** | Next.js 16.2.10 App Router, React 19.2.4, TypeScript 5, Tailwind CSS 4, shadcn/ui, Lucide React 1.23 |
| **Backend** | Next.js Server Components, Server Actions, API Routes |
| **Database** | PostgreSQL |
| **ORM** | Prisma 7.8.0 with `@prisma/adapter-pg` 7.8.0 and `pg` 8.22 |
| **Authentication** | Auth.js v5 (`next-auth` 5.0.0-beta.31), Credentials provider, JWT sessions, Prisma adapter |
| **AI** | Google Gemini via `@google/genai` 2.10.0 (`gemini-2.5-flash` in `.env.example`; code fallback: `gemini-2.0-flash`) |
| **File Upload** | UploadThing 7.7 (`uploadthing`, `@uploadthing/react` 7.3) |
| **PDF Processing** | `pdf-parse` 2.4.5, `pdfjs-dist` (server-externalized in `next.config.ts`) |
| **Validation** | Zod 4.4.3 |
| **Password Hashing** | bcrypt 6.0 |
| **Testing** | Vitest 4.1.9, React Testing Library 16.3, `@testing-library/jest-dom` 6.9, MSW 2.14 |
| **Linting** | ESLint 9 with `eslint-config-next` 16.2.10 |
| **Deployment target** | Vercel (recommended) |

---

# Architecture

ResumePilot AI follows a feature-based architecture inside a Next.js monolith. Server Components fetch data directly from Prisma. Mutations use Server Actions. External integrations (UploadThing, Gemini) are isolated in `src/server/` and feature service layers.

## Layers

| Layer | Responsibility |
|---|---|
| **Client** | React UI, form submission, upload progress, and client-side validation |
| **Server** | Auth, Server Actions, UploadThing route handlers, AI orchestration |
| **Database** | PostgreSQL via Prisma for users, resumes, analyses, and chat history |
| **AI Layer** | Gemini content generation with structured JSON schema for analysis and prompt-grounded chat |
| **File Upload Flow** | UploadThing stores PDFs, then server callbacks create resume records and run analysis |

## Architecture diagram

```mermaid
flowchart LR
    User["User Browser"]
    Next["Next.js App Router"]
    Proxy["proxy.ts Auth Guard"]
    Actions["Server Actions"]
    UploadAPI["/api/uploadthing"]
    AuthAPI["/api/auth"]
    Prisma["Prisma Client"]
    PG["PostgreSQL"]
    UploadThing["UploadThing"]
    Gemini["Google Gemini"]
    PDF["pdf-parse"]

    User --> Next
    Next --> Proxy
    Proxy --> Actions
    Next --> UploadAPI
    Next --> AuthAPI
    Actions --> Prisma
    UploadAPI --> UploadThing
    UploadAPI --> Prisma
    UploadAPI --> PDF
    UploadAPI --> Gemini
    Prisma --> PG
    AuthAPI --> Prisma
```

## File upload and analysis flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Upload Component
    participant UT as UploadThing
    participant S as Server Callback
    participant P as pdf-parse
    participant G as Gemini
    participant DB as PostgreSQL

    U->>C: Select PDF
    C->>C: Validate type and size
    C->>UT: Upload file
    UT->>S: onUploadComplete
    S->>DB: Create Resume + ResumeVersion
    S->>P: Extract text from PDF URL
    P-->>S: Resume text
    S->>G: Structured analysis prompt
    G-->>S: JSON analysis
    S->>S: Validate with Zod
    S->>DB: Save findings, scores, skills
    S-->>C: Upload result metadata
```

---

# Folder Structure

```text
resumepilot-ai/
├── prisma/
│   ├── migrations/              # Database migration history
│   └── schema.prisma            # Prisma data model
├── public/                      # Static assets
├── src/
│   ├── app/
│   │   ├── (auth)/              # Sign-in and sign-up routes
│   │   ├── (dashboard)/         # Authenticated dashboard routes
│   │   ├── (marketing)/         # Public landing page
│   │   ├── api/                 # Auth.js and UploadThing route handlers
│   │   ├── error.tsx            # Global error boundary
│   │   ├── loading.tsx          # Global loading state
│   │   └── not-found.tsx        # Custom 404 page
│   ├── components/
│   │   ├── layout/              # Shared layout components (dashboard shell)
│   │   ├── shared/              # Reusable shared UI (empty states)
│   │   └── ui/                  # shadcn/ui primitives
│   ├── features/
│   │   ├── analysis/            # AI analysis prompts, schemas, services, UI
│   │   ├── auth/                # Auth actions, forms, schemas
│   │   ├── chat/                # Resume chat actions, services, UI
│   │   ├── dashboard/           # Dashboard overview components
│   │   └── resumes/             # Resume CRUD, upload, queries, services
│   ├── lib/                     # Shared utilities (formatting, uploadthing client)
│   ├── server/
│   │   ├── ai/                  # Gemini client configuration
│   │   ├── auth/                # Auth.js config, session helpers, middleware
│   │   ├── db/                  # Prisma client initialization
│   │   ├── security/            # Password hashing utilities
│   │   └── upload/              # UploadThing router and handlers
│   └── types/                   # Shared TypeScript types
├── tests/
│   ├── helpers/                 # MSW server and test utilities
│   ├── integration/             # Auth boundary, upload route, analysis service tests
│   ├── unit/                    # Schema, parsing, utility, and component tests
│   └── setup.tsx                # Vitest global setup and mocks
├── proxy.ts                     # Next.js 16 route protection proxy
├── prisma.config.ts             # Prisma 7 configuration
├── vitest.config.ts             # Test runner configuration
└── next.config.ts               # Next.js config and security headers
```

### Important folders

| Folder | Purpose |
|---|---|
| `src/app/(dashboard)` | Protected pages for overview, resumes, analysis, chat, and settings |
| `src/features/*` | Feature modules with actions, services, schemas, queries, and components |
| `src/server/*` | Server-only infrastructure (auth, database, AI, uploads) |
| `tests/` | Automated test suite with mocked external dependencies |
| `prisma/` | Database schema and migrations |

---

# Installation

### Prerequisites

- Node.js 20+
- PostgreSQL 14+ (16+ recommended)
- UploadThing account and token
- Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/himanshu-siddh/ResumePilot-AI.git
cd ResumePilot-AI
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Update `.env` with your local database credentials and API keys.

### 4. Set up the database

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Useful scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript checks |
| `npm run test` | Run test suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Apply database migrations |

---

# Environment Variables

| Name | Purpose | Required? | Example |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string for Prisma | Yes | `postgresql://postgres:postgres@localhost:5432/resumepilot_ai?schema=public` |
| `AUTH_SECRET` | Auth.js session encryption secret | Yes in production | `replace-with-a-strong-random-secret` |
| `AUTH_URL` | Canonical application URL for Auth.js | Recommended | `http://localhost:3000` |
| `AUTH_TRUST_HOST` | Trust host header in development or behind proxies | Recommended | `true` |
| `UPLOADTHING_TOKEN` | UploadThing API token for file uploads | Yes | `replace-with-your-uploadthing-token` |
| `GEMINI_API_KEY` | Google Gemini API key for analysis and chat | Yes | `replace-with-your-gemini-api-key` |
| `GEMINI_RESUME_ANALYSIS_MODEL` | Gemini model used for resume analysis | Optional | `gemini-2.5-flash` |
| `GEMINI_RESUME_CHAT_MODEL` | Gemini model used for resume chat | Optional | `gemini-2.5-flash` |
| `NODE_ENV` | Runtime environment (`development`, `production`) | Set by Node.js / hosting platform (do not commit) | `development` |

> **Note:** Never commit real secrets. Use `.env` locally and configure the same variables in your deployment platform.

For hosted PostgreSQL databases that require SSL, use an explicit SSL mode in `DATABASE_URL`, for example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=verify-full"
```

---

# Database

## Database engine

PostgreSQL is the primary datastore.

## Prisma setup

- Schema: `prisma/schema.prisma`
- Config: `prisma.config.ts`
- Client: `src/server/db/prisma.ts` using `@prisma/adapter-pg` and a `pg` connection pool

## Migration process

**Local development:**

```bash
npm run prisma:generate
npm run prisma:migrate
```

**Production:**

```bash
DATABASE_URL="your-production-database-url" npx prisma migrate deploy
```

Migrations are stored in `prisma/migrations/`.

## Main entities

| Model | Purpose |
|---|---|
| `User` | Application users with credentials and role |
| `Resume` | Resume workspace record with soft-delete support |
| `ResumeVersion` | Uploaded PDF metadata, extracted text, and processing status |
| `ResumeAnalysis` | AI analysis run with scores, summary, and status |
| `AnalysisFinding` | Structured strengths, weaknesses, grammar, formatting, and recommendations |
| `MissingSkill` | Skills identified as useful additions |
| `ChatThread` | Resume-scoped conversation container |
| `ChatMessage` | Individual user and assistant chat messages |
| `Account`, `Session`, `VerificationToken` | Auth.js adapter tables |

### Relationships

- A `User` owns many `Resume`, `ResumeAnalysis`, and `ChatThread` records
- A `Resume` has many `ResumeVersion` records (schema supports versioning)
- A `ResumeVersion` has many `ResumeAnalysis` records
- A `ResumeAnalysis` has many `AnalysisFinding` and `MissingSkill` records
- A `ChatThread` belongs to one `Resume` and contains many `ChatMessage` records

---

# AI Integration

## Models

Configured through environment variables:

- **Resume analysis:** `GEMINI_RESUME_ANALYSIS_MODEL` (default in `.env.example`: `gemini-2.5-flash`)
- **Resume chat:** `GEMINI_RESUME_CHAT_MODEL` (default in `.env.example`: `gemini-2.5-flash`)

If env vars are omitted, the code falls back to `gemini-2.0-flash`.

## Resume analysis flow

1. Upload completes in UploadThing.
2. `runResumeAnalysis()` verifies resume ownership and creates an analysis record.
3. PDF text is extracted from the uploaded file URL.
4. Gemini receives a structured prompt with a JSON response schema.
5. The response is parsed and validated with Zod.
6. Findings, scores, and missing skills are persisted to PostgreSQL.
7. Failed runs update analysis and resume version status with a safe error message.

## Resume chat flow

1. User creates a chat thread for a resume with a completed analysis and extracted text.
2. User sends a message through a Server Action.
3. The service loads the latest resume text and up to 8 recent messages.
4. Gemini receives a prompt that restricts answers to resume-grounded information.
5. User and assistant messages are stored in PostgreSQL.

## Prompt strategy

**Analysis prompt (`resume-analysis-v1`)**

- Forces JSON-only output with required top-level keys
- Requests ATS score, overall score, summary, strengths, weaknesses, missing skills, grammar, formatting, and recommendations
- Limits list sizes and severity values
- Instructs the model not to invent resume facts

**Chat prompt (`resume-chat-v1`)**

- Restricts answers to the uploaded resume text and recent conversation
- Requires a fixed fallback response when information is not present in the resume
- Labels recommendations clearly and discourages hallucinated experience or metrics

## Error handling

- Invalid Gemini API keys return a user-safe error message
- Malformed JSON responses are caught and stored as failed analyses
- PDF extraction failures use retry logic and dedicated error types
- Chat falls back to a safe assistant message if Gemini returns empty output

---

# Security

| Area | Implementation |
|---|---|
| **Authentication** | Auth.js Credentials provider with bcrypt password verification |
| **Authorization** | User-scoped Prisma queries and authenticated Server Actions |
| **Protected routes** | `proxy.ts` blocks unauthenticated access to `/dashboard/*` |
| **Session management** | JWT sessions with 30-day max age |
| **Input validation** | Zod schemas for auth, resumes, chat, and AI output |
| **SQL injection prevention** | Prisma parameterized queries |
| **Password policy** | Minimum 8 characters with uppercase, lowercase, and number requirements |
| **File upload safety** | PDF-only validation on client and server, 5 MB size limit, UploadThing auth middleware |
| **PDF fetch hardening** | Allowed host suffixes and fetch timeout for text extraction |
| **XSS considerations** | React escapes rendered text by default; user content is stored as text |
| **Environment variables** | Secrets loaded from environment, not committed to source control |
| **HTTP security headers** | `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and `X-DNS-Prefetch-Control` in `next.config.ts` |

### Threats and mitigations

| Threat | Mitigation |
|---|---|
| Unauthorized dashboard access | Auth proxy and `requireUser()` checks |
| Cross-user data access | All resume, analysis, and chat queries filter by `userId` |
| Weak passwords | Signup schema enforces complexity rules; bcrypt stores password hashes |
| Malicious file uploads | MIME type and size checks before and after upload |
| Prompt injection in chat | Resume-only prompt rules and bounded context window |
| Leaking internal errors | Safe user-facing error messages for AI and upload failures |

---

# Scalability

## Current MVP architecture

ResumePilot AI is a monolithic Next.js application with synchronous AI analysis triggered inside the UploadThing upload callback. This is appropriate for an MVP because it keeps the upload-to-analysis flow simple and easy to reason about.

**Current characteristics**

- Single Next.js deployment unit
- Direct Prisma access from Server Components and Server Actions
- Synchronous Gemini calls during upload completion
- PostgreSQL as the system of record
- UploadThing as managed file storage

## Recommended production improvements (not yet implemented)

The following items are **not** part of the current MVP. They describe how the application could scale beyond the synchronous upload-and-analyze flow.

| Concern | Recommended approach |
|---|---|
| **Background jobs** | Move PDF extraction and Gemini analysis to a queue worker after upload |
| **Queues** | Use BullMQ, Inngest, or a managed queue to decouple uploads from AI latency |
| **Caching** | Cache dashboard stats and recent resume lists with short TTLs |
| **Rate limiting** | Add per-user limits on signup, login, upload, analysis, and chat endpoints |
| **Horizontal scaling** | Run multiple stateless Next.js instances behind a load balancer |
| **CDN** | Serve static assets and uploaded files through a CDN edge network |
| **Database optimization** | Add read replicas, connection pooling at the infra layer, and query indexes for dashboard aggregates |

---

# Testing

## Framework

| Tool | Purpose |
|---|---|
| **Vitest** | Unit and integration test runner |
| **React Testing Library** | Component rendering and interaction tests |
| **@testing-library/jest-dom** | DOM assertion matchers |
| **MSW** | Mock Service Worker setup for API mocking when needed |
| **@vitest/coverage-v8** | Code coverage reporting |

## Test structure

```text
tests/
├── setup.tsx
├── helpers/
├── unit/
└── integration/
```

## Test suite summary

| Item | Count |
|---|---|
| Test files | 8 |
| Tests | 25 |
| Unit tests | 5 files (`auth-validation`, `resume-validation`, `analysis-parsing`, `utilities`, `components`) |
| Integration tests | 3 files (`auth-boundary`, `uploadthing-route`, `resume-analysis-service`) |

## What is covered

- Auth schema validation (login and signup)
- Resume upload validation rules
- AI JSON parsing and Zod normalization
- Utility formatting helpers
- Auth boundary redirects
- UploadThing middleware and completion behavior
- Gemini failure handling in the analysis service
- Representative UI states (upload, loading skeleton, error, empty state)

External services are mocked in tests:

- Gemini API
- UploadThing
- Prisma database access where appropriate

## Coverage

Latest scoped coverage from `npm run test:coverage` (generated locally):

| Metric | Coverage |
|---|---|
| Statements | 62.01% (129/208) |
| Branches | 35.61% (52/146) |
| Functions | 59.18% (29/49) |
| Lines | 62.62% (129/206) |

Coverage is intentionally scoped in `vitest.config.ts` to the core tested application surfaces rather than every App Router page. Re-run `npm run test:coverage` to regenerate the report.

## Run tests

```bash
npm run test
npm run test:watch
npm run test:coverage
```

---

# CI/CD

**Currently not implemented. Recommended future improvement.**

There is no GitHub Actions workflow in this repository (no `.github/workflows/` directory).

The project already exposes the scripts a future CI pipeline should run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

A recommended future GitHub Actions pipeline would:

1. Install dependencies with `npm ci`
2. Run ESLint
3. Run TypeScript type checking
4. Run Vitest
5. Run `npm run build`
6. Optionally deploy to Vercel on `main`

---

# Deployment

## Recommended platform

Vercel is the recommended deployment target for this Next.js application.

## Production build

```bash
npm run build
npm run start
```

## Deployment steps

1. Push the repository to GitHub.
2. Import the project into Vercel (see subsection below).
3. Configure environment variables in the Vercel project settings.
4. Provision a production PostgreSQL database.
5. Run Prisma migrations against the production database.
6. Deploy the application and verify core flows.

### Deploying to Vercel

1. **Import the GitHub repository**
   - Sign in to [Vercel](https://vercel.com).
   - Click **Add New → Project**.
   - Import the ResumePilot AI repository from GitHub.

2. **Configure environment variables**
   - In the Vercel project settings, add every variable from the [Environment Variables](#environment-variables) table.
   - At minimum for production: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `AUTH_TRUST_HOST`, `UPLOADTHING_TOKEN`, `GEMINI_API_KEY`, `GEMINI_RESUME_ANALYSIS_MODEL`, and `GEMINI_RESUME_CHAT_MODEL`.
   - Set `AUTH_URL` to your production domain (for example, `https://resume-pilot-ai-blush.vercel.app`).

3. **Provision a production database**
   - Use Vercel Postgres, Neon, Supabase, or another managed PostgreSQL provider.
   - Copy the production connection string into `DATABASE_URL`.
   - For hosted databases that require SSL, use `sslmode=verify-full` in the connection string.

4. **Run Prisma migrations**
   - From your local machine or a CI job with production database access:

   ```bash
   DATABASE_URL="your-production-database-url" npx prisma migrate deploy
   ```

   - Alternatively, run migrations through your database provider's workflow before the first production deploy.

5. **Deploy**
   - Trigger a Vercel deployment from the `main` branch.
   - Vercel runs `npm run build` by default for Next.js projects.

6. **Post-deployment verification**
   - **Login:** sign up, sign in, sign out, and confirm `/dashboard` is protected.
   - **Resume upload:** upload a PDF resume and confirm client/server validation (PDF only, max 5 MB).
   - **AI analysis:** confirm analysis completes and results appear on the analysis detail page.
   - **Chat:** create a chat thread for an analyzed resume and send a resume-grounded question.

## Production checklist

- Set `AUTH_SECRET` to a strong random value
- Set `AUTH_URL` to your production domain
- Configure `AUTH_TRUST_HOST=true` if required by your hosting setup
- Provide valid `UPLOADTHING_TOKEN` and `GEMINI_API_KEY` values
- Use a managed PostgreSQL instance with SSL enabled
- Run `prisma migrate deploy` against the production database before first use
- Verify authentication, upload, AI analysis, and chat after deployment

---

# Screenshots

## Login

> Add a screenshot after deployment.

## Dashboard

> Add a screenshot after deployment.

## Resume Upload

> Add a screenshot after deployment.

## AI Analysis

> Add a screenshot after deployment.

## Chat

> Add a screenshot after deployment.

---

# Live Demo

**Production:** [https://resume-pilot-ai-blush.vercel.app](https://resume-pilot-ai-blush.vercel.app)

| Environment | URL |
|---|---|
| Production | [resume-pilot-ai-blush.vercel.app](https://resume-pilot-ai-blush.vercel.app) |
| Main branch preview | [resume-pilot-ai-git-main-himanshu-siddhs-projects.vercel.app](https://resume-pilot-ai-git-main-himanshu-siddhs-projects.vercel.app) |
| Deployment preview | [resume-pilot-niwljdmav-himanshu-siddhs-projects.vercel.app](https://resume-pilot-niwljdmav-himanshu-siddhs-projects.vercel.app) |

---

# Future Improvements

Features not yet implemented in this repository:

- GitHub Actions CI/CD pipeline
- Background job processing for AI analysis
- Rate limiting and audit logging
- Admin dashboard for `ADMIN` role users
- Profile editing and account management in settings
- Billing, subscriptions, and usage credits
- Email verification and password reset flows
- OAuth providers (Google, GitHub, etc.)
- Uploading a new version to an existing resume from the UI
- Resume version comparison and ATS score deltas
- Analysis retry button and markdown export
- Job description targeting and match scoring
- Theme toggle for dark mode (styles are dark-mode ready, but no switch exists)
- Email notifications for completed analyses
- Analytics and product usage dashboards
- React Hook Form or TanStack Query integration

---

# Author

| Field | Value |
|---|---|
| **Name** | Himanshu Siddh |
| **GitHub** | [github.com/himanshu-siddh/ResumePilot-AI](https://github.com/himanshu-siddh/ResumePilot-AI) |
| **LinkedIn** | [linkedin.com/in/himanshu-siddh-98aaa0416](https://www.linkedin.com/in/himanshu-siddh-98aaa0416) |
| **Email** | [siddhhimanshu08@gmail.com](mailto:siddhhimanshu08@gmail.com) |

---

# License

MIT

> TODO: Add a `LICENSE` file to the repository root before formal submission.

---

## Before Production Deployment

- [ ] Configure production environment variables
- [ ] Run Prisma migrations
- [ ] Verify authentication
- [ ] Verify resume upload
- [ ] Verify AI analysis
- [ ] Verify resume chat
- [ ] Add screenshots
- [x] Update Live Demo URL
