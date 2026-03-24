ALTER TABLE "locations" ADD COLUMN "google_place_id" varchar(255);--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "google_fetched_at" timestamp;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_google_place_id_unique" UNIQUE("google_place_id");