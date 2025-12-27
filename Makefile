.PHONY: dev schedule

dev:
	pnpm run dev

schedule:
	pnpx tsx src/lib/cron/update_schedule.ts
