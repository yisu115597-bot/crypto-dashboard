import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * API Keys table - stores encrypted API credentials for exchanges
 * Each user can have multiple API keys from different exchanges
 */
export const apiKeys = mysqlTable("api_keys", {
  id: int("id").autoincrement().primaryKey(),
  /** Reference to the user who owns this API key */
  userId: int("userId").notNull(),
  /** Exchange name (e.g., 'binance', 'okx') */
  exchange: varchar("exchange", { length: 32 }).notNull(),
  /** Encrypted API key (AES-256) */
  encryptedApiKey: text("encryptedApiKey").notNull(),
  /** Encrypted API secret (AES-256) */
  encryptedApiSecret: text("encryptedApiSecret").notNull(),
  /** Optional: encrypted passphrase for some exchanges like OKX */
  encryptedPassphrase: text("encryptedPassphrase"),
  /** User-friendly label (e.g., "Main Account", "Trading Bot") */
  label: varchar("label", { length: 255 }),
  /** Whether this API key is active */
  isActive: boolean("isActive").default(true).notNull(),
  /** Last time we successfully synced with this API key */
  lastSyncedAt: timestamp("lastSyncedAt"),
  /** Error message if last sync failed */
  lastSyncError: text("lastSyncError"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

/**
 * Wallet Addresses table - stores public wallet addresses for tracking
 * No private keys are stored here - only public addresses
 */
export const walletAddresses = mysqlTable("wallet_addresses", {
  id: int("id").autoincrement().primaryKey(),
  /** Reference to the user who owns this wallet */
  userId: int("userId").notNull(),
  /** Blockchain network (e.g., 'ethereum', 'bsc', 'polygon') */
  network: varchar("network", { length: 32 }).notNull(),
  /** Public wallet address (no private key) */
  address: varchar("address", { length: 255 }).notNull(),
  /** User-friendly label (e.g., "Main Wallet", "Cold Storage") */
  label: varchar("label", { length: 255 }),
  /** Whether this wallet is active for tracking */
  isActive: boolean("isActive").default(true).notNull(),
  /** Last time we successfully synced this wallet */
  lastSyncedAt: timestamp("lastSyncedAt"),
  /** Error message if last sync failed */
  lastSyncError: text("lastSyncError"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WalletAddress = typeof walletAddresses.$inferSelect;
export type InsertWalletAddress = typeof walletAddresses.$inferInsert;

/**
 * Asset Snapshots table - stores historical snapshots of user assets
 * This allows us to track asset value changes over time
 */
export const assetSnapshots = mysqlTable("asset_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  /** Reference to the user */
  userId: int("userId").notNull(),
  /** Total asset value in USD at this snapshot time */
  totalValueUsd: decimal("totalValueUsd", { precision: 20, scale: 2 }).notNull(),
  /** Total asset value in TWD at this snapshot time */
  totalValueTwd: decimal("totalValueTwd", { precision: 20, scale: 2 }).notNull(),
  /** JSON snapshot of all assets at this time */
  assetsData: text("assetsData").notNull(), // JSON stringified
  /** Source of this snapshot (e.g., 'manual', 'auto_sync') */
  source: varchar("source", { length: 32 }).default("auto_sync").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AssetSnapshot = typeof assetSnapshots.$inferSelect;
export type InsertAssetSnapshot = typeof assetSnapshots.$inferInsert;

/**
 * Relations for type safety
 */
export const usersRelations = relations(users, ({ many }) => ({
  apiKeys: many(apiKeys),
  walletAddresses: many(walletAddresses),
  assetSnapshots: many(assetSnapshots),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));

export const walletAddressesRelations = relations(walletAddresses, ({ one }) => ({
  user: one(users, {
    fields: [walletAddresses.userId],
    references: [users.id],
  }),
}));

export const assetSnapshotsRelations = relations(assetSnapshots, ({ one }) => ({
  user: one(users, {
    fields: [assetSnapshots.userId],
    references: [users.id],
  }),
}));