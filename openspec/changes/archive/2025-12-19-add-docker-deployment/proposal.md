# Add Docker Deployment and Migration Strategy

## Problem

The current application allows for Docker builds but lacks a `docker-compose` setup for easy orchestration and, crucially, data persistence. The database is currently initialized via code checks (`CREATE TABLE IF NOT EXISTS`), which is insufficient for evolving the schema over time without data loss (e.g., altering columns).

## Solution

1.  **Docker Compose**: Add a `docker-compose.yml` file to orchestrate the application container and define a persistent volume for the SQLite database.
2.  **Migration Strategy**: Implement a robust, versioned migration system.
    - Replace the current `initializeDatabase` logic with a migration runner.
    - Track schema versions in a `_migrations` table.
    - Store schema changes in SQL files (e.g., `001_initial_schema.sql`).
    - Run migrations automatically on application startup.

## Plan

1.  Create `docker-compose.yml`.
2.  Refactor `lib/db.ts` to support migrations.
3.  Create a `lib/migrations.ts` (or similar) to handle the migration logic.
4.  Move existing schema definitions from `lib/init-db.ts` to a first migration file.
5.  Update `Dockerfile` if necessary to ensure migration files are available in the image.

## Risks

- **Data Migration**: Existing users (developers running locally) might need to reset their DB if we strictly enforce the new migration system, unless we detect and migrate the existing schema state. _Mitigation_: The first migration will be "idempotent-ish" (using `IF NOT EXISTS`) or we assume a fresh start for the new deployment structure. Given this is a local app/prototype, a fresh start or manual migration instructions are likely acceptable.
- **Startup Time**: Running migrations on startup adds a small overhead. _Mitigation_: SQLite migrations are very fast.

## Success Criteria

- `docker-compose up` starts the app.
- Data persists across container restarts (verified by checking volume).
- Database schema is created via the migration system.
- Future schema changes can be added as new SQL files.
