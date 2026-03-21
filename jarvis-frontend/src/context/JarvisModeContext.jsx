import { createContext, useContext, useState } from "react";
import { MODES } from "../data/modes";

const JarvisModeContext = createContext({
  mode: "friendly",
  setMode: () => {},
  config: MODES.friendly,
});

export const JarvisModeProvider = ({ children }) => {
  const [mode, setMode] = useState("friendly");

  const value = {
    mode,
    setMode,
    config: MODES[mode] || MODES.friendly,
  };

  return (
    <JarvisModeContext.Provider value={value}>
      {children}
    </JarvisModeContext.Provider>
  );
};

export const useJarvisMode = () => useContext(JarvisModeContext);
