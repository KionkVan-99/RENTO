CREATE TABLE "featured_listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"agent_id" integer NOT NULL,
	"payment_id" integer,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"property_id" integer,
	"amount" numeric(15, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'NGN' NOT NULL,
	"reference" varchar(255) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"purpose" varchar(50) NOT NULL,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"plan" varchar(30) NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"payment_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inspection_requests" DROP CONSTRAINT "inspection_requests_property_id_properties_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_property_id_properties_id_fk";
--> statement-breakpoint
ALTER TABLE "properties" DROP CONSTRAINT "properties_agent_id_agents_id_fk";
--> statement-breakpoint
ALTER TABLE "inspection_requests" ALTER COLUMN "preferred_date" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "inspection_requests" ALTER COLUMN "preferred_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "inspection_requests" ALTER COLUMN "preferred_time" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "inspection_requests" ALTER COLUMN "preferred_time" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "sender_name" SET DATA TYPE varchar(150);--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "sender_phone" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "listing_type" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "price" SET DATA TYPE numeric(15, 2);--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "area" SET DATA TYPE numeric(15, 2);--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "negotiable" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "featured" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "amenities" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "documents" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "images" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "monthly_rent" SET DATA TYPE numeric(15, 2);--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "lease_duration" SET DATA TYPE varchar(100);