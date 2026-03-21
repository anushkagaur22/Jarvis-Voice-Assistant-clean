import React, { createContext, useContext, useState } from "react";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {

  const [settings, setSettings] = useState({
    profileName: "Anushka",
    theme: "pink",
    darkMode: false,
    voiceInput: true,
    voiceRate: 1,
    apiKey: ""
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // ✅ THIS WAS MISSING
  const setAllSettings = (data) => {
    setSettings(prev => ({
      ...prev,
      ...data
    }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, setAllSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);