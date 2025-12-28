.PHONY: dev schedule migrate

migrate:
	pnpm drizzle-kit push

dev: migrate
	pnpm run dev

schedule: migrate
	pnpx tsx src/lib/cron/update_schedule.ts
