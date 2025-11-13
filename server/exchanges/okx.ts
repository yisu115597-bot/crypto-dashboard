/**
 * OKX Exchange API Adapter
 * Implements read-only access to user's OKX account assets
 */

import crypto from "crypto";
import { ExchangeAdapter, ExchangeAsset } from "./index";

export class OKXAdapter implements ExchangeAdapter {
  name = "okx" as const;
  private baseUrl = "https://www.okx.com";

  /**
   * Fetch all assets from OKX account
   * Uses the Get Balance endpoint to get all balances
   */
  async getAssets(apiKey: string, apiSecret: string, passphrase: string): Promise<ExchangeAsset[]> {
    const endpoint = "/api/v5/account/balance";
    const timestamp = new Date().toISOString();

    const headers = this.generateHeaders(apiKey, apiSecret, passphrase, "GET", endpoint, timestamp);

    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OKX API error: ${response.status} - ${error}`);
    }

    const data = (await response.json()) as {
      code: string;
      data: Array<{
        details: Array<{
          ccy: string;
          availBal: string;
          frozenBal: string;
        }>;
      }>;
    };

    if (data.code !== "0") {
      throw new Error(`OKX API returned error code: ${data.code}`);
    }

    const assets: ExchangeAsset[] = [];

    // OKX returns balances grouped by account type
    for (const account of data.data) {
      for (const detail of account.details) {
        const available = parseFloat(detail.availBal);
        const frozen = parseFloat(detail.frozenBal);
        const total = available + frozen;

        if (total > 0) {
          assets.push({
            symbol: detail.ccy.toUpperCase(),
            free: available,
            locked: frozen,
            total,
          });
        }
      }
    }

    return assets;
  }

  /**
   * Validate API credentials by making a simple read-only request
   */
  async validateCredentials(apiKey: string, apiSecret: string, passphrase: string): Promise<boolean> {
    try {
      const endpoint = "/api/v5/account/balance";
      const timestamp = new Date().toISOString();

      const headers = this.generateHeaders(apiKey, apiSecret, passphrase, "GET", endpoint, timestamp);

      const url = `${this.baseUrl}${endpoint}`;

      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Generate OKX API headers with signature
   * OKX uses a different signature method than Binance
   */
  private generateHeaders(
    apiKey: string,
    apiSecret: string,
    passphrase: string,
    method: string,
    endpoint: string,
    timestamp: string
  ): Record<string, string> {
    const message = timestamp + method + endpoint;
    const signature = crypto.createHmac("sha256", apiSecret).update(message).digest("base64");

    return {
      "OK-ACCESS-KEY": apiKey,
      "OK-ACCESS-SIGN": signature,
      "OK-ACCESS-TIMESTAMP": timestamp,
      "OK-ACCESS-PASSPHRASE": passphrase,
      "Content-Type": "application/json",
    };
  }
}
