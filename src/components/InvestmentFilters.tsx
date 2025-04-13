import { Button } from "@/components/ui/button";
import { AssetType } from "@/lib/constants";
import { useLanguage } from "@/contexts/LanguageContext";
import { Coins, DollarSign, Euro, X } from "lucide-react";

interface InvestmentFiltersProps {
  selectedFilter: AssetType | null;
  onFilterChange: (filter: AssetType | null) => void;
}

const InvestmentFilters = ({ selectedFilter, onFilterChange }: InvestmentFiltersProps) => {
  const { t } = useLanguage();

  const filters = [
    {
      type: AssetType.GOLD,
      icon: <Coins className="h-4 w-4" />,
      label: t("gold")
    },
    {
      type: AssetType.DOLLAR,
      icon: <DollarSign className="h-4 w-4" />,
      label: t("dollar")
    },
    {
      type: AssetType.EURO,
      icon: <Euro className="h-4 w-4" />,
      label: t("euro")
    }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filters.map((filter) => (
        <Button
          key={filter.type}
          variant={selectedFilter === filter.type ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(selectedFilter === filter.type ? null : filter.type)}
          className="flex items-center gap-2"
        >
          {filter.icon}
          {filter.label}
        </Button>
      ))}
      {selectedFilter && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFilterChange(null)}
          className="flex items-center gap-2 text-muted-foreground"
        >
          <X className="h-4 w-4" />
          {t("clearFilter")}
        </Button>
      )}
    </div>
  );
};

export default InvestmentFilters;