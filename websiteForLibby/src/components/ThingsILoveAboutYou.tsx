import React, { useState } from 'react';
import './ThingsILove.css';

interface LoveItem {
  id: number;
  text: string;
  emoji?: string;
}

const ThingsILove: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const loveItems: LoveItem[] = [
    { id: 1, text: "You literally make my entire day (and my heart do things)", emoji: "💕" },
    { id: 2, text: "You're funnier than my entire Instagram feed", emoji: "🌸" },
    { id: 3, text: "Your voice > any song", emoji: "🎵" },
    { id: 4, text: "You understand my weird humor and actually laugh at my terrible jokes", emoji: "😂" },
    { id: 5, text: "You make distance feel like nothing when we talk", emoji: "✨" },
    { id: 6, text: "You're beautiful and don't even try (it's annoyingly effortless)", emoji: "😍" },
    { id: 7, text: "Your chaotic energy matches mine perfectly", emoji: "🔥" },
    { id: 8, text: "You make me want to be less emotionally unavailable (that's huge btw)", emoji: "💀" },
    { id: 9, text: "You're stuck with me now and there's no escape", emoji: "😈" },
    { id: 10, text: "The way your laugh has two stages", emoji: "🥰" },
    { id: 11, text: "How you always know what to say", emoji: "💬" },
    { id: 12, text: "You always match my random thoughts", emoji: "🌙" },
  ];

  return (
    <div className="things-i-love-container">
      <div className="things-header">
        <h2 className="things-title">Things I Love About You <span className="title-emoji">☁️</span></h2>
        <p className="things-subtitle">
          From miles away, you're still my favorite person. Distance is just a number, but us? 
          We're infinite. Every day I fall a little more and I'm not even mad about it.
        </p>
      </div>

      <div className="love-cards-grid">
        {loveItems.map((item) => (
          <div
            key={item.id}
            className={`love-card ${hoveredId === item.id ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <p className="love-text">{item.text}</p>
            {item.emoji && <span className="love-emoji">{item.emoji}</span>}
          </div>
        ))}
      </div>

    
      <div className="footer-decoration">
        <p>😘 Come back for more tommorow for more perchance 😘</p>
      </div>
    </div>
  );
};

export default ThingsILove;