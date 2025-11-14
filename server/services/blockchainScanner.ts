/**
 * Blockchain Scanner Service
 * Scans blockchain addresses for token balances using Etherscan API
 * Supports: Ethereum, BSC, Polygon, Arbitrum, Optimism, and more
 */

import { ENV } from "../_core/env";

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string; // Raw balance (not divided by decimals)
  decimals: number;
  contractAddress: string;
  value?: number; // USD value (calculated later)
}

export interface NativeBalance {
  symbol: string;
  name: string;
  balance: string; // In wei for EVM chains
  decimals: number;
}

/**
 * Network configuration for Etherscan API
 * Each network has its own API endpoint
 */
const NETWORK_CONFIG: Record<
  string,
  {
    apiUrl: string;
    symbol: string;
    decimals: number;
  }
> = {
  ethereum: {
    apiUrl: "https://api.etherscan.io/api",
    symbol: "ETH",
    decimals: 18,
  },
  bsc: {
    apiUrl: "https://api.bscscan.com/api",
    symbol: "BNB",
    decimals: 18,
  },
  polygon: {
    apiUrl: "https://api.polygonscan.com/api",
    symbol: "MATIC",
    decimals: 18,
  },
  arbitrum: {
    apiUrl: "https://api.arbiscan.io/api",
    symbol: "ETH",
    decimals: 18,
  },
  optimism: {
    apiUrl: "https://api-optimistic.etherscan.io/api",
    symbol: "ETH",
    decimals: 18,
  },
  tron: {
    apiUrl: "https://api.tronscan.org/api",
    symbol: "TRX",
    decimals: 6,
  },
};

/**
 * Retry logic for API calls
 */
async function fetchWithRetry(
  url: string,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<any> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "CryptoDashboard/1.0",
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limited, wait and retry
          await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
          continue;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === "0" && data.message === "NOTOK") {
        throw new Error(data.result || "API error");
      }

      return data;
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }
}

/**
 * Get native coin balance (ETH, BNB, MATIC, etc.)
 */
export async function getNativeBalance(
  network: string,
  address: string
): Promise<NativeBalance | null> {
  try {
    const config = NETWORK_CONFIG[network.toLowerCase()];
    if (!config) {
      throw new Error(`Unsupported network: ${network}`);
    }

    if (!ENV.etherscanApiKey) {
      console.warn("[BlockchainScanner] ETHERSCAN_API_KEY not configured");
      return null;
    }

    const url = `${config.apiUrl}?module=account&action=balance&address=${address}&tag=latest&apikey=${ENV.etherscanApiKey}`;

    const data = await fetchWithRetry(url);

    if (data.result === "0") {
      return {
        symbol: config.symbol,
        name: config.symbol,
        balance: "0",
        decimals: config.decimals,
      };
    }

    return {
      symbol: config.symbol,
      name: config.symbol,
      balance: data.result,
      decimals: config.decimals,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[BlockchainScanner] Error getting native balance for ${network}:`, errorMsg);
    return null;
  }
}

/**
 * Get ERC-20 token balances for an address
 */
export async function getTokenBalances(
  network: string,
  address: string
): Promise<TokenBalance[]> {
  try {
    const config = NETWORK_CONFIG[network.toLowerCase()];
    if (!config) {
      throw new Error(`Unsupported network: ${network}`);
    }

    if (!ENV.etherscanApiKey) {
      console.warn("[BlockchainScanner] ETHERSCAN_API_KEY not configured");
      return [];
    }

    // For TRON, use different API
    if (network.toLowerCase() === "tron") {
      return getTronTokenBalances(address);
    }

    const url = `${config.apiUrl}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${ENV.etherscanApiKey}`;

    const data = await fetchWithRetry(url);

    if (!data.result || data.result.length === 0) {
      return [];
    }

    // Group tokens by contract address to get unique tokens
    const tokenMap = new Map<string, TokenBalance>();

    for (const tx of data.result) {
      const contractAddr = tx.contractAddress.toLowerCase();

      if (!tokenMap.has(contractAddr)) {
        tokenMap.set(contractAddr, {
          symbol: tx.tokenSymbol || "UNKNOWN",
          name: tx.tokenName || "Unknown Token",
          balance: "0",
          decimals: parseInt(tx.tokenDecimal || "18"),
          contractAddress: tx.contractAddress,
        });
      }
    }

    // Get current balances for each token
    const tokens: TokenBalance[] = [];

    const tokenEntries = Array.from(tokenMap.entries());
    for (const [contractAddr, token] of tokenEntries) {
      try {
        const balanceUrl = `${config.apiUrl}?module=account&action=tokenbalance&contractaddress=${contractAddr}&address=${address}&tag=latest&apikey=${ENV.etherscanApiKey}`;

        const balanceData = await fetchWithRetry(balanceUrl);

        if (balanceData.result && balanceData.result !== "0") {
          tokens.push({
            ...token,
            balance: balanceData.result,
          });
        }
      } catch (error) {
        console.warn(`[BlockchainScanner] Failed to get balance for token ${contractAddr}`);
      }
    }

    return tokens;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[BlockchainScanner] Error getting token balances for ${network}:`, errorMsg);
    return [];
  }
}

/**
 * Get TRON token balances (TRC-20)
 */
async function getTronTokenBalances(address: string): Promise<TokenBalance[]> {
  try {
    const url = `https://api.tronscan.org/api/account/tokens?address=${address}&limit=200`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "CryptoDashboard/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return [];
    }

    return data.data.map((token: any) => ({
      symbol: token.symbol || "UNKNOWN",
      name: token.name || "Unknown Token",
      balance: token.balance || "0",
      decimals: token.decimals || 6,
      contractAddress: token.tokenID,
    }));
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("[BlockchainScanner] Error getting TRON token balances:", errorMsg);
    return [];
  }
}

/**
 * Scan a wallet address on a specific network
 * Returns both native coin and token balances
 */
export async function scanWallet(
  network: string,
  address: string
): Promise<{
  native: NativeBalance | null;
  tokens: TokenBalance[];
}> {
  try {
    // Validate address format
    if (!address || address.length === 0) {
      throw new Error("Invalid address");
    }

    // Normalize address
    const normalizedAddress = address.trim();

    // Get native balance
    const native = await getNativeBalance(network, normalizedAddress);

    // Get token balances
    const tokens = await getTokenBalances(network, normalizedAddress);

    return {
      native,
      tokens,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[BlockchainScanner] Error scanning wallet ${address} on ${network}:`, errorMsg);
    return {
      native: null,
      tokens: [],
    };
  }
}

/**
 * Get supported networks
 */
export function getSupportedNetworks(): string[] {
  return Object.keys(NETWORK_CONFIG);
}

/**
 * Validate if network is supported
 */
export function isSupportedNetwork(network: string): boolean {
  return network.toLowerCase() in NETWORK_CONFIG;
}

/**
 * Get network info
 */
export function getNetworkInfo(network: string) {
  return NETWORK_CONFIG[network.toLowerCase()];
}
