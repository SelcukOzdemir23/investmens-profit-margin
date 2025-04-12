// Asset types
export enum AssetType {
  GOLD = "gold",
  DOLLAR = "dollar",
  EURO = "euro"
}

// Asset symbols
export const AssetSymbol = {
  [AssetType.GOLD]: "g",
  [AssetType.DOLLAR]: "$",
  [AssetType.EURO]: "€"
};

// Asset colors for theming
export const AssetColor = {
  [AssetType.GOLD]: "gold",
  [AssetType.DOLLAR]: "dollar",
  [AssetType.EURO]: "euro"
};

// Asset labels for display
export const AssetLabel = {
  [AssetType.GOLD]: "Gold",
  [AssetType.DOLLAR]: "Dollar",
  [AssetType.EURO]: "Euro"
};

// API URL
export const FINANCE_API_URL = "https://finans.truncgil.com/today.json";

// Interface for the API response
export interface FinanceApiResponse {
  Update_Date: string;
  USD: CurrencyRate;
  EUR: CurrencyRate;
  "gram-altin": CurrencyRate;
}

export interface CurrencyRate {
  Alış: string;
  Satış: string;
  Değişim: string;
  Tür: string;
}

// Investment interface
export interface Investment {
  id: string;
  type: AssetType;
  amount: number;
  buyingRate: number;
  tlValueThen: number;
  date: Date;
}

// Real-time data interface
export interface RealTimeData {
  currentRate: number;
  tlValue: number;
  profitLoss: number;
  profitLossPercentage: number;
}
