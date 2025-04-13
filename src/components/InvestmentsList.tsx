import { useState, useRef } from "react";
import { Investment, AssetType } from "@/lib/constants";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVirtualizer } from '@tanstack/react-virtual';
import AssetCard from "./AssetCard";
import InvestmentFilters from "./InvestmentFilters";
import { Skeleton } from "./ui/skeleton";

interface InvestmentsListProps {
  investments: Investment[];
  onDelete: (id: string) => void;
  isLoading: boolean;
}

const InvestmentsList = ({ investments, onDelete, isLoading }: InvestmentsListProps) => {
  const { t } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState<AssetType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredInvestments = selectedFilter
    ? investments.filter(investment => investment.type === selectedFilter)
    : investments;

  const virtualizer = useVirtualizer({
    count: filteredInvestments.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 200, // Estimated height of each card
    overscan: 5, // Number of items to render beyond visible area
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-[200px] w-full" />
        ))}
      </div>
    );
  }

  if (investments.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>{t("noInvestments")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <InvestmentFilters 
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
      />
      
      {filteredInvestments.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          <p>{t("noMatchingInvestments")}</p>
        </div>
      ) : (
        <div 
          ref={containerRef} 
          className="h-[calc(100vh-400px)] overflow-auto scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent"
          style={{
            contain: 'strict',
          }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <div className="p-2">
                  <AssetCard
                    {...filteredInvestments[virtualItem.index]}
                    onDelete={() => onDelete(filteredInvestments[virtualItem.index].id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentsList;
