import { useEffect, useState, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Investment } from "@/lib/constants";
import ErrorBoundary from "@/components/ErrorBoundary";
import AssetForm from "@/components/AssetForm";
import InvestmentsList from "@/components/InvestmentsList";
import CurrentMarketData from "@/components/CurrentMarketData";
import LanguageSelector from "@/components/LanguageSelector";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy loading components for better initial load performance
const InvestmentsWrapper = ({ investments, onDelete, isLoading }: { 
  investments: Investment[];
  onDelete: (id: string) => Promise<void>;
  isLoading: boolean;
}) => (
  <ErrorBoundary>
    <Suspense fallback={<div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-[200px] w-full" />
      ))}
    </div>}>
      <InvestmentsList
        investments={investments}
        onDelete={onDelete}
        isLoading={isLoading}
      />
    </Suspense>
  </ErrorBoundary>
);

const MarketDataWrapper = () => (
  <ErrorBoundary>
    <Suspense fallback={<div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-[100px] w-full" />
      ))}
    </div>}>
      <CurrentMarketData />
    </Suspense>
  </ErrorBoundary>
);

const Index = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const investmentsCollectionRef = collection(db, 'investments');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchInvestments = async () => {
      try {
        setIsLoading(true);
        const q = query(investmentsCollectionRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        const fetchedInvestments: Investment[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          type: doc.data().type,
          amount: doc.data().amount,
          buyingRate: doc.data().buyingRate,
          tlValueThen: doc.data().tlValueThen,
          date: doc.data().date.toDate()
        }));

        // Sort investments by date, newest first
        fetchedInvestments.sort((a, b) => b.date.getTime() - a.date.getTime());
        setInvestments(fetchedInvestments);
      } catch (error) {
        console.error('Error fetching investments:', error);
        toast({
          variant: "destructive",
          title: t("errorFetchingInvestments"),
          description: t("errorFetchingInvestmentsDescription")
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvestments();
  }, [user, investmentsCollectionRef, navigate, t]);

  const handleAddAsset = async (newInvestment: Investment) => {
    if (!user) return;

    try {
      // Add to Firestore with user ID
      const docRef = await addDoc(investmentsCollectionRef, {
        ...newInvestment,
        userId: user.uid,
        date: newInvestment.date // Firestore handles Date objects automatically
      });

      // Update local state with the new investment at the beginning
      setInvestments(prev => [{
        ...newInvestment,
        id: docRef.id
      }, ...prev]);

      toast({
        title: t("investmentAdded"),
        description: t("investmentAddedDescription")
      });
    } catch (error) {
      console.error('Error adding investment:', error);
      toast({
        variant: "destructive",
        title: t("errorAddingInvestment"),
        description: t("errorAddingInvestmentDescription")
      });
    }
  };

  const handleDeleteInvestment = async (id: string) => {
    if (!user) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'investments', id));
      
      // Update local state
      setInvestments(prev => prev.filter(investment => investment.id !== id));

      toast({
        title: t("investmentDeleted"),
        description: t("investmentDeletedDescription")
      });
    } catch (error) {
      console.error('Error deleting investment:', error);
      toast({
        variant: "destructive",
        title: t("errorDeletingInvestment"),
        description: t("errorDeletingInvestmentDescription")
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        variant: "destructive",
        title: t("errorLoggingOut"),
        description: t("errorLoggingOutDescription")
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {t("investments")}
          </h1>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              {t("logout")}
            </Button>
          </div>
        </div>

        {/* Current Market Data */}
        <MarketDataWrapper />

        {/* Asset Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ErrorBoundary>
            <AssetForm onAddAsset={handleAddAsset} />
          </ErrorBoundary>
        </motion.div>

        {/* Investments List */}
        <InvestmentsWrapper
          investments={investments}
          onDelete={handleDeleteInvestment}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Index;

