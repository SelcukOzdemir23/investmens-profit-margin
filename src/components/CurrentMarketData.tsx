import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, DollarSign, Euro } from "lucide-react";
import { FINANCE_API_URL } from "@/lib/constants";
import { useLanguage } from "@/contexts/LanguageContext";
import type { FinanceApiResponse } from "@/lib/constants";

const CurrentMarketData = () => {
  const { t, language } = useLanguage();
  const [data, setData] = useState<FinanceApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(FINANCE_API_URL);
        if (!response.ok) throw new Error("API request failed");
        const jsonData = await response.json();
        setData(jsonData);
        setLastUpdate(new Date().toLocaleTimeString());
      } catch (error) {
        console.error("Error fetching rates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (value: number) => {
    return value.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const renderRateCard = (
    icon: JSX.Element,
    name: string,
    buying: number,
    selling: number,
    change: number,
    colorClass: string
  ) => (
    <Card className="p-4 glass-card">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="font-medium">{name}</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">{t("buying")}</p>
          <p className="font-medium">{formatNumber(buying)} ₺</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("selling")}</p>
          <p className="font-medium">{formatNumber(selling)} ₺</p>
        </div>
      </div>
      <div className="mt-2">
        <p className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '▲' : '▼'} {Math.abs(change)}%
        </p>
      </div>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-24 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-8">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">{t("currentRates")}</h2>
        <p className="text-xs text-muted-foreground">{t("lastUpdate")}: {lastUpdate}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data && (
          <>
            {renderRateCard(
              <DollarSign className="h-5 w-5 text-dollar" />,
              data.Rates.USD.Name,
              data.Rates.USD.Buying,
              data.Rates.USD.Selling,
              data.Rates.USD.Change,
              "text-dollar"
            )}
            {renderRateCard(
              <Euro className="h-5 w-5 text-euro" />,
              data.Rates.EUR.Name,
              data.Rates.EUR.Buying,
              data.Rates.EUR.Selling,
              data.Rates.EUR.Change,
              "text-euro"
            )}
            {renderRateCard(
              <Coins className="h-5 w-5 text-gold" />,
              data.Rates.GRA.Name,
              data.Rates.GRA.Buying,
              data.Rates.GRA.Selling,
              data.Rates.GRA.Change,
              "text-gold"
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CurrentMarketData;