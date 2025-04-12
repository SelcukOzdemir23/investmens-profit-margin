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

  // Fetch current rates when component mounts
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch(FINANCE_API_URL);
        const data: FinanceApiResponse = await response.json();
        setCurrentRates(data);
      } catch (error) {
        console.error("Error fetching rates:", error);
      }
    };
    fetchRates();
  }, []);

  const getCurrentRate = () => {
    if (!currentRates) return null;

    switch (assetType) {
      case AssetType.GOLD:
        return parseFloat(currentRates["gram-altin"].Alış.replace(",", "."));
      case AssetType.DOLLAR:
        return parseFloat(currentRates.USD.Alış.replace(",", "."));
      case AssetType.EURO:
        return parseFloat(currentRates.EUR.Alış.replace(",", "."));
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: t("invalidAmount"),
        description: t("invalidAmountDescription"),
        variant: "destructive",
      });
      return;
    }

    if (!currentRates) {
      toast({
        title: t("errorRates"),
        description: t("errorRatesDescription"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const amountValue = parseFloat(amount);
      const buyingRate = getCurrentRate();
      
      if (!buyingRate) {
        throw new Error("Could not get current rate");
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

  // Translate asset labels
  const assetLabels = {
    [AssetType.GOLD]: t("gold"),
    [AssetType.DOLLAR]: t("dollar"),
    [AssetType.EURO]: t("euro"),
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
            onValueChange={(value) => setAssetType(value as AssetType)}
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
                  {assetLabels[type] || AssetLabel[type]}
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
            onChange={(e) => setAmount(e.target.value)}
            className="input-animation bg-white/60 backdrop-blur-xs"
            required
          />
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
                className="w-full justify-start text-left font-normal input-animation bg-white/60 backdrop-blur-xs"
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
                initialFocus
                locale={language === "tr" ? dateFnsTr : undefined}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90 transition-all duration-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? t("adding") : t("addInvestment")}
        </Button>
      </form>
    </Card>
  );
};

export default AssetForm;
