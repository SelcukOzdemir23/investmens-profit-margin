import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Coins, DollarSign, Euro, RefreshCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MarketData {
  USD: {
    Alış: string;
    Satış: string;
    Değişim: string;
  };
  EUR: {
    Alış: string;
    Satış: string;
    Değişim: string;
  };
  "gram-altin": {
    Alış: string;
    Satış: string;
    Değişim: string;
  };
  Update_Date: string;
}

const CurrentMarketData = () => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const { t } = useLanguage();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://finans.truncgil.com/today.json");
      const data = await response.json();
      setMarketData(data);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error fetching market data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Update every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatChange = (change: string) => {
    const value = parseFloat(change.replace("%", "").replace(",", "."));
    return {
      value,
      isPositive: value > 0,
      isNegative: value < 0,
    };
  };

  const MarketCard = ({ 
    title, 
    icon: Icon, 
    buyRate, 
    sellRate, 
    change,
    iconClass
  }: { 
    title: string;
    icon: any;
    buyRate: string;
    sellRate: string;
    change: string;
    iconClass: string;
  }) => {
    const { value, isPositive, isNegative } = formatChange(change);
    
    return (
      <Card className="relative overflow-hidden bg-white/50 backdrop-blur-sm border-border/50">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon className={`h-5 w-5 ${iconClass}`} />
            <h3 className="font-semibold">{title}</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("buyingRate")}</p>
              <p className="text-lg font-semibold">{buyRate} ₺</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("sellingRate")}</p>
              <p className="text-lg font-semibold">{sellRate} ₺</p>
            </div>
          </div>
          
          <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium
            ${isPositive ? 'bg-green-100 text-green-800' : 
              isNegative ? 'bg-red-100 text-red-800' : 
              'bg-gray-100 text-gray-800'}`}>
            <div className="flex items-center gap-1">
              {isPositive ? <ArrowUp className="h-3 w-3" /> : 
               isNegative ? <ArrowDown className="h-3 w-3" /> : null}
              {change}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!marketData) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t("currentMarket")}</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCcw className="h-4 w-4" />
          {t("lastUpdate")}: {lastUpdate}
        </div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <MarketCard
          title={t("dollar")}
          icon={DollarSign}
          buyRate={marketData.USD.Alış}
          sellRate={marketData.USD.Satış}
          change={marketData.USD.Değişim}
          iconClass="text-emerald-600"
        />
        <MarketCard
          title={t("euro")}
          icon={Euro}
          buyRate={marketData.EUR.Alış}
          sellRate={marketData.EUR.Satış}
          change={marketData.EUR.Değişim}
          iconClass="text-blue-600"
        />
        <MarketCard
          title={t("gold")}
          icon={Coins}
          buyRate={marketData["gram-altin"].Alış}
          sellRate={marketData["gram-altin"].Satış}
          change={marketData["gram-altin"].Değişim}
          iconClass="text-yellow-600"
        />
      </motion.div>
    </div>
  );
};

export default CurrentMarketData;