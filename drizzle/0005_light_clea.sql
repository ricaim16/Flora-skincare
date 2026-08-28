CREATE TYPE "public"."expense_entry_type" AS ENUM('expense', 'tip');--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"note" text,
	"entry_type" "expense_entry_type" NOT NULL,
	"amount_in_cents" integer NOT NULL,
	"entry_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "expenses_entry_date_idx" ON "expenses" USING btree ("entry_date");--> statement-breakpoint
CREATE INDEX "expenses_entry_type_idx" ON "expenses" USING btree ("entry_type");