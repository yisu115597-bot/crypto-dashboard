/**
 * Price Data Service
 * Fetches cryptocurrency prices from CoinGecko API
 */

// Cache for prices (in-memory, expires after 5 minutes)
const priceCache: Record<string, { price: number; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get price for a cryptocurrency
 * Uses CoinGecko's free API (no authentication required)
 */
export async function getCryptoPrice(symbol: string, currency: "usd" | "twd" = "usd"): Promise<number | null> {
  const cacheKey = `${symbol.toLowerCase()}_${currency}`;

  // Check cache first
  const cached = priceCache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }

  try {
    // CoinGecko API endpoint
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=${currency}&include_market_cap=false&include_24hr_vol=false`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`[PriceService] Failed to fetch price for ${symbol}: ${response.status}`);
      return null;
    }

    const data = (await response.json()) as Record<string, Record<string, number>>;
    const price = data[symbol.toLowerCase()]?.[currency];

    if (price !== undefined) {
      // Cache the price
      priceCache[cacheKey] = { price, timestamp: Date.now() };
      return price;
    }

    return null;
  } catch (error) {
    console.error(`[PriceService] Error fetching price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get prices for multiple cryptocurrencies at once
 * More efficient than calling getCryptoPrice multiple times
 */
export async function getCryptoPrices(
  symbols: string[],
  currency: "usd" | "twd" = "usd"
): Promise<Record<string, number | null>> {
  const results: Record<string, number | null> = {};

  try {
    // CoinGecko API supports multiple IDs
    const ids = symbols.map((s) => s.toLowerCase()).join(",");
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${currency}&include_market_cap=false&include_24hr_vol=false`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`[PriceService] Failed to fetch prices: ${response.status}`);
      // Return nulls for all symbols
      symbols.forEach((symbol) => {
        results[symbol] = null;
      });
      return results;
    }

    const data = (await response.json()) as Record<string, Record<string, number>>;

    // Extract prices and cache them
    symbols.forEach((symbol) => {
      const price = data[symbol.toLowerCase()]?.[currency];
      results[symbol] = price ?? null;

      if (price !== undefined) {
        const cacheKey = `${symbol.toLowerCase()}_${currency}`;
        priceCache[cacheKey] = { price, timestamp: Date.now() };
      }
    });

    return results;
  } catch (error) {
    console.error("[PriceService] Error fetching prices:", error);
    // Return nulls for all symbols on error
    symbols.forEach((symbol) => {
      results[symbol] = null;
    });
    return results;
  }
}

/**
 * Convert amount from one currency to another
 */
export async function convertCurrency(amount: number, from: "usd" | "twd", to: "usd" | "twd"): Promise<number> {
  if (from === to) {
    return amount;
  }

  // Simple conversion using a fixed rate (in production, use real exchange rates)
  const usdToTwd = 31.5; // Approximate rate

  if (from === "usd" && to === "twd") {
    return amount * usdToTwd;
  } else if (from === "twd" && to === "usd") {
    return amount / usdToTwd;
  }

  return amount;
}

/**
 * Clear price cache (useful for testing or manual refresh)
 */
export function clearPriceCache(): void {
  Object.keys(priceCache).forEach((key) => {
    delete priceCache[key];
  });
  console.log("[PriceService] Price cache cleared");
}
