import React from 'react';
import { motion } from 'framer-motion';
// Using the pink mascot provided
import mascotImg from '../../assets/mascot.png';

const AuthMascot = () => (
  <motion.div 
    className="mascot-wrapper"
    animate={{ y: [0, -12, 0] }}
    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
  >
    <img 
      src={mascotImg} 
      alt="Jarvis Mascot" 
      className="auth-mascot-img"
      style={{
        width: '110px',
        filter: 'drop-shadow(0 15px 30px rgba(255, 143, 177, 0.4))'
      }}
    />
  </motion.div>
);

export default AuthMascot;