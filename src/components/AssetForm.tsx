
import { useState } from "react";
import { format } from "date-fns";
import { tr as dateFnsTr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { AssetType, AssetLabel } from "@/lib/constants";
import { calculateTLValue } from "@/utils/assetCalculator";
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
  onAddAsset: (asset: {
    type: AssetType;
    amount: number;
    date: Date;
    exchangeRate: number;
    tlValue: number;
  }) => void;
}

const AssetForm = ({ onAddAsset }: AssetFormProps) => {
  const { t, language } = useLanguage();
  const [assetType, setAssetType] = useState<AssetType>(AssetType.GOLD);
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);
    
    try {
      // Calculate TL value based on selected date
      const { exchangeRate, tlValue } = await calculateTLValue(
        assetType,
        parseFloat(amount),
        date
      );
      
      // Add new asset entry
      onAddAsset({
        type: assetType,
        amount: parseFloat(amount),
        date,
        exchangeRate,
        tlValue,
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
                {date ? format(date, "PPP") : <span>{t("selectDate")}</span>}
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
