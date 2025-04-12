import { useState, useEffect } from "react";
import { format } from "date-fns";
import { tr as dateFnsTr } from "date-fns/locale";
import { motion } from "framer-motion";
import { AssetType, FINANCE_API_URL } from "@/lib/constants";
import type { Investment, FinanceApiResponse } from "@/lib/constants";
import { 
  Coins, 
  DollarSign, 
  Euro, 
  ArrowUp, 
  ArrowDown, 
  Trash2,
  MinusCircle,
  RefreshCw
} from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

interface AssetCardProps extends Investment {
  onDelete: () => void;
}

const AssetCard = ({ 
  id, 
  date, 
  type, 
  amount,
  buyingRate,
  tlValueThen,
  onDelete 
}: AssetCardProps) => {
  const { t, language } = useLanguage();
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [tlValue, setTlValue] = useState<number | null>(null);
  const [profitMargin, setProfitMargin] = useState<number | null>(null);
  const [profitPercentage, setProfitPercentage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchCurrentRates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(FINANCE_API_URL);
      const data: FinanceApiResponse = await response.json();
      
      let rate: number;
      switch (type) {
        case AssetType.GOLD:
          rate = parseFloat(data["gram-altin"].Alış.replace(",", "."));
          break;
        case AssetType.DOLLAR:
          rate = parseFloat(data.USD.Alış.replace(",", "."));
          break;
        case AssetType.EURO:
          rate = parseFloat(data.EUR.Alış.replace(",", "."));
          break;
        default:
          throw new Error("Unknown asset type");
      }
      
      setCurrentRate(rate);
      const currentTlValue = amount * rate;
      setTlValue(currentTlValue);
      
      // Calculate profit/loss
      const profit = currentTlValue - tlValueThen;
      setProfitMargin(profit);
      
      // Calculate profit percentage
      const percentage = (profit / tlValueThen) * 100;
      setProfitPercentage(percentage);
      
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error calculating current value:", error);
      setCurrentRate(null);
      setTlValue(null);
      setProfitMargin(null);
      setProfitPercentage(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentRates();
    const interval = setInterval(fetchCurrentRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [type, amount, tlValueThen]);

  const renderIcon = () => {
    switch (type) {
      case AssetType.GOLD:
        return <Coins className="h-5 w-5 text-gold" />;
      case AssetType.DOLLAR:
        return <DollarSign className="h-5 w-5 text-dollar" />;
      case AssetType.EURO:
        return <Euro className="h-5 w-5 text-euro" />;
      default:
        return null;
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case AssetType.GOLD:
        return "asset-badge-gold";
      case AssetType.DOLLAR:
        return "asset-badge-dollar";
      case AssetType.EURO:
        return "asset-badge-euro";
      default:
        return "";
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };

  // Format number with decimals
  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "N/A";
    return value.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="glass-card overflow-hidden"
      >
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Asset Information */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className={`${getTypeClass()} flex items-center gap-1 px-2 py-1 rounded-full`}>
                    {renderIcon()}
                    <span>{t(type.toLowerCase())}</span>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {format(date, language === 'tr' ? 'dd MMMM yyyy' : 'MMMM dd, yyyy', {
                      locale: language === 'tr' ? dateFnsTr : undefined
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <RefreshCw className="h-3 w-3" />
                  {lastUpdate}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t("amount")}</p>
                  <p className="font-medium">
                    {formatNumber(amount)}
                    {type === AssetType.GOLD ? " gr" : ""}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t("buyingRate")}</p>
                  <p className="font-medium">
                    {formatNumber(buyingRate)} ₺
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t("currentRate")}</p>
                  {isLoading ? (
                    <Skeleton className="h-6 w-24" />
                  ) : (
                    <p className="font-medium">
                      {formatNumber(currentRate)} ₺
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t("initialValue")}</p>
                  <p className="font-medium">{formatCurrency(tlValueThen)}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t("currentValue")}</p>
                  {isLoading ? (
                    <Skeleton className="h-6 w-24" />
                  ) : (
                    <p className="font-medium">
                      {tlValue !== null ? formatCurrency(tlValue) : "N/A"}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Profit/Loss Information */}
            <div className="sm:w-1/4 flex flex-col justify-between border-t sm:border-t-0 sm:border-l border-border/30 pt-3 sm:pt-0 sm:pl-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("profitLoss")}</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-24" />
                ) : profitMargin !== null ? (
                  <div className="flex items-center">
                    {profitMargin > 0 ? (
                      <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : profitMargin < 0 ? (
                      <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                    ) : (
                      <MinusCircle className="h-4 w-4 text-muted-foreground mr-1" />
                    )}
                    <span className={`font-semibold ${
                      profitMargin > 0 ? 'text-green-500' : 
                      profitMargin < 0 ? 'text-red-500' : ''
                    }`}>
                      {formatCurrency(Math.abs(profitMargin))}
                    </span>
                  </div>
                ) : null}
              </div>
              
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">{t("profitPercent")}</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-16" />
                ) : profitPercentage !== null ? (
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    profitPercentage > 0 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : profitPercentage < 0 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }`}>
                    {profitPercentage > 0 ? (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    ) : profitPercentage < 0 ? (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    ) : (
                      <MinusCircle className="h-3 w-3 mr-1" />
                    )}
                    {formatPercentage(Math.abs(profitPercentage))}
                  </div>
                ) : null}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="mt-4 text-red-500 hover:text-red-700 hover:bg-red-100/30 self-end"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {t("delete")}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card/90 backdrop-blur-md border border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteInvestment")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteInvestmentConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              {t("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AssetCard;
