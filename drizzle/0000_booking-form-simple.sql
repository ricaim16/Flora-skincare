CREATE TYPE "public"."appointment_status" AS ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show');--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone_number" text NOT NULL,
	"service_id" integer NOT NULL,
	"appointment_date" date NOT NULL,
	"appointment_time" time NOT NULL,
	"status" "appointment_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"price_in_cents" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "services_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_client_slot_idx" ON "bookings" USING btree ("phone_number","appointment_date","appointment_time");--> statement-breakpoint
CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");