CREATE TYPE "public"."account_role" AS ENUM('customer', 'admin');--> statement-breakpoint
CREATE TYPE "public"."booking_source" AS ENUM('website', 'admin');--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "password_reset_otps" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"account_type" "account_role" NOT NULL,
	"code_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "bookings_unique_client_slot_idx";--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "name" text DEFAULT 'Manager' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "customer_id" integer;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "booking_source" "booking_source" DEFAULT 'website' NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "description" text DEFAULT 'Personalized skincare treatment.' NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "is_members_only" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "password_reset_otps_account_idx" ON "password_reset_otps" USING btree ("email","account_type");--> statement-breakpoint
CREATE INDEX "password_reset_otps_expiry_idx" ON "password_reset_otps" USING btree ("expires_at");--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_unique_slot_idx" ON "bookings" USING btree ("appointment_date","appointment_time");--> statement-breakpoint
CREATE INDEX "bookings_customer_idx" ON "bookings" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "services_members_only_idx" ON "services" USING btree ("is_members_only");