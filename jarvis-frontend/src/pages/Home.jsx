import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Mic, Zap, BrainCircuit, MessageCircle, 
  Terminal, ShieldCheck, ArrowRight, Sparkles 
} from "lucide-react";
import "./Home.css";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

const floatAnimation = {
  y: [0, -15, 0],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Mic size={24} color="white" />,
      color: "linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)",
      title: "Voice Control",
      desc: "Speak naturally. Jarvis listens, understands, and executes.",
    },
    {
      icon: <Zap size={24} color="white" />,
      color: "linear-gradient(135deg, #F6D365 0%, #FDA085 100%)",
      title: "Lightning Fast",
      desc: "Real-time responses powered by optimized LLM engines.",
    },
    {
      icon: <BrainCircuit size={24} color="white" />,
      color: "linear-gradient(135deg, #84FAB0 0%, #8FD3F4 100%)",
      title: "Adaptive Mind",
      desc: "Learns your preferences and context over time.",
    },
    {
      icon: <MessageCircle size={24} color="white" />,
      color: "linear-gradient(135deg, #A18CD1 0%, #FBC2EB 100%)",
      title: "Deep Chat",
      desc: "Engage in complex, multi-turn conversations.",
    },
    {
      icon: <Terminal size={24} color="white" />,
      color: "linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)",
      title: "Code Assistant",
      desc: "Debug, refactor, and write code snippets instantly.",
    },
    {
      icon: <ShieldCheck size={24} color="white" />,
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      title: "Secure Core",
      desc: "Enterprise-grade privacy for your personal data.",
    },
  ];

  return (
    <div className="page-root home-container">
      
      {/* --- HERO SECTION --- */}
      <div className="hero-section">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="badge">
            <Sparkles size={14} /> <span>AI Companion 2.0</span>
          </div>
          <h1 className="hero-title">
            Your Magical <br />
            <span className="gradient-text">AI Assistant</span>
          </h1>
          <p className="hero-subtitle">
            Jarvis isn't just a chatbot. It's a proactive intelligence that 
            helps you think, create, and achieve more—effortlessly.
          </p>
          
          <div className="hero-actions">
            <button className="primary-btn" onClick={() => navigate("/app/chat")}>
              Start Chatting <ArrowRight size={18} />
            </button>
            <button className="secondary-btn" onClick={() => navigate("/app/settings")}>
              Customize Voice
            </button>
          </div>
        </motion.div>

        {/* Floating 3D Mascot */}
        <motion.div 
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div className="glow-circle" animate={floatAnimation} />
          <motion.img 
            src="/src/assets/mascot.png" // Ensure this path exists!
            alt="Jarvis" 
            className="mascot-img"
            animate={floatAnimation}
          />
        </motion.div>
      </div>

      {/* --- FEATURES GRID --- */}
      <motion.div 
        className="features-section"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="section-header">
          <h2>Powerful Capabilities</h2>
          <p>Everything you need to supercharge your workflow.</p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div 
              key={i} 
              className="feature-card" 
              variants={itemVariants}
              whileHover={{ y: -10 }}
            >
              <div className="icon-wrapper" style={{ background: f.color }}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}