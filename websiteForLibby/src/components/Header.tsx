import React, { useState, useCallback, useEffect, useRef } from 'react';
import './Valentines.css';

const Valentine: React.FC = () => {
  const [accepted, setAccepted] = useState<boolean>(false);
  const [yesScale, setYesScale] = useState<number>(1);
  const [noPosition, setNoPosition] = useState<{ x: number; y: number } | null>(null);
  const [changeMindPosition, setChangeMindPosition] = useState<{ x: number; y: number } | null>(null);
  const [, setChangeMindAttempts] = useState<number>(0);
  const [showTooLate, setShowTooLate] = useState<boolean>(false);
  const [hearts, setHearts] = useState<number[]>([]);
  
  const tooLateRef = useRef<HTMLDivElement>(null);

  // Move No button on initial screen
  const moveNoButton = useCallback(() => {
    const maxX = window.innerWidth - 100;
    const maxY = window.innerHeight - 50;

    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    setNoPosition({ x: randomX, y: randomY });
    setYesScale(prev => Math.min(prev + 0.2, 3));
  }, []);

  // Move "Change Mind" button on accepted screen
  const moveChangeMindButton = useCallback(() => {
    const maxX = window.innerWidth - 150;
    const maxY = window.innerHeight - 50;

    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    setChangeMindPosition({ x: randomX, y: randomY });
    setChangeMindAttempts(prev => {
      const newAttempts = prev + 1;
      // After 3 attempts, show "Too Late" section
      if (newAttempts >= 3) {
        setTimeout(() => setShowTooLate(true), 300);
      }
      return newAttempts;
    });
  }, []);

  // Scroll to "Too Late" section when it appears
  useEffect(() => {
    if (showTooLate && tooLateRef.current) {
      setTimeout(() => {
        tooLateRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [showTooLate]);

  const handleYesClick = () => {
    setAccepted(true);
    // Create floating hearts
    const newHearts = Array.from({ length: 20 }, (_, i) => Date.now() + i);
    setHearts(newHearts);
    setTimeout(() => setHearts([]), 4000);
  };

  // Dynamic text based on size
  const getYesText = () => {
    if (yesScale >= 2.5) return 'PLEASE YES!! 💕😍';
    if (yesScale >= 2) return 'YES PLEASE! 💕';
    if (yesScale >= 1.5) return 'YES!! 💕';
    return 'YES! 💕';
  };

  return (
    <div className="valentine-container">
      {/* SCREEN 1: Initial Question */}
      {!accepted && (
        <div className="screen asking-screen">
          <h1 className="valentine-title">
            Will you be my Valentine? <span className="hearts-emoji">💕</span>
          </h1>
          <p className="valentine-subtitle">
            Official invite from your long-distance boyfriend ❤️
          </p>

          <div className="buttons-container">
            <button
              className="btn-yes"
              onClick={handleYesClick}
              style={{
                transform: `scale(${yesScale})`,
                transition: 'all 0.3s ease'
              }}
            >
              {getYesText()}
            </button>

            <button
              className="btn-no"
              onMouseEnter={moveNoButton}
              style={
                noPosition
                  ? {
                      position: 'fixed',
                      left: noPosition.x,
                      top: noPosition.y,
                    }
                  : {}
              }
            >
              No :(
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 2: Accepted Screen */}
      {accepted && (
        <div className="screen accepted-screen">
          <div className="party-emoji">🎉</div>
          
          <h1 className="accepted-title">Good choice my lover 😌</h1>
          
          <p className="accepted-subtitle">
            You just unlocked unlimited hugs, kisses, and cuddles
            <br />
            (redeemable very soon I promise)
          </p>
      <div className="gifs-container">
        <div className="gif-box">
            <img 
            src="/gifs/bubu-dudu-kisses.gif" 
            alt="Cute couple 1"
            />
        </div>
        <div className="gif-box">
            <img 
            src="/gifs/Huggies.gif" 
            alt="Cute couple 2"
            />
        </div>
        </div>
          <h2 className="stuck-text">Now you're stuck with me forever ∞</h2>

          {/* Change Mind Section - Hides after 3 attempts */}
          {!showTooLate && (
            <div className="change-mind-section">
              <p className="change-mind-text">Wait... do you want to change your mind? 🥺</p>
              
              <button
                className="btn-change-mind"
                onMouseEnter={moveChangeMindButton}
                style={
                  changeMindPosition
                    ? {
                        position: 'fixed',
                        left: changeMindPosition.x,
                        top: changeMindPosition.y,
                      }
                    : {}
                }
              >
                Actually... No 😈
              </button>
            </div>
          )}

          {/* Too Late Section - Appears after 3 attempts */}
          {showTooLate && (
            <div className="too-late-section" ref={tooLateRef}>
              <div className="divider">💕 ─────────── 💕</div>
              
              <h2 className="too-late-title">TOO LATE! 🤭</h2>
              
              <p className="too-late-subtitle">You already said YES, which means:</p>

              <div className="rules-list">
                <p className="rule">❌ No take-backs allowed</p>
                <p className="rule">❌ You're legally mine now (I checked)</p>
                <p className="rule">❌ Every "no" from now on = 10 extra kisses when we meet</p>
                <p className="rule green">✅ You're stuck with your nerdy boyfriend FOREVER 😈</p>
              </div>

              <h3 className="deal-with-it">Deal with it 😘💕</h3>

              <div className="final-gif">
                <img 
                  src="https://media.tenor.com/vlwbfv5OJhAAAAAi/bubu-dudu-kisses.gif" 
                  alt="Kisses"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Hearts */}
      {hearts.map((heart, index) => (
        <FloatingHeart key={heart} delay={index * 100} />
      ))}
    </div>
  );
};

// Floating Heart Component
interface FloatingHeartProps {
  delay: number;
}

const FloatingHeart: React.FC<FloatingHeartProps> = ({ delay }) => {
  const leftPosition = Math.random() * 100;
  const size = Math.random() * 20 + 20;

  return (
    <div
      className="floating-heart"
      style={{
        left: `${leftPosition}%`,
        fontSize: `${size}px`,
        animationDelay: `${delay}ms`,
      }}
    >
      ❤️
    </div>
  );
};

export default Valentine;