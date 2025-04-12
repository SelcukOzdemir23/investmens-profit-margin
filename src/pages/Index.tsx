import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AssetType } from "@/lib/constants";
import type { Investment } from "@/lib/constants";
import AssetForm from "@/components/AssetForm";
import InvestmentsList from "@/components/InvestmentsList";
import CurrentMarketData from "@/components/CurrentMarketData";
import { useAuth } from '../contexts/AuthContext';
import LanguageSelector from "@/components/LanguageSelector";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { Coins } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { db } from '../firebase';

const Index = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [investments, setInvestments] = useState<Investment[]>([]);

  const investmentsCollectionRef = collection(db, 'investments');

  useEffect(() => {
    const fetchInvestments = async () => {
      if (!user) return;

      try {
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
        setInvestments(fetchedInvestments);
      } catch (error) {
        console.error('Error fetching investments from Firestore:', error);
      }
    };

    fetchInvestments();
  }, [user, investmentsCollectionRef]);

  const handleAddAsset = async (newInvestment: Investment) => {
    if (!user) return;

    try {
      // Add to Firestore
      const docRef = await addDoc(investmentsCollectionRef, {
        ...newInvestment,
        userId: user.uid,
        date: newInvestment.date // Firestore handles Date objects automatically
      });

      // Update local state
      setInvestments(prev => [{
        ...newInvestment,
        id: docRef.id
      }, ...prev]);
    } catch (error) {
      console.error('Error adding investment to Firestore:', error);
    }
  };

  const handleDeleteInvestment = async (id: string) => {
    if (!user) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'investments', id));
      
      // Update local state
      setInvestments(prev => prev.filter(investment => investment.id !== id));
    } catch (error) {
      console.error('Error deleting investment:', error);
    }
  };

  const {logout} = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <LanguageSelector />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-3xl mx-auto px-4 py-12"
      >
        <header className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="bg-primary/10 p-4 rounded-full mb-4 backdrop-blur-sm">
                <Coins className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-2 tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {t("appTitle")}
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t("appDescription")}
              </p>
              {user ? (
                <div className="text-muted-foreground mt-4 flex flex-col items-center">
                  {t("welcome")} {user.displayName}! <br/>
                  <div>{user.email}</div>
                  <Button className="mt-4" variant={"destructive"} onClick={logout}>
                    {t("logout")}
                  </Button>
                </div>
              ) : (
                <div></div>
              )}
            </motion.div>
          </motion.div>
        </header>

        <div className="mb-8">
          <CurrentMarketData />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="backdrop-blur-sm bg-white/10 rounded-xl p-6 border border-white/20 shadow-xl mb-8"
        >
          <AssetForm onAddAsset={handleAddAsset} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {t("yourInvestments")}
            </span>
            {investments.length > 0 && (
              <span className="bg-primary/10 text-primary text-sm px-2 py-0.5 rounded-full">
                {investments.length}
              </span>
            )}
          </h2>
          <InvestmentsList 
            investments={investments} 
            onDeleteInvestment={handleDeleteInvestment} 
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;

