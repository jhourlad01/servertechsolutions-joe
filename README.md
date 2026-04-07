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

---

## Key Features & Assessment Parity

**1. Secure Identity & Access (IAM)**
- **Permission-First Architecture**: Access control is decoupled from roles. Roles acts as templates, while runtime guards check for granular permissions like `manage-users` (Global) or `view-ai-summaries` (Specialist).
- **Hierarchical Governance**: Superadmins and Admins can provision new users but are restricted by a strict provisioning hierarchy (e.g., Admins cannot create other Admins).
- **Data Scoping**: Customers are isolated to their own reports, whereas Specialists (Agents/Techs) see tickets currently or historically assigned to them.

**2. Smart Intelligence Layer**
- **Dual-Mode AI**: Uses a local **Ollama (Llama 3)** integration for summaries and triage routing.
- **Robust Fallback**: If the AI service is unreachable, the system executes a complex keyword/regex parser to maintain operational continuity.
- **Manual Regeneration**: Support staff can re-trigger intelligence parsing if an issue description is updated.

**3. Enterprise Operations**
- **Automated Triage**: New issues are distributed via a **Round Robin** algorithm.
- **Audit Logging**: Every status change, assignment, and priority escalation is automatically logged as a system message in the issue's thread.
- **SLA & Escalation**: A scheduled task (`ProcessOverdueIssues`) monitors SLA windows and flags critically delayed items for immediate escalation to specialists.

**4. Secure Asset Handling**
- **Signed URLs**: All file downloads use temporary, short-lived signed URLs (60-minute expiry), ensuring that uploaded assets are never exposed via direct public links.

---

## Technical Stack

- **API**: Laravel 11 (Headless REST) + Nginx + PHP-FPM.
- **Database**: PostgreSQL (UUID Primary Keys for all entities).
- **Client**: Next.js 15 (App Router) + Tailwind CSS v4.
- **Identity**: Laravel Sanctum (Stateful SPA Cookies).
- **Infrastructure**: Fully Dockerized (Docker Compose).

---

## What I Would Improve With More Time

1. **Job Queues for AI**: Transition `IssueIntelligenceService` to background jobs (Redis) to decouple the user experience from LLM processing time.
2. **WebSockets**: Implement real-time dashboard updates via Laravel Reverb to eliminate the need for manual refreshes.
3. **Advanced Triage UI**: Develop a dedicated "Triage Queue" that uses weighted scoreboards instead of simple Round Robin to balance workload based on issue complexity.
4. **End-to-End Testing**: Incorporate Playwright for automated regression testing of the security middleware and the multi-step intake flow.
