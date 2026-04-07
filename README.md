# ServerTech Issue Intake & Smart Summary System

A premium, enterprise-grade Monorepo application demonstrating a senior-level full-stack engineering approach to building operational internal tooling.

## Setup Steps

This project is fully dockerized for a seamless setup experience on any machine.
Wait approximately 15 seconds after running the script for the DB and API container to fully boot before logging in.

### 1. Requirements
- Docker Desktop
- Node.js v20+

### 2. Boot the API & Database
```powershell
# Navigate to the root directory
cd c:\projects\tests\servertechsolutions

# Execute the start script to boot containers, run migrations, and seed logic
.\start.bat
```
*The API will be available at `http://localhost:8080`*

### 3. Boot the Frontend Client
```powershell
# Open a second terminal
cd c:\projects\tests\servertechsolutions\client

# Install Next.js dependencies
npm install

# Start the dev server
npm run dev
```
*The Client will be available at `http://localhost:3000`*

### 4. Test Credentials
Access the system using the pre-seeded Superadmin account:
- **Email:** superadmin@servertech.com
- **Password:** password

---

## Architecture & Key Decisions

**Monorepo Structure**
- `api/`: Laravel 11. Used as a strict, headless JSON REST API. Provides unparalleled ecosystem tools for Auth (Sanctum), Eloquent ORM, and Validation handling.
- `client/`: Next.js 15 (App Router). Built as a decoupled SPA utilizing standard React paradigms with Tailwind CSS v4.

**Database Selection: PostgreSQL**
PostgreSQL (a strict relational database) was chosen specifically over a Document store (like MongoDB) because issue tracking systems rely on highly structured, heavily interrelated entities (Issues -> Statuses, Categories, Priorities, Assigned Agents, Reporters). 
A relational database with enforced foreign key constraints guarantees data integrity across these domains natively, whereas a NoSQL setup would require manual application-level sanity checks and complex aggregation pipelines just to render a basic List View.

**Authentication: Stateful Sanctum**
Instead of using opaque JWT tokens (which are vulnerable to XSS and lack native revocation), I utilized Laravel Sanctum's SPA cookie-based authentication. This relies on native browser mechanics, CSRF protection, and same-site cookies, making it significantly more secure for internal operations tooling.

**Graceful AI Automation**
Upon issue submission, the backend automatically triggers `IssueIntelligenceService`. By default, this attempts an HTTP call to a local LLM API (Ollama) to parse the description. As per the requirements, if the service times out or is unreachable, it seamlessly injects a robust **Regex/Keyword Parse Fallback**, categorizing the text based on predefined error terminology (e.g. "crash", "password") to assign a logical summary and tier-1 triage action.

**True Light/Dark Mode**
Instead of enforcing a hardcoded theme, the system utilizes deeply integrated semantic CSS variables (`var(--background)`, `var(--foreground)`), allowing the UI to instantly adapt to native dark/light user preferences universally.

---

## What I Would Improve With More Time

1. **Job Queues for AI**: The `IssueIntelligenceService` currently executes synchronously during the HTTP request lifecycle. In a true production environment, I would push this to a Redis-backed Laravel Queue (e.g., `GenerateIssueSummaryJob::dispatch()`) to return a `201 Created` instantly, rather than blocking the user while the LLM generates the response.
2. **WebSockets for Live Updates**: I would integrate Laravel Reverb/Pusher so that if a Tier 2 agent changes an issue's status to "Resolved", the Dashboard of the original reporter automatically updates in real-time without needing a manual refresh.
3. **Optimistic UI**: Implement React Query (TanStack Query) on the frontend for heavily optimistic UI rendering, making filtering and paginating the dashboard feel perfectly instant.
4. **End-to-End Testing**: Incorporate Playwright strictly to test the UI flow (Login -> Submit Issue -> Filter Dashboard), tying it into a GitHub Actions CI pipeline.
