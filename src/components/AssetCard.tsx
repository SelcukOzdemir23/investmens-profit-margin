
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { tr as dateFnsTr } from "date-fns/locale";
import { motion } from "framer-motion";
import { calculateTLValue } from "@/utils/assetCalculator";
import { AssetType, AssetLabel } from "@/lib/constants";
import { 
  Coins, 
  DollarSign, 
  Euro, 
  ArrowUp, 
  ArrowDown, 
  Trash2,
  MinusCircle
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

interface AssetCardProps {
  id: string;
  date: Date;
  type: AssetType;
  amount: number;
  exchangeRate: number;
  tlValue: number;
  onDelete: () => void;
}

const AssetCard = ({ 
  id, 
  date, 
  type, 
  amount, 
  exchangeRate, 
  tlValue, 
  onDelete 
}: AssetCardProps) => {
  const { t, language } = useLanguage();
  const [currentValue, setCurrentValue] = useState<number | null>(null);
  const [profitMargin, setProfitMargin] = useState<number | null>(null);
  const [profitPercentage, setProfitPercentage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const loadCurrentValue = async () => {
      setIsLoading(true);
      try {
        // Get the current value using calculateTLValue instead of calculateCurrentValue
        const result = await calculateTLValue(type, amount);
        setCurrentValue(result.tlValue);
        
        // Calculate profit/loss
        const profit = result.tlValue - tlValue;
        setProfitMargin(profit);
        
        // Calculate profit percentage
        const percentage = (profit / tlValue) * 100;
        setProfitPercentage(percentage);
      } catch (error) {
        console.error("Error calculating current value:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCurrentValue();
  }, [type, amount, tlValue]);

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

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="glass-card overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row gap-4 p-4">
          {/* Asset Information */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`${getTypeClass()} flex items-center gap-1`}>
                {renderIcon()}
                <span>{t(type.toLowerCase())}</span>
              </span>
              <span className="text-sm text-muted-foreground">
                {format(date, language === 'tr' ? 'dd MMMM yyyy' : 'MMMM dd, yyyy', {
                  locale: language === 'tr' ? dateFnsTr : undefined
                })}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mt-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t("amount")}</p>
                <p className="font-medium">
                  {amount.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                  {type === AssetType.GOLD ? " gr" : ""}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t("exchangeRate")}</p>
                <p className="font-medium">
                  {exchangeRate.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} ₺
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t("purchaseValue")}</p>
                <p className="font-medium">{formatCurrency(tlValue)}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t("currentValue")}</p>
                {isLoading ? (
                  <p className="font-medium animate-pulse">{t("loading")}</p>
                ) : (
                  <p className="font-medium">
                    {currentValue !== null ? formatCurrency(currentValue) : "N/A"}
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
                <div className="animate-pulse h-6 bg-muted/20 rounded w-20"></div>
              ) : profitMargin !== null ? (
                <div className="flex items-center">
                  {profitMargin > 0 ? (
                    <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : profitMargin < 0 ? (
                    <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                  ) : (
                    <MinusCircle className="h-4 w-4 text-muted-foreground mr-1" />
                  )}
                  <span className={`font-semibold ${profitMargin > 0 ? 'text-green-500' : profitMargin < 0 ? 'text-red-500' : ''}`}>
                    {formatCurrency(Math.abs(profitMargin))}
                  </span>
                </div>
              ) : null}
            </div>
            
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1">{t("profitPercent")}</p>
              {isLoading ? (
                <div className="animate-pulse h-6 bg-muted/20 rounded w-16"></div>
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
