ALTER TABLE "properties" ADD COLUMN "status" varchar(30) DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "sold_at" timestamp;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "rented_at" timestamp;