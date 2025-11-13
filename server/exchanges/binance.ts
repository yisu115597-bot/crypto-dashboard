/**
 * Binance Exchange API Adapter
 * Implements read-only access to user's Binance account assets
 */

import crypto from "crypto";
import { ExchangeAdapter, ExchangeAsset } from "./index";

export class BinanceAdapter implements ExchangeAdapter {
  name = "binance" as const;
  private baseUrl = "https://api.binance.com";

  /**
   * Fetch all assets from Binance account
   * Uses the Account endpoint to get all balances
   */
  async getAssets(apiKey: string, apiSecret: string): Promise<ExchangeAsset[]> {
    const endpoint = "/api/v3/account";
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = this.generateSignature(queryString, apiSecret);

    const url = `${this.baseUrl}${endpoint}?${queryString}&signature=${signature}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-MBX-APIKEY": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Binance API error: ${response.status} - ${error}`);
    }

    const data = (await response.json()) as { balances: Array<{ asset: string; free: string; locked: string }> };

    // Convert to our unified format
    return data.balances
      .map((balance) => ({
        symbol: balance.asset.toUpperCase(),
        free: parseFloat(balance.free),
        locked: parseFloat(balance.locked),
        total: parseFloat(balance.free) + parseFloat(balance.locked),
      }))
      .filter((asset) => asset.total > 0); // Only return non-zero balances
  }

  /**
   * Validate API credentials by making a simple read-only request
   */
  async validateCredentials(apiKey: string, apiSecret: string): Promise<boolean> {
    try {
      const endpoint = "/api/v3/account";
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      const signature = this.generateSignature(queryString, apiSecret);

      const url = `${this.baseUrl}${endpoint}?${queryString}&signature=${signature}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-MBX-APIKEY": apiKey,
          "Content-Type": "application/json",
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Generate HMAC-SHA256 signature for Binance API requests
   */
  private generateSignature(queryString: string, apiSecret: string): string {
    return crypto.createHmac("sha256", apiSecret).update(queryString).digest("hex");
  }
}
