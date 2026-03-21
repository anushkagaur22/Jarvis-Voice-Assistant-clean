import React from 'react';
// FIX: Import the new pink mascot image from the assets folder
import mascotImg from '../../assets/mascot.png';

const AuthMascot = () => (
  <div className="mascot-wrapper">
    <img 
      src={mascotImg} 
      alt="Jarvis Mascot" 
      className="auth-mascot-img"
    />
  </div>
);

export default AuthMascot;