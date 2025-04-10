
import { useState } from "react";
import { AssetType } from "@/lib/constants";
import AssetCard from "./AssetCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Investment {
  id: string;
  date: Date;
  type: AssetType;
  amount: number;
  exchangeRate: number;
  tlValue: number;
}

interface InvestmentsListProps {
  investments: Investment[];
  onDeleteInvestment: (id: string) => void;
}

const InvestmentsList = ({ investments, onDeleteInvestment }: InvestmentsListProps) => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<AssetType | 'all'>('all');
  
  const filteredInvestments = activeFilter === 'all'
    ? investments
    : investments.filter(investment => investment.type === activeFilter);
  
  const filterButtons = [
    { label: t("all"), value: 'all' as const },
    { label: t("gold"), value: AssetType.GOLD },
    { label: t("dollar"), value: AssetType.DOLLAR },
    { label: t("euro"), value: AssetType.EURO },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap gap-2 mb-6">
        {filterButtons.map(({ label, value }) => (
          <Button
            key={value}
            variant="outline"
            size="sm"
            onClick={() => setActiveFilter(value)}
            className={cn(
              "transition-all duration-300 ease-in-out rounded-full",
              activeFilter === value 
                ? "bg-primary text-primary-foreground font-medium shadow-md"
                : "hover:bg-secondary/80"
            )}
          >
            {label}
          </Button>
        ))}
      </div>
      
      {filteredInvestments.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="text-center p-8 border border-dashed rounded-lg bg-white/20 backdrop-blur-sm"
        >
          {investments.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <PlusCircle className="h-10 w-10 text-muted-foreground/60" />
              <p className="text-muted-foreground">
                {t("noInvestments")}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">
              {t("noMatchingInvestments")}
            </p>
          )}
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredInvestments.map((investment) => (
            <motion.div
              key={investment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              layout
            >
              <AssetCard
                id={investment.id}
                date={investment.date}
                type={investment.type}
                amount={investment.amount}
                exchangeRate={investment.exchangeRate}
                tlValue={investment.tlValue}
                onDelete={() => onDeleteInvestment(investment.id)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestmentsList;
