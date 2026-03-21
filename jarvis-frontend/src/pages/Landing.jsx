import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Star, Zap, Shield } from "lucide-react";
import mascot from "../assets/mascot.png"; 
import "./Landing.css";

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 } 
  }
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-root">
      {/* Background Decor */}
      <div className="bg-glow top-left" />
      <div className="bg-glow bottom-right" />

      <motion.div 
        className="landing-glass-panel"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* LEFT SIDE: Content & Actions */}
        <div className="landing-content">
          <motion.div className="landing-badge" variants={itemVariants}>
            <span className="live-dot"></span> Online & Ready
          </motion.div>
          
          <motion.h1 className="landing-title" variants={itemVariants}>
            Welcome to <br />
            <span className="gradient-text">Jarvis AI</span>
          </motion.h1>

          <motion.p className="landing-subtitle" variants={itemVariants}>
            Your intelligent workspace is prepared. Experience the next generation of proactive assistance.
          </motion.p>

          <motion.div className="landing-stats" variants={itemVariants}>
            <div className="stat-item"><Zap size={16} className="icon-y" /> <span>Lightning Fast</span></div>
            <div className="stat-item"><Shield size={16} className="icon-b" /> <span>Secure Core</span></div>
            <div className="stat-item"><Star size={16} className="icon-p" /> <span>Proactive</span></div>
          </motion.div>

          <motion.button 
            className="enter-btn"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/app/home")}
          >
            Launch Interface <ArrowRight size={20} />
          </motion.button>
        </div>

        {/* RIGHT SIDE: Visual Hero */}
        <div className="landing-visual">
          <div className="visual-glow" />
          <motion.img 
            src={mascot} 
            alt="Jarvis" 
            className="visual-mascot"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Decorative Floating Cards */}
          <motion.div className="float-card card-1" animate={{ y: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
            <Sparkles size={14} color="#e6a519" /> <span>Analysis Complete</span>
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
}