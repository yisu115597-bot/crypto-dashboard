import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, apiKeys, walletAddresses, assetSnapshots, InsertApiKey, InsertWalletAddress, InsertAssetSnapshot } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * API Key Management
 */
export async function createApiKey(data: InsertApiKey): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(apiKeys).values(data);
}

export async function getApiKeysByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(apiKeys).where(eq(apiKeys.userId, userId));
}

export async function getApiKeyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(apiKeys).where(eq(apiKeys.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateApiKey(id: number, data: Partial<InsertApiKey>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(apiKeys).set(data).where(eq(apiKeys.id, id));
}

export async function deleteApiKey(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(apiKeys).where(eq(apiKeys.id, id));
}

/**
 * Wallet Address Management
 */
export async function createWalletAddress(data: InsertWalletAddress): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(walletAddresses).values(data);
}

export async function getWalletAddressesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(walletAddresses).where(eq(walletAddresses.userId, userId));
}

export async function getWalletAddressById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(walletAddresses).where(eq(walletAddresses.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateWalletAddress(id: number, data: Partial<InsertWalletAddress>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(walletAddresses).set(data).where(eq(walletAddresses.id, id));
}

export async function deleteWalletAddress(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(walletAddresses).where(eq(walletAddresses.id, id));
}

/**
 * Asset Snapshots
 */
export async function createAssetSnapshot(data: InsertAssetSnapshot): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(assetSnapshots).values(data);
}

export async function getLatestAssetSnapshot(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(assetSnapshots)
    .where(eq(assetSnapshots.userId, userId))
    .orderBy(desc(assetSnapshots.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAssetSnapshotHistory(userId: number, limit: number = 30) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(assetSnapshots)
    .where(eq(assetSnapshots.userId, userId))
    .orderBy(desc(assetSnapshots.createdAt))
    .limit(limit);
}
