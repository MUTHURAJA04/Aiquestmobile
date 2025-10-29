// AppContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [credits, setCredits] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedCredits = await AsyncStorage.getItem("credits");
        if (storedCredits) setCredits(parseInt(storedCredits));
        
        const storedPlan = await AsyncStorage.getItem("selectedPlan");
        if (storedPlan) setSelectedPlan(JSON.parse(storedPlan));
        
        const storedLanguage = await AsyncStorage.getItem("language");
        if (storedLanguage) setLanguage(storedLanguage);
        
        const userString = await AsyncStorage.getItem("user");
        if (userString) setUser(JSON.parse(userString));
      } catch (error) {
        
      }
    };
    
    loadData();
  }, []);

  return (
    <AppContext.Provider value={{
      credits, 
      setCredits, 
      selectedPlan, 
      setSelectedPlan,
      language,
      setLanguage,
      user
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;