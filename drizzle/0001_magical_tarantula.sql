CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`practitionerId` int NOT NULL,
	`slotId` int,
	`appointmentDate` date NOT NULL,
	`startTime` time NOT NULL,
	`endTime` time NOT NULL,
	`status` enum('scheduled','completed','cancelled','no_show') NOT NULL DEFAULT 'scheduled',
	`reason` text,
	`notes` text,
	`diagnosis` text,
	`treatment` text,
	`followUpRequired` boolean NOT NULL DEFAULT false,
	`followUpDate` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `availabilitySlots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`practitionerId` int NOT NULL,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp NOT NULL,
	`capacity` int NOT NULL DEFAULT 1,
	`isBooked` boolean NOT NULL DEFAULT false,
	`notes` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `availabilitySlots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `practitioners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`specialization` varchar(200) NOT NULL,
	`phoneNumber` varchar(20),
	`licenseNumber` varchar(100),
	`biography` text,
	`consultationDuration` int NOT NULL DEFAULT 30,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `practitioners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','practitioner') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_practitionerId_practitioners_id_fk` FOREIGN KEY (`practitionerId`) REFERENCES `practitioners`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_slotId_availabilitySlots_id_fk` FOREIGN KEY (`slotId`) REFERENCES `availabilitySlots`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `availabilitySlots` ADD CONSTRAINT `availabilitySlots_practitionerId_practitioners_id_fk` FOREIGN KEY (`practitionerId`) REFERENCES `practitioners`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `practitioners` ADD CONSTRAINT `practitioners_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;