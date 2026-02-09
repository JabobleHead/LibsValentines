import React, { useState } from 'react';
import './SecretNote.css';

interface SecretNoteProps {
  message?: string;
}

const SecretNote: React.FC<SecretNoteProps> = ({ 
  message = "I just wanted to say... I love you so much and I can't wait to see you. Every day with you feels like a gift, and I'm so lucky to have you in my life. You make everything better just by being you. 💕" 
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleEnvelopeClick = () => {
    setIsOpen(true);
  };

  return (
    <div className="secret-note-container">
      <h2 className="secret-note-title">A Secret Note For You 💖</h2>
      <p className="secret-note-subtitle">Click the envelope to open it...</p>

      <div 
        className={`envelope ${isOpen ? 'open' : ''}`} 
        onClick={handleEnvelopeClick}
      >
        {/* Envelope Flap */}
        <div className="envelope-flap"></div>
        
        {/* Envelope Body */}
        <div className="envelope-body"></div>
        
        {/* Letter inside */}
        <div className={`letter ${isOpen ? 'show' : ''}`}>
          <div className="letter-content">
            <p>{message}</p>
            <span className="signature">- Your Love 💕</span>
          </div>
        </div>
        
        {/* Heart seal */}
        <div className={`heart-seal ${isOpen ? 'hide' : ''}`}>💗</div>
      </div>

      {isOpen && (
        <p className="after-open-text">I meant every word 🥺💕</p>
      )}
    </div>
  );
};

export default SecretNote;