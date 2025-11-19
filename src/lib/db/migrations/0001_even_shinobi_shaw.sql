CREATE TYPE "public"."vehicle_status" AS ENUM('daily', 'project', 'sold', 'wrecked', 'hidden');--> statement-breakpoint
CREATE TABLE "user_car_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_car_id" integer NOT NULL,
	"url" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_car_mods" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_car_id" integer NOT NULL,
	"title" varchar(120) NOT NULL,
	"description" text,
	"installed_at" timestamp,
	"cost_cents" integer,
	"part_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_cars" ADD COLUMN "vin" varchar(32);--> statement-breakpoint
ALTER TABLE "user_cars" ADD COLUMN "engine_code" varchar(64);--> statement-breakpoint
ALTER TABLE "user_cars" ADD COLUMN "color_code" varchar(64);--> statement-breakpoint
ALTER TABLE "user_cars" ADD COLUMN "trim" varchar(100);--> statement-breakpoint
ALTER TABLE "user_cars" ADD COLUMN "status" "vehicle_status" DEFAULT 'daily' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_cars" ADD COLUMN "order_index" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_car_media" ADD CONSTRAINT "user_car_media_user_car_id_user_cars_id_fk" FOREIGN KEY ("user_car_id") REFERENCES "public"."user_cars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_car_mods" ADD CONSTRAINT "user_car_mods_user_car_id_user_cars_id_fk" FOREIGN KEY ("user_car_id") REFERENCES "public"."user_cars"("id") ON DELETE cascade ON UPDATE no action;