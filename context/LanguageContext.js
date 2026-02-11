"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { translations } from "@/lib/translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved language on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("language") || "en";
    setLanguage(savedLang);
    setIsLoaded(true);
  }, []);

  // Change language
  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      localStorage.setItem("language", lang);
      document.documentElement.lang = lang;
    }
  };

  // Get translation
  const t = (key) => {
    return translations[language]?.[key] || translations["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, isLoaded }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
