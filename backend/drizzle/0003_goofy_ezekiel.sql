CREATE TABLE "agents" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(30),
	"password" varchar(255) NOT NULL,
	"agency_name" varchar(200),
	"profile_image" text,
	"role" varchar(30) DEFAULT 'agent' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "agents_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "agent_id" integer;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;