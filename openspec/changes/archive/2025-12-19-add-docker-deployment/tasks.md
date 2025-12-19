# Tasks: Add Docker Deployment and Migrations

- [x] Create `db/migrations` directory <!-- id: 0 -->
- [x] Create `db/migrations/001_initial_schema.sql` with existing schema <!-- id: 1 -->
- [x] Create `lib/migrations.ts` to implement migration runner <!-- id: 2 -->
- [x] Update `lib/db.ts` and `lib/init-db.ts` to use migration runner <!-- id: 3 -->
- [x] Update `Dockerfile` to include migration files <!-- id: 4 -->
- [x] Create `docker-compose.yml` <!-- id: 5 -->
- [x] Verify local startup with `npm run dev` (ensure migrations run) <!-- id: 6 -->
- [x] Verify docker build and startup with `docker-compose up` <!-- id: 7 -->
- [x] Update `DEPLOYMENT.md` with docker-compose instructions <!-- id: 8 -->
- [x] Update `DEVELOPMENT.md` with migration creation guide <!-- id: 9 -->
