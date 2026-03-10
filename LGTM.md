# Review Context for sewinter/lgtm-testbed

## Architecture
This is a TypeScript Express API with an in-memory SQLite database (`better-sqlite3`). The codebase follows a layered architecture:

- **`src/routes/`** — Express route handlers. Each resource (users, tasks) gets its own router file. Routes compose middleware (`withAuth`, `withRateLimiter`, `withValidation`) and delegate to service functions. Routes must **not** import from `src/db/` directly.
- **`src/services/`** — Business logic layer. Service functions orchestrate data access via `src/db/queries.ts` and enforce domain rules. Each exported service function has a corresponding test file in `src/__tests__/`.
- **`src/db/queries.ts`** — Single file for all database access. All queries use parameterized statements (`?` placeholders). Row mappers convert raw rows to typed domain objects (`User`, `Task`).
- **`src/middleware/`** — Express middleware: `auth.ts` (Bearer token authentication), `rate-limiter.ts` (IP-based rate limiting), `validate.ts` (request body schema validation via `withValidation`).
- **`src/errors.ts`** — Structured error response factory functions (`notFound`, `badRequest`, `unauthorized`, etc.) that produce `ErrorResponse` objects. All error responses should flow through these factories.
- **`src/types.ts`** — Shared type definitions for domain models, API errors, pagination, and input DTOs.

Data flow: `Route handler → middleware chain → service function → db/queries → SQLite`. Responses use typed interfaces from `src/types.ts`.

## Conventions
- **Every route must include `withRateLimiter` middleware.** This is a hard requirement for all endpoints — no exceptions, including admin endpoints. Omitting it has been flagged repeatedly across PRs.
- **All mutation endpoints (POST, PATCH, DELETE) must use `withAuth` middleware.** Any endpoint that reads sensitive content (e.g., notification records with user data) also needs `withAuth`. Reviewers should verify the middleware chain on every new route.
- **Route handlers must not import from `src/db/` directly.** All data access goes through `src/services/`. This enforces business rules consistently and keeps routes thin.
- **Error responses must use factory functions from `src/errors.ts`** (`notFound()`, `badRequest()`, etc.) via the `ErrorResponse` type. Never return raw `{ error: ... }` objects — this breaks client-side error parsing.
- **All SQL queries must use parameterized statements** with `?` placeholders. String interpolation/concatenation in SQL is treated as a critical security issue (SQL injection).
- **Query parameters must be validated** using `withValidation` middleware or manual guards. Specifically: numeric params like `limit`/`offset` need `NaN`/negative checks and clamping; LIKE patterns need wildcard escaping for `%` and `_`.
- **New exported service functions require unit tests** covering the success path and at least one error/edge case. Tests live in `src/__tests__/`.
- **Side effects (notifications, emails) must not block core persistence.** Persist the primary write first, then attempt the side effect in a try/catch so failures are logged but don't break the main operation.

## Risk Areas
- **`src/routes/` — middleware chain completeness.** The most frequent review finding is missing middleware (`withAuth`, `withRateLimiter`). Every new or modified route handler should be checked for the correct middleware stack: rate limiting on all endpoints, auth on mutations and sensitive reads, validation on inputs.
- **`src/db/queries.ts` — SQL injection and input handling.** All queries must use parameterized `?` placeholders. Any string interpolation in SQL is a critical defect. Additionally, LIKE clauses need wildcard character escaping, and array inputs (e.g., `IN (...)` clauses) need per-element validation and parameterized placeholder generation.
- **`src/services/` — ordering of persistence vs. side effects.** Review comments have repeatedly flagged patterns where async side effects (like notifications) run before the primary database write, causing the core operation to fail if the side effect throws. New service functions with side effects should persist first, then handle side effects defensively.
- **Input validation in route handlers.** Numeric query parameters (`limit`, `offset`) and array body parameters (`ids`) have been sources of bugs. `Number()` on non-numeric strings produces `NaN` that flows into SQLite. Reviewers should verify all user input is validated, clamped, and defaulted appropriately.

## Review Preferences
- **Blocking issues are called out clearly.** Reviewers use explicit severity markers (🚨, "critical", bold headings) and distinguish blocking issues from minor nits. PRs with security issues (missing auth, SQL injection) or correctness bugs are not approved until fixed.
- **Repeat findings are tracked.** When issues are raised in a prior review round and remain unaddressed, reviewers explicitly note this ("still unaddressed from previous review", "flagged in multiple prior review rounds"). Unresolved repeat findings escalate in tone.
- **Test coverage is expected for new service functions.** PRs adding exported service functions without corresponding unit tests will be flagged.
- **PR-level summaries are provided** alongside inline comments, listing the key issues and distinguishing critical blockers from minor suggestions.

## Historical Context
- **Soft-delete migration for users** (PR #21): A `deleted_at` column approach is being introduced. When reviewing user-related queries, be aware that new code should account for soft-delete filtering, and existing queries may need `WHERE deleted_at IS NULL` guards.
- **No other active migrations or deprecated patterns were identified** from the review history. The layered architecture (routes → services → db) and middleware patterns are stable conventions, not transitional.
