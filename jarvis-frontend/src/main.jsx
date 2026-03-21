import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import { JarvisModeProvider } from "./context/JarvisModeContext";
import { SettingsProvider } from "./context/SettingsContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <JarvisModeProvider>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </JarvisModeProvider>
  </BrowserRouter>
);
 