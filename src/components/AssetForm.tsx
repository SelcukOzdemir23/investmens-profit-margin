import { useState, useEffect } from "react";
import { format } from "date-fns";
import { tr as dateFnsTr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { AssetType, AssetLabel, FINANCE_API_URL } from "@/lib/constants";
import type { Investment, FinanceApiResponse } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface AssetFormProps {
  onAddAsset: (asset: Investment) => void;
}

const AssetForm = ({ onAddAsset }: AssetFormProps) => {
  const { t, language } = useLanguage();
  const [assetType, setAssetType] = useState<AssetType>(AssetType.GOLD);
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [currentRates, setCurrentRates] = useState<FinanceApiResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateForm = () => {
    const amountValue = parseFloat(amount);
    
    if (!amount || isNaN(amountValue)) {
      setValidationError(t("invalidAmount"));
      return false;
    }

    if (amountValue <= 0) {
      setValidationError(t("amountMustBePositive"));
      return false;
    }

    if (!currentRates) {
      setValidationError(t("noRatesAvailable"));
      return false;
    }

    setValidationError(null);
    return true;
  };

  const getCurrentRate = () => {
    if (!currentRates) return null;

    try {
      switch (assetType) {
        case AssetType.GOLD:
          return currentRates.Rates.GRA.Buying;
        case AssetType.DOLLAR:
          return currentRates.Rates.USD.Buying;
        case AssetType.EURO:
          return currentRates.Rates.EUR.Buying;
        default:
          return null;
      }
    } catch (error) {
      console.error("Error getting current rate:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(FINANCE_API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCurrentRates(data);
      } catch (error) {
        console.error("Error fetching rates:", error);
        toast({
          title: t("errorRates"),
          description: t("errorRatesDescription"),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRates();
    const intervalId = setInterval(fetchRates, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(intervalId);
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const amountValue = parseFloat(amount);
      const buyingRate = getCurrentRate();
      
      if (!buyingRate) {
        throw new Error(t("couldNotGetCurrentRate"));
      }

      const tlValueThen = amountValue * buyingRate;
      
      // Add new asset entry
      onAddAsset({
        id: crypto.randomUUID(),
        type: assetType,
        amount: amountValue,
        buyingRate,
        tlValueThen,
        date,
      });
      
      // Reset form
      setAmount("");
      setValidationError(null);
      
      // Show success message
      toast({
        title: t("assetAdded"),
        description: t("assetAddedDescription"),
      });
    } catch (error) {
      console.error("Failed to add asset:", error);
      toast({
        title: t("errorAddingAsset"),
        description: t("errorAddingAssetDescription"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="glass-card p-6 mb-8 animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <Label htmlFor="asset-type" className="text-sm font-medium">
            {t("assetType")}
          </Label>
          <Select
            value={assetType}
            onValueChange={(value) => {
              setAssetType(value as AssetType);
              setValidationError(null);
            }}
          >
            <SelectTrigger 
              id="asset-type" 
              className="w-full input-animation bg-white/60 backdrop-blur-xs"
            >
              <SelectValue placeholder={t("selectAssetType")} />
            </SelectTrigger>
            <SelectContent>
              {Object.values(AssetType).map((type) => (
                <SelectItem key={type} value={type}>
                  {t(type.toLowerCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="amount" className="text-sm font-medium">
            {t("amount")}
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder={assetType === AssetType.GOLD ? t("gramsOfGold") : t("amount")}
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setValidationError(null);
            }}
            className={cn(
              "input-animation bg-white/60 backdrop-blur-xs",
              validationError && "border-red-500 focus:ring-red-500"
            )}
            required
          />
          {validationError && (
            <p className="text-sm text-red-500 mt-1">{validationError}</p>
          )}
          {currentRates && (
            <p className="text-xs text-muted-foreground mt-1">
              {t("currentRate")}: {getCurrentRate()?.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} ₺
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-sm font-medium">{t("investmentDate")}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  "input-animation bg-white/60 backdrop-blur-xs"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: language === "tr" ? dateFnsTr : undefined }) : <span>{t("selectDate")}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                disabled={(date) => date > new Date() || date < new Date(2020, 0, 1)}
                initialFocus
                locale={language === "tr" ? dateFnsTr : undefined}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button 
          type="submit" 
          className={cn(
            "w-full bg-primary hover:bg-primary/90 transition-all duration-300",
            isSubmitting && "opacity-50 cursor-not-allowed"
          )}
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? t("adding") : t("addInvestment")}
        </Button>
      </form>
    </Card>
  );
};

export default AssetForm;
