CREATE TABLE "admin" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_type" text NOT NULL,
	"total_clients" integer NOT NULL,
	"total_revenue_in_cents" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."appointment_status";--> statement-breakpoint
CREATE TYPE "public"."appointment_status" AS ENUM('pending', 'confirmed', 'completed', 'cancelled');--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."appointment_status";--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DATA TYPE "public"."appointment_status" USING "status"::"public"."appointment_status";--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "email_sent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "admin_notified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "price_at_booking" integer NOT NULL;