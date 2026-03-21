import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  Home, Sparkles, MessageCircle, Clock, Settings,
  Plus, Menu, X, User, BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./Sidebar.css";

// Navigation Items Config
const NAV_ITEMS = [
  { icon: Home, path: "/app/home", label: "Home" },
  { icon: Sparkles, path: "/app/modes", label: "Personalities" },
  { icon: MessageCircle, path: "/app/chat", label: "Chat" },
  { icon: Clock, path: "/app/history", label: "History" },
  { icon: Settings, path: "/app/settings", label: "Settings" },
  { icon: BarChart3, path: "/app/dashboard", label: "Dashboard" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* MOBILE HAMBURGER */}
      <button className="mobile-toggle" onClick={() => setIsOpen(true)}>
        <Menu size={24} />
      </button>

      {/* MOBILE BACKDROP */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="sidebar-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR CONTAINER */}
      <motion.aside 
        className={`sidebar-dock ${isOpen ? "mobile-open" : ""}`}
        initial={false}
      >
        {/* CLOSE BUTTON (Mobile) */}
        <button className="mobile-close" onClick={() => setIsOpen(false)}>
          <X size={24} />
        </button>

        {/* 1. HERO ACTION (New Chat) */}
        <div className="sidebar-section top">
          <button 
            className="new-chat-btn" 
            onClick={() => { navigate("/app/chat"); setIsOpen(false); }}
          >
            <Plus size={24} strokeWidth={3} />
            <span className="tooltip">New Chat</span>
          </button>
        </div>

        {/* 2. NAVIGATION LINKS */}
        <nav className="sidebar-section nav">
          {NAV_ITEMS.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <item.icon size={22} className="nav-icon" />
              <span className="tooltip">{item.label}</span>
              <motion.div className="active-pill" layoutId="activePill" />
            </NavLink>
          ))}
        </nav>

        {/* 3. PROFILE SECTION (Updated) */}
        <div className="sidebar-section bottom">
          <button className="profile-btn" onClick={() => navigate("/app/settings")}>
            <div className="avatar-wrapper">
              {/* Replaced Image with User Icon */}
              <User size={24} strokeWidth={2.5} />
              <div className="status-dot" />
            </div>
            <span className="tooltip">Profile</span>
          </button>
        </div>

      </motion.aside>
    </>
  );
}