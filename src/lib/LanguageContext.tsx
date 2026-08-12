"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "gu" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const DICTIONARY: Record<Language, Record<string, string>> = {
  en: {
    home: "Home",
    menu: "Menu",
    reserve: "Reserve",
    order: "Order",
    contact: "Contact",
    cellar: "Wine Cellar",
    gifts: "Gift Cards",
    track: "Track Order",
    gallery: "Gallery",
    experiences: "Experiences",
    reserveTable: "Reserve Table",
    logIn: "Log In",
    signUp: "Sign Up",
    signOut: "Sign Out",
    myProfile: "My Profile",
    myReservations: "My Reservations",
    myOrders: "My Orders",
    adminPanel: "Admin Panel",
    welcomeTitle: "An Evening Worth Remembering",
    welcomeSub: "Experience Michelin-star fine dining with seasonal tasting menus and private sommelier pairing.",
    selectLanguage: "Select Language",
    vipMember: "VIP Member",
    pointsBalance: "Reward Points",
  },
  gu: {
    home: "હોમ",
    menu: "મેનૂ",
    reserve: "રિઝર્વેશન",
    order: "ઓર્ડર",
    contact: "સંપર્ક",
    cellar: "વાઇન સેલાર",
    gifts: "ગિફ્ટ કાર્ડ્સ",
    track: "ઓર્ડર ટ્રેક કરો",
    gallery: "ગેલેરી",
    experiences: "અનુભવો",
    reserveTable: "ટેબલ બુક કરો",
    logIn: "લોગ ઇન",
    signUp: "સાઇન અપ",
    signOut: "સાઇન આઉટ",
    myProfile: "મારી પ્રોફાઇલ",
    myReservations: "મારા રિઝર્વેશન",
    myOrders: "મારા ઓર્ડર્સ",
    adminPanel: "એડમિન પેનલ",
    welcomeTitle: "યાદગાર સાંજનો અદ્ભુત અનુભવ",
    welcomeSub: "મિશેલિન-સ્ટાર ફાઇન ડાઇનિંગ, સીઝનલ ટેસ્ટિંગ મેનૂ અને પ્રાઇવેટ સોમિલિયર પેરિંગનો આનંદ માણો.",
    selectLanguage: "ભાષા પસંદ કરો",
    vipMember: "વીઆઇપી મેમ્બર",
    pointsBalance: "રિવોર્ડ પોઈન્ટ્સ",
  },
  hi: {
    home: "होम",
    menu: "मेनू",
    reserve: "रिजर्वेशन",
    order: "ऑर्डर",
    contact: "संपर्क",
    cellar: "वाइन सेलार",
    gifts: "गिफ्ट कार्ड्स",
    track: "ऑर्डर ट्रैक करें",
    gallery: "गैलरी",
    experiences: "अनुभव",
    reserveTable: "टेबल बुक करें",
    logIn: "लॉग इन",
    signUp: "साइन अप",
    signOut: "साइन आउट",
    myProfile: "मेरी प्रोफाइल",
    myReservations: "मेरे आरक्षण",
    myOrders: "मेरे ऑर्डर",
    adminPanel: "एडमिन पैनल",
    welcomeTitle: "एक यादगार शाम का अद्भुत अनुभव",
    welcomeSub: "मिचेलिन-स्टार फाइन डाइनिंग, मौसमी चखने के मेनू और निजी सोमेलियर पेयरिंग का आनंद लें।",
    selectLanguage: "भाषा चुनें",
    vipMember: "वीआईपी सदस्य",
    pointsBalance: "रिवार्ड पॉइंट्स",
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("etoile_lang") as Language;
    if (saved && (saved === "en" || saved === "gu" || saved === "hi")) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("etoile_lang", lang);
  };

  const t = (key: string): string => {
    return DICTIONARY[language]?.[key] || DICTIONARY.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
