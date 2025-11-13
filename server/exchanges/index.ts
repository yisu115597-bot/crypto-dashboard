/**
 * Exchange API adapters
 * Unified interface for fetching asset data from different exchanges
 */

import { BinanceAdapter } from "./binance";
import { OKXAdapter } from "./okx";

export type ExchangeName = "binance" | "okx";

export interface ExchangeAsset {
  symbol: string;
  free: number;
  locked: number;
  total: number;
}

export interface ExchangeAdapter {
  name: ExchangeName;
  /**
   * Fetch all assets from the exchange
   * Should only use read-only API endpoints
   */
  getAssets(apiKey: string, apiSecret: string, passphrase?: string): Promise<ExchangeAsset[]>;
  /**
   * Validate API credentials without making expensive requests
   */
  validateCredentials(apiKey: string, apiSecret: string, passphrase?: string): Promise<boolean>;
}

// Registry of available adapters
const adapters: Record<ExchangeName, ExchangeAdapter> = {
  binance: new BinanceAdapter(),
  okx: new OKXAdapter(),
};

export function getAdapter(exchange: ExchangeName): ExchangeAdapter {
  const adapter = adapters[exchange];
  if (!adapter) {
    throw new Error(`Unsupported exchange: ${exchange}`);
  }
  return adapter;
}

export function getSupportedExchanges(): ExchangeName[] {
  return Object.keys(adapters) as ExchangeName[];
}
