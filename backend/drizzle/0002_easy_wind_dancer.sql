ALTER TABLE "messages" ALTER COLUMN "sender_name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "sender_phone" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "is_read" boolean DEFAULT false NOT NULL;