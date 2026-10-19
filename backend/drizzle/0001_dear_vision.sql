CREATE TABLE "inspection_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"visitor_name" varchar(150) NOT NULL,
	"visitor_email" varchar(255),
	"visitor_phone" varchar(30),
	"preferred_date" varchar(30) NOT NULL,
	"preferred_time" varchar(30) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"sender_name" varchar(150) NOT NULL,
	"sender_email" varchar(255),
	"sender_phone" varchar(30),
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "city" varchar(100);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "parking_spaces" integer;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "land_unit" varchar(50);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "land_purpose" varchar(100);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "negotiable" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "amenities" text[];--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "documents" text[];--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "images" text[];--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "owner_name" varchar(150);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "owner_phone" varchar(30);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "owner_email" varchar(255);--> statement-breakpoint
ALTER TABLE "inspection_requests" ADD CONSTRAINT "inspection_requests_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" DROP COLUMN "image";