/**
 * Asset Synchronization Service
 * Handles periodic syncing of assets from exchanges and wallets
 */

import { decryptObject } from "../crypto";
import { getAdapter } from "../exchanges";
import { ExchangeName } from "../exchanges";
import { getApiKeysByUserId, getWalletAddressesByUserId, createAssetSnapshot, updateApiKey, updateWalletAddress } from "../db";

export interface SyncResult {
  success: boolean;
  error?: string;
  assetsCount?: number;
}

/**
 * Sync assets for a specific user from all their API keys and wallets
 */
export async function syncUserAssets(userId: number): Promise<SyncResult> {
  try {
    const apiKeyRecords = await getApiKeysByUserId(userId);
    const walletRecords = await getWalletAddressesByUserId(userId);

    const allAssets: Record<string, { symbol: string; free: number; locked: number; total: number; source: string }> = {};
    let hasErrors = false;

    // Sync from API keys (exchanges)
    for (const keyRecord of apiKeyRecords) {
      if (!keyRecord.isActive) continue;

      try {
        const decrypted = decryptObject({
          apiKey: keyRecord.encryptedApiKey,
          apiSecret: keyRecord.encryptedApiSecret,
          passphrase: keyRecord.encryptedPassphrase || "",
        });

        const adapter = getAdapter(keyRecord.exchange as ExchangeName);
        const assets = await adapter.getAssets(
          decrypted.apiKey,
          decrypted.apiSecret,
          decrypted.passphrase || undefined
        );

        // Add exchange prefix to asset key to avoid conflicts
        for (const asset of assets) {
          const key = `${keyRecord.exchange}:${asset.symbol}`;
          allAssets[key] = {
            ...asset,
            source: keyRecord.exchange,
          };
        }

        // Update last sync time
        await updateApiKey(keyRecord.id, {
          lastSyncedAt: new Date(),
          lastSyncError: null,
        });
      } catch (error) {
        hasErrors = true;
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        console.error(`[AssetSync] Error syncing API key ${keyRecord.id}:`, errorMsg);

        // Update error status
        await updateApiKey(keyRecord.id, {
          lastSyncError: errorMsg,
        });
      }
    }

    // Sync from wallets (blockchain addresses)
    for (const walletRecord of walletRecords) {
      if (!walletRecord.isActive) continue;

      try {
        // TODO: Implement blockchain wallet scanning
        // This will require integration with Etherscan, BscScan, etc.
        // For now, we'll skip wallet syncing

        await updateWalletAddress(walletRecord.id, {
          lastSyncedAt: new Date(),
          lastSyncError: null,
        });
      } catch (error) {
        hasErrors = true;
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        console.error(`[AssetSync] Error syncing wallet ${walletRecord.id}:`, errorMsg);

        await updateWalletAddress(walletRecord.id, {
          lastSyncError: errorMsg,
        });
      }
    }

    // Create asset snapshot
    // TODO: Get current prices from CoinGecko/CoinMarketCap and calculate total values
    const snapshot = {
      userId,
      totalValueUsd: "0.00",
      totalValueTwd: "0.00",
      assetsData: JSON.stringify(allAssets),
      source: "auto_sync" as const,
    };

    await createAssetSnapshot(snapshot);

    return {
      success: !hasErrors,
      assetsCount: Object.keys(allAssets).length,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[AssetSync] Error syncing user ${userId}:`, errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Start background sync job (runs every N minutes)
 * This should be called once when the server starts
 */
export function startAssetSyncJob(intervalMinutes: number = 10) {
  console.log(`[AssetSync] Starting asset sync job (interval: ${intervalMinutes} minutes)`);

  // TODO: Implement periodic sync for all users
  // This will require:
  // 1. Getting all active users
  // 2. Running syncUserAssets for each user
  // 3. Handling rate limiting for exchange APIs
  // 4. Proper error handling and logging

  setInterval(() => {
    console.log("[AssetSync] Running periodic sync job...");
    // TODO: Implement actual sync logic
  }, intervalMinutes * 60 * 1000);
}
