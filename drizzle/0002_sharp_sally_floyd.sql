CREATE TYPE "public"."report_type" AS ENUM('weekly', 'monthly', 'yearly');--> statement-breakpoint
CREATE TABLE "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "admin" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "admin" CASCADE;--> statement-breakpoint
ALTER TABLE "services" DROP CONSTRAINT "services_slug_unique";--> statement-breakpoint
DROP INDEX "unique_client_slot_idx";--> statement-breakpoint
DROP INDEX "services_slug_idx";--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "report_type" SET DATA TYPE "public"."report_type" USING "report_type"::"public"."report_type";--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "duration_minutes" SET DEFAULT 90;--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_unique_client_slot_idx" ON "bookings" USING btree ("phone_number","appointment_date","appointment_time");--> statement-breakpoint
CREATE INDEX "bookings_service_idx" ON "bookings" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reports_period_idx" ON "reports" USING btree ("report_type","start_date","end_date");--> statement-breakpoint
CREATE UNIQUE INDEX "services_slug_unique_idx" ON "services" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "services_active_idx" ON "services" USING btree ("is_active");