CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exchange` varchar(32) NOT NULL,
	`encryptedApiKey` text NOT NULL,
	`encryptedApiSecret` text NOT NULL,
	`encryptedPassphrase` text,
	`label` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`lastSyncedAt` timestamp,
	`lastSyncError` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `asset_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalValueUsd` decimal(20,2) NOT NULL,
	`totalValueTwd` decimal(20,2) NOT NULL,
	`assetsData` text NOT NULL,
	`source` varchar(32) NOT NULL DEFAULT 'auto_sync',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `asset_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wallet_addresses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`network` varchar(32) NOT NULL,
	`address` varchar(255) NOT NULL,
	`label` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`lastSyncedAt` timestamp,
	`lastSyncError` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wallet_addresses_id` PRIMARY KEY(`id`)
);
