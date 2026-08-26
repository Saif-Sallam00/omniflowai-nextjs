ALTER TABLE "project_translations" ADD COLUMN "category_label" text;--> statement-breakpoint
ALTER TABLE "project_translations" ADD COLUMN "client_name" text;--> statement-breakpoint
ALTER TABLE "project_translations" ADD COLUMN "client_sector" text;--> statement-breakpoint
ALTER TABLE "project_translations" ADD COLUMN "client_country" text;--> statement-breakpoint
ALTER TABLE "project_translations" ADD COLUMN "client_model" text;--> statement-breakpoint
ALTER TABLE "project_translations" ADD COLUMN "problem_headline" text;--> statement-breakpoint
ALTER TABLE "project_translations" ADD COLUMN "problem_body" text;--> statement-breakpoint
ALTER TABLE "project_translations" ADD COLUMN "diagnosis_headline" text;--> statement-breakpoint
ALTER TABLE "project_translations" ADD COLUMN "diagnosis_body" text;--> statement-breakpoint
ALTER TABLE "project_translations" ADD COLUMN "system_headline" text;--> statement-breakpoint
ALTER TABLE "project_translations" ADD COLUMN "system_cards" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "project_translations" ADD COLUMN "media_caption" text;--> statement-breakpoint
ALTER TABLE "project_translations" ADD COLUMN "cta_headline" text;--> statement-breakpoint
ALTER TABLE "project_translations" ADD COLUMN "cta_subtext" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "logo" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "media_image" text;--> statement-breakpoint
ALTER TABLE "project_translations" DROP COLUMN "client";--> statement-breakpoint
ALTER TABLE "project_translations" DROP COLUMN "challenge";--> statement-breakpoint
ALTER TABLE "project_translations" DROP COLUMN "diagnosis";--> statement-breakpoint
ALTER TABLE "project_translations" DROP COLUMN "solution";--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_slug_unique" UNIQUE("slug");