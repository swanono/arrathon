CREATE TYPE "public"."location_type" AS ENUM('bar', 'apartment', 'monument', 'pit_stand');--> statement-breakpoint
CREATE TYPE "public"."participant_role" AS ENUM('participant', 'organisator');--> statement-breakpoint
CREATE TYPE "public"."participant_status" AS ENUM('active', 'abandoned', 'returned', 'partial');--> statement-breakpoint
CREATE TABLE "arrathon_location" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"arrathon_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"order_position" integer NOT NULL,
	"duration" integer,
	"type" "location_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_arrathon_location_order" UNIQUE("arrathon_id","order_position"),
	CONSTRAINT "uq_arrathon_location_pair" UNIQUE("arrathon_id","location_id")
);
--> statement-breakpoint
CREATE TABLE "arrathons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"invite_token" text,
	"pack_price" integer,
	"pack_contents" text,
	"pack_mandatory" boolean DEFAULT false NOT NULL,
	"pack_commander_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "arrathons_invite_token_unique" UNIQUE("invite_token")
);
--> statement-breakpoint
CREATE TABLE "device_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"expo_push_token" text NOT NULL,
	"platform" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"family_name" varchar(100) NOT NULL,
	"email" varchar(255),
	"google_id" varchar(255),
	"avatar_url" text,
	"date_of_birth" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text,
	"coordinates" geography(Point,4326),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_arrathon" (
	"user_id" uuid NOT NULL,
	"arrathon_id" uuid NOT NULL,
	"role" "participant_role" NOT NULL,
	"status" "participant_status" DEFAULT 'active' NOT NULL,
	"pack_paid" boolean DEFAULT false NOT NULL,
	"starting_location_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_arrathon_user_id_arrathon_id_pk" PRIMARY KEY("user_id","arrathon_id")
);
--> statement-breakpoint
CREATE TABLE "location_user" (
	"location_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "location_user_location_id_user_id_pk" PRIMARY KEY("location_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "arrathon_location" ADD CONSTRAINT "arrathon_location_arrathon_id_arrathons_id_fk" FOREIGN KEY ("arrathon_id") REFERENCES "public"."arrathons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arrathon_location" ADD CONSTRAINT "arrathon_location_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arrathons" ADD CONSTRAINT "arrathons_pack_commander_id_users_id_fk" FOREIGN KEY ("pack_commander_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_arrathon" ADD CONSTRAINT "user_arrathon_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_arrathon" ADD CONSTRAINT "user_arrathon_arrathon_id_arrathons_id_fk" FOREIGN KEY ("arrathon_id") REFERENCES "public"."arrathons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_arrathon" ADD CONSTRAINT "user_arrathon_starting_location_id_locations_id_fk" FOREIGN KEY ("starting_location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_user" ADD CONSTRAINT "location_user_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_user" ADD CONSTRAINT "location_user_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;