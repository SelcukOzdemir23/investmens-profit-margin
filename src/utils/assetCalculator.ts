import { AssetType, FINANCE_API_URL } from "@/lib/constants";
import type { FinanceApiResponse } from "@/lib/constants";

export interface AssetEntry {
  id: string;
  date: Date;
  type: AssetType;
  amount: number;
  exchangeRate: number;
  tlValue: number;
}

// Cache for exchange rates to avoid unnecessary API calls
let cachedRates: FinanceApiResponse | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const fetchCurrentRates = async (): Promise<FinanceApiResponse> => {
  const now = Date.now();
  if (cachedRates && (now - lastFetchTime < CACHE_DURATION)) {
    return cachedRates;
  }

  const response = await fetch(FINANCE_API_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch current rates');
  }

  const data = await response.json();
  cachedRates = data;
  lastFetchTime = now;
  return data;
};

export const getCurrentRate = (rates: FinanceApiResponse, assetType: AssetType): number => {
  switch (assetType) {
    case AssetType.GOLD:
      return rates.Rates.GRA.Buying;
    case AssetType.DOLLAR:
      return rates.Rates.USD.Buying;
    case AssetType.EURO:
      return rates.Rates.EUR.Buying;
    default:
      throw new Error('Invalid asset type');
  }
};

export interface ProfitCalculation {
  grossProfit: number;     // FR-CALC-001: Sales Price - COGS (current value - initial value)
  profitMargin: number;    // FR-CALC-002: (Gross Profit / Sales Price) * 100
  currentValue: number;    // Current TRY value
  currentRate: number;     // Current exchange rate
}

export const calculateProfit = async (
  assetType: AssetType,
  amount: number,
  initialValue: number
): Promise<ProfitCalculation> => {
  const rates = await fetchCurrentRates();
  const currentRate = getCurrentRate(rates, assetType);
  const currentValue = amount * currentRate;
  
  // FR-CALC-001: Calculate Gross Profit (current value - initial value)
  const grossProfit = currentValue - initialValue;
  
  // FR-CALC-002: Calculate Profit Margin ((Gross Profit / Sales Price) * 100)
  // If current value is 0, margin is treated as 0
  const profitMargin = currentValue !== 0 
    ? (grossProfit / currentValue) * 100 
    : 0;

  return {
    grossProfit,
    profitMargin,
    currentValue,
    currentRate
  };
};

// Format currency with the correct locale
export const formatCurrency = (
  value: number,
  locale: string = "tr-TR",
  currency: string = "TRY"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Format percentage with 2 decimal places
export const formatPercentage = (value: number, locale: string = "tr-TR"): string => {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
};
