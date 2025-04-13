import { useState, useEffect, useCallback } from "react";
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
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "./ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

interface AssetCardProps extends Investment {
  onDelete: () => void;
}

const AssetCard = ({ id, date, type, amount, buyingRate, tlValueThen, onDelete }: AssetCardProps) => {
  const { t, language } = useLanguage();
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [tlValue, setTlValue] = useState<number | null>(null);
  const [profitMargin, setProfitMargin] = useState<number | null>(null);
  const [profitPercentage, setProfitPercentage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const parseRate = (rateStr: string): number => {
    return parseFloat(rateStr.replace('.', '').replace(',', '.'));
  };

  const fetchCurrentRates = useCallback(async () => {
    // Don't fetch if already updating
    if (isUpdating) return;
    
    setIsUpdating(true);
    setError(null);
    
    try {
      const response = await fetch(FINANCE_API_URL);
      if (!response.ok) {
        throw new Error(t("apiRequestFailed"));
      }
      
      const data: FinanceApiResponse = await response.json();
      let rate: number;
      
      switch (type) {
        case AssetType.GOLD:
          rate = data.Rates.GRA.Buying;
          break;
        case AssetType.DOLLAR:
          rate = data.Rates.USD.Buying;
          break;
        case AssetType.EURO:
          rate = data.Rates.EUR.Buying;
          break;
        default:
          throw new Error(t("unknownAssetType"));
      }

      if (isNaN(rate) || rate <= 0) {
        throw new Error(t("invalidRate"));
      }

      const currentTlValue = amount * rate;
      const profit = currentTlValue - tlValueThen;
      const percentage = (profit / tlValueThen) * 100;

      setCurrentRate(rate);
      setTlValue(currentTlValue);
      setProfitMargin(profit);
      setProfitPercentage(percentage);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error calculating current value:", error);
      setError(error instanceof Error ? error.message : t("unknownError"));
    } finally {
      setIsLoading(false);
      setIsUpdating(false);
    }
  }, [amount, tlValueThen, type, t, isUpdating]);

  useEffect(() => {
    // Initial fetch
    fetchCurrentRates();

    // Set up interval
    const intervalId = setInterval(fetchCurrentRates, 5 * 60 * 1000);

    // Cleanup
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchCurrentRates]);

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };

  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "N/A";
    return value.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getProfitLossColor = (value: number) => {
    if (value > 5) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (value < -5) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (value > 0) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    if (value < 0) return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  const getProfitLossStyle = (value: number) => {
    if (Math.abs(value) > 10) return 'scale-110 font-bold';
    if (Math.abs(value) > 5) return 'scale-105 font-semibold';
    return '';
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className={cn("relative", isUpdating && "opacity-80")}
      >
        <Card className="overflow-hidden">
          <div className="p-6">
            {/* Asset Type Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${getTypeClass()}`}>
                  {renderIcon()}
                </div>
                <div>
                  <p className="font-medium">{t(type.toLowerCase())}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(date), 'PP', { locale: language === 'tr' ? dateFnsTr : undefined })}
                  </p>
                </div>
              </div>
              {!isLoading && (
                <p className="text-xs text-muted-foreground">
                  {t("lastUpdate")}: {lastUpdate}
                </p>
              )}
            </div>

            {/* Main Content */}
            <div className="space-y-4">
              {/* Amount and Rate Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">{t("amount")}</p>
                  <p className="font-medium">
                    {type === AssetType.GOLD ? amount : formatNumber(amount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("exchangeRate")}</p>
                  <p className="font-medium">{formatNumber(buyingRate)}</p>
                </div>
              </div>

              {/* Values and Profit Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">{t("purchaseValue")}</p>
                  <p className="font-medium">{formatCurrency(tlValueThen)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("currentValue")}</p>
                  {isLoading ? (
                    <Skeleton className="h-6 w-24" />
                  ) : (
                    <p className="font-medium">
                      {tlValue ? formatCurrency(tlValue) : "---"}
                    </p>
                  )}
                </div>
              </div>

              {/* Profit/Loss Section */}
              {!isLoading && profitMargin !== null && profitPercentage !== null && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">{t("profitLoss")}</p>
                    <Badge 
                      variant={profitMargin > 0 ? "default" : "destructive"}
                      className={cn(
                        "transition-all duration-500",
                        getProfitLossStyle(profitPercentage)
                      )}
                    >
                      {formatCurrency(profitMargin)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">{t("profitPercent")}</p>
                    <Badge 
                      variant={profitPercentage > 0 ? "default" : "destructive"}
                      className={cn(
                        "transition-all duration-500",
                        getProfitLossStyle(profitPercentage)
                      )}
                    >
                      {formatPercentage(profitPercentage)}
                    </Badge>
                  </div>
                </div>
              )}

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>{t("errorRates")}</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Delete Button */}
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
      
      {/* Delete Dialog */}
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
