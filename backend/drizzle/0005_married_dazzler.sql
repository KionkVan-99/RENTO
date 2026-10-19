ALTER TABLE "properties" ADD COLUMN "tenant_name" varchar(150);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "tenant_phone" varchar(30);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "tenant_email" varchar(255);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "monthly_rent" integer;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "move_in_date" timestamp;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "lease_duration" varchar(50);