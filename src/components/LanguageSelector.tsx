
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";
import { motion } from "framer-motion";

const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute top-4 right-4 z-10"
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm">
            <Languages className="h-4 w-4" />
            <span>{t("language")}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 backdrop-blur-sm bg-white/80">
          <DropdownMenuItem
            className={`${language === "en" ? "bg-accent/30" : ""} cursor-pointer`}
            onClick={() => setLanguage("en")}
          >
            🇺🇸 {t("english")}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={`${language === "tr" ? "bg-accent/30" : ""} cursor-pointer`}
            onClick={() => setLanguage("tr")}
          >
            🇹🇷 {t("turkish")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
};

export default LanguageSelector;
