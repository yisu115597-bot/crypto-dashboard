import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { encryptString, decryptString } from "./crypto";
import { getAdapter } from "./exchanges";
import {
  createApiKey,
  getApiKeysByUserId,
  getApiKeyById,
  updateApiKey,
  deleteApiKey,
  createWalletAddress,
  getWalletAddressesByUserId,
  getWalletAddressById,
  updateWalletAddress,
  deleteWalletAddress,
  getLatestAssetSnapshot,
  getAssetSnapshotHistory,
} from "./db";
import { syncUserAssets } from "./services/assetSync";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  /**
   * API Keys Router - Manage exchange API credentials
   */
  apiKeys: router({
    /**
     * Add a new API key for an exchange
     */
    add: protectedProcedure
      .input(
        z.object({
          exchange: z.enum(["binance", "okx"]),
          apiKey: z.string().min(1),
          apiSecret: z.string().min(1),
          passphrase: z.string().optional(),
          label: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Validate credentials with the exchange
        const adapter = getAdapter(input.exchange);
        const isValid = await adapter.validateCredentials(
          input.apiKey,
          input.apiSecret,
          input.passphrase
        );

        if (!isValid) {
          throw new Error("Invalid API credentials. Please check your API key and secret.");
        }

        // Encrypt credentials before storing
        const encryptedApiKey = encryptString(input.apiKey);
        const encryptedApiSecret = encryptString(input.apiSecret);
        const encryptedPassphrase = input.passphrase ? encryptString(input.passphrase) : null;

        await createApiKey({
          userId: ctx.user.id,
          exchange: input.exchange,
          encryptedApiKey,
          encryptedApiSecret,
          encryptedPassphrase: encryptedPassphrase || undefined,
          label: input.label,
          isActive: true,
        });

        return { success: true };
      }),

    /**
     * List all API keys for the current user
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      const keys = await getApiKeysByUserId(ctx.user.id);
      // Don't return encrypted values to the client
      return keys.map((key) => ({
        id: key.id,
        exchange: key.exchange,
        label: key.label,
        isActive: key.isActive,
        lastSyncedAt: key.lastSyncedAt,
        lastSyncError: key.lastSyncError,
        createdAt: key.createdAt,
      }));
    }),

    /**
     * Delete an API key
     */
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const key = await getApiKeyById(input.id);
        if (!key || key.userId !== ctx.user.id) {
          throw new Error("API key not found");
        }
        await deleteApiKey(input.id);
        return { success: true };
      }),

    /**
     * Update an API key (label or active status)
     */
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          label: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const key = await getApiKeyById(input.id);
        if (!key || key.userId !== ctx.user.id) {
          throw new Error("API key not found");
        }
        await updateApiKey(input.id, {
          label: input.label,
          isActive: input.isActive,
        });
        return { success: true };
      }),
  }),

  /**
   * Wallet Addresses Router - Manage blockchain wallet tracking
   */
  wallets: router({
    /**
     * Add a new wallet address to track
     */
    add: protectedProcedure
      .input(
        z.object({
          network: z.enum(["ethereum", "bsc", "polygon", "arbitrum", "tron"]),
          address: z.string().min(1),
          label: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // TODO: Validate wallet address format
        await createWalletAddress({
          userId: ctx.user.id,
          network: input.network,
          address: input.address,
          label: input.label,
          isActive: true,
        });
        return { success: true };
      }),

    /**
     * List all wallet addresses for the current user
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getWalletAddressesByUserId(ctx.user.id);
    }),

    /**
     * Delete a wallet address
     */
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const wallet = await getWalletAddressById(input.id);
        if (!wallet || wallet.userId !== ctx.user.id) {
          throw new Error("Wallet address not found");
        }
        await deleteWalletAddress(input.id);
        return { success: true };
      }),

    /**
     * Update a wallet address (label or active status)
     */
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          label: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const wallet = await getWalletAddressById(input.id);
        if (!wallet || wallet.userId !== ctx.user.id) {
          throw new Error("Wallet address not found");
        }
        await updateWalletAddress(input.id, {
          label: input.label,
          isActive: input.isActive,
        });
        return { success: true };
      }),
  }),

  /**
   * Assets Router - Get asset data and sync status
   */
  assets: router({
    /**
     * Get the latest asset snapshot for the current user
     */
    getLatest: protectedProcedure.query(async ({ ctx }) => {
      const snapshot = await getLatestAssetSnapshot(ctx.user.id);
      if (!snapshot) {
        return null;
      }
      return {
        ...snapshot,
        assetsData: JSON.parse(snapshot.assetsData),
      };
    }),

    /**
     * Get asset snapshot history
     */
    getHistory: protectedProcedure
      .input(z.object({ limit: z.number().default(30) }))
      .query(async ({ ctx, input }) => {
        const snapshots = await getAssetSnapshotHistory(ctx.user.id, input.limit);
        return snapshots.map((snapshot) => ({
          ...snapshot,
          assetsData: JSON.parse(snapshot.assetsData),
        }));
      }),

    /**
     * Manually trigger asset sync for the current user
     */
    sync: protectedProcedure.mutation(async ({ ctx }) => {
      const result = await syncUserAssets(ctx.user.id);
      return result;
    }),
  }),
});

export type AppRouter = typeof appRouter;
