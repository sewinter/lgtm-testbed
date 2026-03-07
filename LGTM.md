# Review Context for sewinter/lgtm-testbed

## Architecture
This is a TypeScript Express REST API with an in-memory SQLite database (`better-sqlite3`), organized in a layered architecture:

- **`src/server.ts`** — Express entry point; mounts JSON parsing and route groups under `/api/users` and `/api/tasks`.
- **`src/routes/`** — Route handlers that compose middleware (auth, validation, rate limiting) and delegate to services. Each resource (users, tasks) has its own router file.
- **`src/services/`** — Business logic layer (`task-service.ts`, `user-service.ts`). Services call into the DB layer and return typed domain objects.
- **`src/db/queries.ts`** — All database access is centralized here. Uses parameterized queries against an in-memory SQLite instance. Row mappers convert snake_case DB columns to camelCase TypeScript types.
- **`src/middleware/`** — Reusable Express middleware: `auth.ts` (Bearer token check), `validate.ts` (body validation), `rate-limiter.ts`.
- **`src/types.ts`** — Shared TypeScript interfaces for domain models (`User`, `Task`), API error shapes, and input DTOs.
- **`src/errors.ts`** — Standardized error response factory functions (`notFound`, `badRequest`, `unauthorized`, etc.) that produce a consistent `ErrorResponse` shape.
- **`src/__tests__/`** — Vitest test files, one per service.
- **`src/conflict-target.ts`** — A synthetic file used by CI workflows to generate merge conflicts for testing.


## Conventions
No review comments are available yet. Conventions will be populated as review history accumulates.

## Risk Areas
- **`src/db/queries.ts`** — Single file containing all database access, schema definitions, and row mappers. Any change here affects every route. The in-memory SQLite database is initialized at module load, so import side effects could cause issues in tests or if the module is restructured.
- **`src/middleware/auth.ts`** — The auth middleware currently only checks token format (length ≥ 10), not validity. Changes here affect all authenticated endpoints (`POST`/`PATCH` routes).
- **`src/types.ts`** — Shared type definitions used across all layers. Changes to interfaces like `Task` or `User` ripple through services, routes, DB mappers, and tests.
- **`src/conflict-target.ts`** — This file exists specifically to be modified by CI workflows to create merge conflicts. It is not application code and should be treated with caution in PRs (changes here are likely synthetic/automated).


## Review Preferences
No review comments are available to analyze. Review preferences will be populated as review history accumulates.

## Historical Context
No active migrations or deprecated patterns are evident from the review history. This section will be updated as review data becomes available.
