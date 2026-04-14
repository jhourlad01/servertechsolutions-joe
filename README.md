# Issue Intake Tracker

## Working source code

Repo: [https://github.com/jhourlad01/servertechsolutions-joe](https://github.com/jhourlad01/servertechsolutions-joe)

Check code with `.\qa.bat` (Windows) or `./qa.sh` (Linux/Mac).

## README with setup steps

1. Open Docker Desktop.
2. Run `.\start.bat` (Windows) or `sh start.sh` (Linux/Mac). (Use `.\start.bat --prune` to remove orphaned containers).
3. Check `.env` for your local ports and URLs.

## Sample data or seed script

Log in with these (Password: `password`):
- Superadmin: `superadmin@servertech.com`
- Admin: `admin@servertech.com`
- Technician: `isaac.c@servertech.com`
- Agent: `sarah.c@servertech.com`
- Customer A: `wick@customera.com`
- Customer B: `ripley@customerb.com`

Seeding is done automatically by the start script.

## Short explanation of architecture and key decisions

- **Domain-Driven Design (DDD):** Divided the API into clear domains (IAM and Issues). This ensures that authentication logic and business logic for tickets are isolated and maintainable.
- **AI-Powered Sorting:** Integrated Llama 3 (via Ollama) to automatically generate issue summaries and suggest next steps. I built a robust keyword/regex fallback system to maintain full functionality even if the AI service is unreachable.
- **Permission-First Access:** Used a granular permission model rather than simple roles. This allows runtime guards to restrict visibility based on ownership (Customers see only their tickets) or expertise (Specialists see assigned records).
- **Automated Workflow:** Implemented a Round Robin algorithm for fair staff assignment and a background SLA monitoring task that automatically flags and escalates overdue records to the management group.
- **Secure File Handling:** All uploaded assets are stored privately and only accessible via short-lived, signed URLs, preventing direct public access to sensitive data.
- **Single Source of Truth (Config):** Synchronized the entire stack (Client, API, AI) to a root `.env` file. Built an automated entrypoint logic to propagate these settings to Laravel, preventing configuration drift across the monorepo.
- **Port Management:** Implemented proactive port conflict resolution in the startup workflow, automatically terminating stale processes to ensure zero-friction development.
- **Request-Level Memoization:** Optimized the IAM layer by caching permissions and role slugs in memory during a request, eliminating redundant database queries during authorization.

## Short note on what you would improve with more time

1. Async AI: Move AI tasks to the background.
2. Live updates: Add WebSockets for a faster dashboard.
3. Better sorting: Balance work across the team.
4. More tests: Add browser tests for the front-end.
