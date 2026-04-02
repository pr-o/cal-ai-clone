CREATE TABLE `daily_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`water_ml` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_logs_date_unique` ON `daily_logs` (`date`);--> statement-breakpoint
CREATE TABLE `exercise_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`daily_log_id` integer NOT NULL,
	`name` text NOT NULL,
	`duration_minutes` integer NOT NULL,
	`calories_burned` integer NOT NULL,
	`logged_at` text NOT NULL,
	FOREIGN KEY (`daily_log_id`) REFERENCES `daily_logs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `food_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`daily_log_id` integer NOT NULL,
	`name` text NOT NULL,
	`calories` integer NOT NULL,
	`protein_g` real NOT NULL,
	`carbs_g` real NOT NULL,
	`fat_g` real NOT NULL,
	`serving_size` real DEFAULT 1 NOT NULL,
	`serving_unit` text DEFAULT 'serving' NOT NULL,
	`meal_type` text DEFAULT 'snack' NOT NULL,
	`source` text DEFAULT 'manual' NOT NULL,
	`photo_uri` text,
	`logged_at` text NOT NULL,
	FOREIGN KEY (`daily_log_id`) REFERENCES `daily_logs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`goal` text NOT NULL,
	`gender` text NOT NULL,
	`birthday` text NOT NULL,
	`current_weight_kg` real NOT NULL,
	`target_weight_kg` real NOT NULL,
	`height_cm` real NOT NULL,
	`activity_level` text NOT NULL,
	`dietary_preferences` text DEFAULT '[]' NOT NULL,
	`daily_calories` integer NOT NULL,
	`daily_protein_g` integer NOT NULL,
	`daily_carbs_g` integer NOT NULL,
	`daily_fat_g` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `weight_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`weight_kg` real NOT NULL,
	`logged_at` text NOT NULL
);
