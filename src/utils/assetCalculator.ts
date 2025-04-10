
import { AssetType, getExchangeRates, fetchExchangeRates } from "@/lib/constants";

export interface AssetEntry {
  id: string;
  date: Date;
  type: AssetType;
  amount: number;
  exchangeRate: number;
  tlValue: number;
}

// Cache for exchange rates to avoid unnecessary API calls
let cachedRates: { [key in AssetType]: number } | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Calculate TL value based on asset type, amount, and date
export const calculateTLValue = async (
  assetType: AssetType,
  amount: number,
  date: Date = new Date()
): Promise<{ exchangeRate: number; tlValue: number }> => {
  let rates;
  
  // If current date (today), use real-time rates from API
  const isToday = new Date().toDateString() === date.toDateString();
  
  if (isToday) {
    // Check if we have cached rates and if they're still valid
    const now = Date.now();
    if (cachedRates && (now - lastFetchTime < CACHE_DURATION)) {
      rates = cachedRates;
    } else {
      // Fetch new rates from API
      rates = await fetchExchangeRates();
      // Update cache
      cachedRates = rates;
      lastFetchTime = now;
    }
  } else {
    // For historical dates, use mock data
    rates = getExchangeRates(date);
  }
  
  const exchangeRate = rates[assetType];
  const tlValue = amount * exchangeRate;
  
  return {
    exchangeRate,
    tlValue
  };
};

// Calculate profit/loss between two dates
export const calculateProfitMargin = async (
  assetType: AssetType,
  amount: number,
  entryDate: Date,
  currentDate: Date = new Date()
): Promise<{
  initialValue: number;
  currentValue: number;
  profitLossAmount: number;
  profitLossPercentage: number;
}> => {
  const initialResult = await calculateTLValue(assetType, amount, entryDate);
  const currentResult = await calculateTLValue(assetType, amount, currentDate);
  
  const initialValue = initialResult.tlValue;
  const currentValue = currentResult.tlValue;
  
  const profitLossAmount = currentValue - initialValue;
  const profitLossPercentage = (profitLossAmount / initialValue) * 100;
  
  return {
    initialValue,
    currentValue,
    profitLossAmount,
    profitLossPercentage
  };
};

// Format currency with the correct locale
export const formatCurrency = (
  value: number,
  currency: string = "TRY",
  locale: string = "tr-TR"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Format percentage
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat("tr-TR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
};

// Format date
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
};
