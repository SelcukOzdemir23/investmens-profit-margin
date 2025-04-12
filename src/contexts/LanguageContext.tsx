import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "tr";

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

// All translations for both languages
export const translations: Translations = {
  en: {
    appTitle: "Investment Tracker",
    appDescription: "Track your investments in gold, dollars, and euros, and calculate profit margins over time.",
    yourInvestments: "Your Investments",
    assetType: "Asset Type",
    amount: "Amount",
    investmentDate: "Investment Date",
    addInvestment: "Add Investment",
    adding: "Adding...",
    selectAssetType: "Select asset type",
    noInvestments: "No investments found. Add your first investment above.",
    noMatchingInvestments: "No investments match the selected filter.",
    gramsOfGold: "Grams of gold",
    selectDate: "Select a date",
    invalidAmount: "Invalid amount",
    invalidAmountDescription: "Please enter a valid positive amount",
    assetAdded: "Asset Added",
    assetAddedDescription: "Your investment has been recorded successfully.",
    errorAddingAsset: "Error adding asset",
    errorAddingAssetDescription: "There was a problem adding your investment. Please try again.",
    delete: "Delete",
    all: "All",
    gold: "Gold",
    dollar: "Dollar",
    euro: "Euro",
    currentValue: "Current Value",
    purchaseValue: "Purchase Value",
    profitLoss: "Profit/Loss",
    profitPercent: "Profit %",
    language: "Language",
    english: "English",
    turkish: "Turkish",
    exchangeRate: "Exchange Rate",
    confirm: "Confirm",
    cancel: "Cancel",
    deleteInvestment: "Delete Investment",
    deleteInvestmentConfirm: "Are you sure you want to delete this investment?",
    loading: "Loading...",
    buyingRate: "Buying Rate",
    sellingRate: "Selling Rate",
    currentMarket: "Live Market Rates",
    lastUpdate: "Last Update",
    usDollar: "US Dollar",
    goldGram: "Gold (gram)",
    currentRate: "Current Rate",
    initialValue: "Initial Value",
    errorRates: "Error Fetching Rates",
    errorRatesDescription: "Could not fetch current exchange rates. Please try again.",
    marketRates: "Market Rates"
  },
  tr: {
    appTitle: "Yatırım Takipçisi",
    appDescription: "Altın, dolar ve avro yatırımlarınızı takip edin ve zaman içindeki kâr marjlarını hesaplayın.",
    yourInvestments: "Yatırımlarınız",
    assetType: "Varlık Türü",
    amount: "Miktar",
    investmentDate: "Yatırım Tarihi",
    addInvestment: "Yatırım Ekle",
    adding: "Ekleniyor...",
    selectAssetType: "Varlık türü seçin",
    noInvestments: "Hiç yatırım bulunamadı. İlk yatırımınızı yukarıdan ekleyin.",
    noMatchingInvestments: "Seçilen filtreyle eşleşen yatırım yok.",
    gramsOfGold: "Altın gramı",
    selectDate: "Bir tarih seçin",
    invalidAmount: "Geçersiz miktar",
    invalidAmountDescription: "Lütfen geçerli bir pozitif miktar girin",
    assetAdded: "Varlık Eklendi",
    assetAddedDescription: "Yatırımınız başarıyla kaydedildi.",
    errorAddingAsset: "Varlık eklenirken hata",
    errorAddingAssetDescription: "Yatırımınızı eklerken bir sorun oluştu. Lütfen tekrar deneyin.",
    delete: "Sil",
    all: "Tümü",
    gold: "Altın",
    dollar: "Dolar",
    euro: "Euro",
    currentValue: "Güncel Değer",
    purchaseValue: "Alış Değeri",
    profitLoss: "Kâr/Zarar",
    profitPercent: "Kâr %",
    language: "Dil",
    english: "İngilizce",
    turkish: "Türkçe",
    exchangeRate: "Döviz Kuru",
    confirm: "Onayla",
    cancel: "İptal",
    deleteInvestment: "Yatırımı Sil",
    deleteInvestmentConfirm: "Bu yatırımı silmek istediğinizden emin misiniz?",
    loading: "Yükleniyor...",
    buyingRate: "Alış",
    sellingRate: "Satış",
    currentMarket: "Güncel Piyasa Kurları",
    lastUpdate: "Son Güncelleme",
    usDollar: "Amerikan Doları",
    euroCurrency: "Euro",
    goldGram: "Gram Altın",
    currentRate: "Güncel Kur",
    initialValue: "Başlangıç Değeri",
    errorRates: "Kur Bilgisi Alınamadı",
    errorRatesDescription: "Güncel kur bilgileri alınamadı. Lütfen tekrar deneyin.",
    marketRates: "Piyasa Kurları"
  }
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get the language from localStorage or use browser language
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang && (savedLang === "en" || savedLang === "tr")) {
      return savedLang;
    }
    
    // Check browser language
    const browserLang = navigator.language.split("-")[0];
    return browserLang === "tr" ? "tr" : "en";
  });

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
