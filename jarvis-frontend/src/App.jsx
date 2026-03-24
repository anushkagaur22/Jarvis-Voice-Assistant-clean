import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AppLayout from "./layouts/AppLayout";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Personality from "./pages/Personality";
import Chat from "./pages/Chat";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  // 🔥 Re-check token whenever route changes
  useEffect(() => {
    const checkToken = () => {
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener("storage", checkToken);
    checkToken();

    return () => window.removeEventListener("storage", checkToken);
  }, []);

  const isAuthenticated = !!token;

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

    <Route path="/auth-success" element={<AuthSuccess />} />
      {/* Landing */}
      <Route
        path="/landing"
        element={isAuthenticated ? <Landing /> : <Navigate to="/login" />}
      />

      {/* Protected Layout */}
      <Route
        path="/app"
        element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" />}
      >
        <Route path="home" element={<Home />} />
        <Route path="modes" element={<Personality />} />
        <Route path="chat" element={<Chat />} />
        <Route path="chat/:id" element={<Chat />} />
        <Route path="history" element={<History />} />
        <Route path="settings" element={<Settings />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}