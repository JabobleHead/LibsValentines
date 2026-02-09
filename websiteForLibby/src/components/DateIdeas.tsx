import React, { useState } from 'react';
import './DateIdeas.css';

interface DateIdea {
  emoji: string;
  text: string;
}

const DateIdeas: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const dateIdeas: DateIdea[] = [
    { emoji: '🎬', text: 'Netflix party + video call (I\'ll let you pick... maybe)' },
    { emoji: '🍕', text: 'Order the same food together & judge each other\'s eating habits' },
    { emoji: '🌙', text: 'Late night talks that somehow turn into sleeping on call' },
    { emoji: '🎵', text: 'Playlist exchange & argue about music taste (you\'re wrong btw)' },
    { emoji: '🤳', text: 'Send me your selfies so I can simp shamelessly 😊' },
    { emoji: '🎮', text: 'Play games together & watch you absolutely destroy me' },
    { emoji: '👩‍🍳', text: 'Cook the same recipe on video call & pretend we\'re MasterChef' },
    { emoji: '🌅', text: 'Watch the sunrise/sunset together from different places' },
    { emoji: '📖', text: 'Read each other bedtime stories until one of us falls asleep' },
    { emoji: '💭', text: 'Plan our future trips & dream about being together soon' },
  ];

  const toggleChecked = (index: number) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="date-ideas-container">
      <h2 className="date-ideas-title">Our Virtual Date Ideas 📋</h2>
      <p className="date-ideas-subtitle">Things I want to do with you 💕</p>

      <div className="date-ideas-list">
        {dateIdeas.map((idea, index) => (
          <div 
            key={index} 
            className={`date-idea-item ${checkedItems.has(index) ? 'checked' : ''}`}
            onClick={() => toggleChecked(index)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <span className="idea-emoji">{idea.emoji}</span>
            <span className="idea-text">{idea.text}</span>
            <span className="check-mark">{checkedItems.has(index) ? '✅' : '⬜'}</span>
          </div>
        ))}
      </div>

      {checkedItems.size > 0 && (
        <p className="checked-count">
          {checkedItems.size === dateIdeas.length 
            ? "You checked all of them! Someone's excited 😏💕" 
            : `${checkedItems.size} date${checkedItems.size > 1 ? 's' : ''} selected! Let's do them all! 🥰`
          }
        </p>
      )}
    </div>
  );
};

export default DateIdeas;