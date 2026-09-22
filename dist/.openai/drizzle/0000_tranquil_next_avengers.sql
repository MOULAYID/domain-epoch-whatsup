CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`company` text NOT NULL,
	`domain` text NOT NULL,
	`market` text NOT NULL,
	`phone` text NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`initial_message` text NOT NULL,
	`followup_1_message` text NOT NULL,
	`followup_2_message` text NOT NULL,
	`final_message` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `outreach` (
	`lead_id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'Not sent' NOT NULL,
	`last_contact_date` text,
	`updated_at` text DEFAULT '1970-01-01T00:00:00.000Z' NOT NULL,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE cascade
);
