import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import AppLayout from "./layouts/AppLayout";
import AuthSuccess from "./pages/AuthSuccess";
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
  const [token, setToken] = useState(null);
  const location = useLocation();

  // ✅ Always sync token on route change
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, [location]);

  const isAuthenticated = !!token;

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* 🔥 IMPORTANT: allow auth-success ALWAYS */}
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

      {/* fallback */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}