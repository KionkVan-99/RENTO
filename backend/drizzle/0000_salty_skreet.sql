CREATE TABLE "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"type" varchar(50) NOT NULL,
	"listing_type" varchar(20) NOT NULL,
	"price" integer NOT NULL,
	"location" varchar(255) NOT NULL,
	"state" varchar(100),
	"bedrooms" integer,
	"bathrooms" integer,
	"area" integer,
	"image" text,
	"featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
