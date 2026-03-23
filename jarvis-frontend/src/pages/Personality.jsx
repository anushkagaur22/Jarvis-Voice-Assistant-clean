import React, { useState, useEffect } from "react";
import { useJarvisMode } from "../context/JarvisModeContext";
import { motion, AnimatePresence } from "framer-motion";
import "./Personality.css";
import friendly from "../assets/avatars/friendly.png";
import creative from "../assets/avatars/creative.png";
import professional from "../assets/avatars/professional.png";
import study from "../assets/avatars/study.png";
import supportive from "../assets/avatars/supportive.png";
import zippy from "../assets/avatars/zippy.png";

const MODES = [
  { 
    id: "friendly", 
    label: "Friendly", 
    desc: "Warm, supportive & always kind.",
    img: friendly,
    color: "#ff8fb1",
    bg: "linear-gradient(135deg, #fff0f3 0%, #ffe6ea 100%)"
  },
  { 
    id: "creative", 
    label: "Creative", 
    desc: "Wild ideas & artistic inspiration.",
    img: creative,
    color: "#a0d2eb",
    bg: "linear-gradient(135deg, #f0f8ff 0%, #e6f2ff 100%)"
  },
  { 
    id: "professional", 
    label: "Professional", 
    desc: "Concise, data-driven & efficient.",
    img: professional,
    color: "#7b2c4a",
    bg: "linear-gradient(135deg, #f9f0f2 0%, #eee0e5 100%)"
  },
  { 
    id: "study", 
    label: "Study Buddy", 
    desc: "Focused on facts & learning.",
    img: study,
    color: "#97c1a9",
    bg: "linear-gradient(135deg, #f0f9f4 0%, #e6f5ed 100%)"
  },
  { 
    id: "supportive", 
    label: "Supportive", 
    desc: "Empathetic listener for tough days.",
    img: supportive,
    color: "#e5b3fe",
    bg: "linear-gradient(135deg, #f8f0ff 0%, #f2e6ff 100%)"
  },
  { 
    id: "zippy", 
    label: "Zippy", 
    desc: "Fast, witty & high energy.",
    img: zippy,
    color: "#ffabab",
    bg: "linear-gradient(135deg, #fff0f0 0%, #ffe6e6 100%)"
  },
];
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const cardVariants = {
  hidden: { y: 40, opacity: 0, scale: 0.9 },
  visible: { 
    y: 0, 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

export default function Personality() {
  const { mode, setMode } = useJarvisMode();
  const [activeTheme, setActiveTheme] = useState(MODES[0].bg);

  // Update background when mode changes
  useEffect(() => {
    const selectedMode = MODES.find(m => m.id === mode);
    if (selectedMode) setActiveTheme(selectedMode.bg);
  }, [mode]);

  return (
    <motion.div 
      className="page-root personality-page"
      animate={{ background: activeTheme }} // 🔥 Animates page background!
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="content-wrapper">
        <motion.div 
          className="personality-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Choose Your Companion</h1>
          <p>Each persona changes Jarvis's voice, tone, and personality ✨</p>
        </motion.div>

        <motion.div 
          className="personality-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {MODES.map((m) => {
            const isActive = mode === m.id;
            return (
              <motion.div
                key={m.id}
                className={`personality-card ${isActive ? "active" : ""}`}
                onClick={() => setMode(m.id)}
                variants={cardVariants}
                whileHover={{ y: -12, scale: 1.03 }} // 3D Lift effect
                whileTap={{ scale: 0.95 }}
                style={{ "--accent-color": m.color }}
              >
                {/* Selection Ring Animation */}
                {isActive && (
                  <motion.div 
                    className="selection-ring"
                    layoutId="ring"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <motion.div 
                  className="img-container"
                  animate={isActive ? { y: [0, -10, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                >
                  <img src={m.img} alt={m.label} />
                </motion.div>
                
                <h3>{m.label}</h3>
                <p>{m.desc}</p>
                
                {/* Animated Badge */}
                <div className="card-badge">
                  {isActive ? (
                    <motion.span 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }}
                      className="active-text"
                    >
                      Selected ✓
                    </motion.span>
                  ) : (
                    <span className="inactive-text">Activate</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Floating Confirm Bar */}
      <AnimatePresence>
        {mode && (
          <motion.div 
            className="bottom-action-bar"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            <span>You selected <strong>{MODES.find(m => m.id === mode)?.label}</strong></span>
            <button className="confirm-btn">Continue</button>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}