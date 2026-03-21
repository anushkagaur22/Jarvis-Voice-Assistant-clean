import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSettings } from "../context/SettingsContext";
import { 
  User, Mic, Palette, Sparkles, Moon, Key, Volume2, Save, Trash2 
} from "lucide-react"; 
import "./Settings.css";

const API = "http://127.0.0.1:8000";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.98 },
  visible: { 
    y: 0, 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring", damping: 25, stiffness: 120 } 
  }
};

const THEMES = [
  { id: "pink", color: "#ff8fb1", label: "Sakura" },
  { id: "blue", color: "#a0d2eb", label: "Sky" },
  { id: "purple", color: "#e5b3fe", label: "Lavender" },
  { id: "green", color: "#97c1a9", label: "Mint" },
];

export default function Settings() {
  const { settings, updateSetting, setAllSettings } = useSettings();
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Added loading state

  const token = localStorage.getItem("token");

  /* ---------------- LOAD SETTINGS FROM BACKEND ---------------- */
  useEffect(() => {
    const load = async () => {
      try {
        if (!token) return;

        const res = await fetch(`${API}/settings`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch settings");

        const data = await res.json();

        // Convert the backend strings (from the Memory table) back to proper types
        const parsed = {
          ...data,
          darkMode: data.darkMode === "True" || data.darkMode === "true" || data.darkMode === True,
          voiceInput: data.voiceInput === "True" || data.voiceInput === "true" || data.voiceInput === True,
          voiceRate: parseFloat(data.voiceRate) || 1.0
        };

        if (setAllSettings) {
             setAllSettings(parsed);
        } else {
             // Fallback if setAllSettings isn't in your context yet
             Object.keys(parsed).forEach(key => updateSetting(key, parsed[key]));
        }

      } catch (err) {
        console.error("Settings load error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [token, setAllSettings, updateSetting]);

  /* ---------------- SAVE SETTINGS TO BACKEND ---------------- */
  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API}/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings) // Your main.py handles the string conversion
      });

      if (!res.ok) throw new Error("Save failed");

      alert("✅ Settings saved successfully!");

    } catch (err) {
      console.error(err);
      alert("❌ Failed to save settings. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Factory reset Jarvis? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  if (isLoading) {
      return <div style={{padding: '100px', textAlign: 'center'}}>Loading settings...</div>;
  }

  return (
    <motion.div 
      className="apple-settings-root"
      initial="hidden" animate="visible" variants={containerVariants}
    >
      <header className="settings-header-minimal">
        <div className="header-content">
          <p className="subtitle-pill">System Preferences</p>
          <h1>Settings</h1>
        </div>
      </header>

      <div className="apple-settings-grid">
        
        {/* --- Account Section --- */}
        <motion.section className="settings-group" variants={cardVariants}>
          <div className="group-label">Account & Identity</div>
          <div className="apple-card">
            <div className="apple-row">
              <div className="icon-wrap-apple pink"><User size={18} /></div>
              <div className="label-stack">
                <span className="row-title">Display Name</span>
                <input
                  className="apple-input"
                  value={settings.profileName || ""}
                  onChange={(e) => updateSetting("profileName", e.target.value)}
                  placeholder="What should Jarvis call you?"
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* --- Personalization Section --- */}
        <motion.section className="settings-group" variants={cardVariants}>
          <div className="group-label">Personalization</div>
          <div className="apple-card">
            <div className="apple-row">
              <div className="icon-wrap-apple purple"><Palette size={18} /></div>
              <span className="row-text">Accent Color</span>
              <div className="theme-dots-apple">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    className={`dot-apple ${settings.theme === t.id ? "active" : ""}`}
                    style={{ backgroundColor: t.color }}
                    onClick={() => updateSetting("theme", t.id)}
                    title={t.label}
                  />
                ))}
              </div>
            </div>
            <div className="divider-apple" />
            <AppleSwitch 
              icon={<Moon size={16} />}
              label="Appearance" 
              subLabel={settings.darkMode ? "Dark Mode" : "Light Mode"}
              isOn={settings.darkMode} 
              onToggle={(v) => updateSetting("darkMode", v)} 
            />
          </div>
        </motion.section>

        {/* --- Intelligence Section --- */}
        <motion.section className="settings-group" variants={cardVariants}>
          <div className="group-label">Intelligence & Network</div>
          <div className="apple-card">
            <div className="vertical-stack">
              <div className="apple-row" style={{ padding: 0 }}>
                <div className="icon-wrap-apple blue"><Sparkles size={18} /></div>
                <span className="row-text" style={{ flex: 1, marginLeft: '16px' }}>AI Configuration</span>
              </div>
              <div className="apple-input-container">
                <Key size={14} style={{ marginRight: '8px', opacity: 0.5 }} />
                <input
                  type={showKey ? "text" : "password"}
                  className="apple-input-field"
                  value={settings.apiKey || ""}
                  onChange={(e) => updateSetting("apiKey", e.target.value)}
                  placeholder="Enter API Key"
                />
                <button onClick={() => setShowKey(!showKey)} className="apple-text-button">
                  {showKey ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* --- Audio Section --- */}
        <motion.section className="settings-group" variants={cardVariants}>
          <div className="group-label">Audio & Voice</div>
          <div className="apple-card">
            <AppleSwitch 
              icon={<Mic size={16} />}
              label="Voice Command" 
              isOn={settings.voiceInput} 
              onToggle={(v) => updateSetting("voiceInput", v)} 
            />
            <div className="divider-apple" />
            <div className="vertical-stack">
              <div className="label-stack">
                <span className="row-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Volume2 size={16} /> Speech Rate: {settings.voiceRate || 1}x
                </span>
              </div>
              <input 
                type="range" min="0.5" max="2" step="0.1"
                value={settings.voiceRate || 1}
                onChange={(e) => updateSetting("voiceRate", parseFloat(e.target.value))}
                className="apple-slider"
              />
            </div>
          </div>
        </motion.section>

      </div>

      <motion.div className="apple-action-footer" variants={cardVariants}>
         <button className="apple-secondary-btn" onClick={saveSettings} disabled={isSaving}>
            <Save size={16} /> {isSaving ? "Saving..." : "Save Config"}
         </button>
         <button className="apple-danger-btn" onClick={handleReset}>
            <Trash2 size={16} /> Reset
         </button>
      </motion.div>
    </motion.div>
  );
}

function AppleSwitch({ label, subLabel, isOn, onToggle, icon }) {
  return (
    <div className="apple-row">
      <div className="icon-wrap-apple pink">{icon}</div>
      <div className="label-stack">
        <span className="row-text">{label}</span>
        {subLabel && <span className="sub-row-text">{subLabel}</span>}
      </div>
      <div 
        className={`apple-switch ${isOn ? "active" : ""}`} 
        onClick={() => onToggle(!isOn)}
      >
        <motion.div 
          className="switch-handle" 
          layout 
          transition={{ type: "spring", stiffness: 500, damping: 30 }} 
        />
      </div>
    </div>
  );
}