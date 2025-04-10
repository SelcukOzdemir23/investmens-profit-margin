
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
export const FINANCE_API_URL = "https://finance.truncgil.com/api/today.json";

// Interface for the API response
export interface FinanceApiResponse {
  Meta_Data: {
    Minutes_Ago: number;
    Current_Date: string;
    Update_Date: string;
  };
  Rates: {
    USD: {
      Type: string;
      Change: number;
      Name: string;
      Buying: number;
      Selling: number;
    };
    EUR: {
      Type: string;
      Change: number;
      Name: string;
      Buying: number;
      Selling: number;
    };
    GRA: {
      Type: string;
      Change: number;
      Name: string;
      Buying: number;
      Selling: number;
    };
    [key: string]: {
      Type: string;
      Change: number;
      Name: string;
      Buying: number;
      Selling: number;
    };
  };
}

// Function to fetch real exchange rates from the API
export const fetchExchangeRates = async (): Promise<{ [key in AssetType]: number }> => {
  try {
    const response = await fetch(FINANCE_API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }
    
    const data: FinanceApiResponse = await response.json();
    
    return {
      [AssetType.GOLD]: data.Rates.GRA.Buying,
      [AssetType.DOLLAR]: data.Rates.USD.Buying,
      [AssetType.EURO]: data.Rates.EUR.Buying
    };
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    // Fallback to mock data
    return getExchangeRates(new Date());
  }
};

// Mock exchange rates as fallback - in a real application, these would come from an API
export const getExchangeRates = (date: Date): { [key in AssetType]: number } => {
  // In a real app, you would fetch these from an API based on the date
  // For this demo, we'll use deterministic mock data based on the day of the month
  const day = date.getDate();
  const month = date.getMonth();
  
  // Base rates (these would come from an API in a real app)
  const baseGoldRate = 2100 + (day % 10) * 20; // TL per gram
  const baseDollarRate = 32.5 + (day % 5) * 0.2; // TL per dollar
  const baseEuroRate = 35.2 + (day % 5) * 0.25; // TL per euro
  
  // Add some monthly variation
  const monthlyFactor = 1 + (month % 3) * 0.02;
  
  return {
    [AssetType.GOLD]: baseGoldRate * monthlyFactor,
    [AssetType.DOLLAR]: baseDollarRate * monthlyFactor,
    [AssetType.EURO]: baseEuroRate * monthlyFactor
  };
};
