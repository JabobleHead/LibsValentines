import React from 'react';
import type { Card } from './types';

interface CardComponentProps {
  card: Card;
  faceDown?: boolean;
  style?: React.CSSProperties;
}

const suitSymbols: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const suitColors: Record<string, string> = {
  hearts: '#e74c3c',
  diamonds: '#e74c3c',
  clubs: '#2c3e50',
  spades: '#2c3e50',
};

const CardComponent: React.FC<CardComponentProps> = ({ card, faceDown = false, style }) => {
  if (faceDown) {
    return (
      <div className="ers-card ers-card-back" style={style}>
        <div className="ers-card-pattern">♠♥♦♣</div>
      </div>
    );
  }

  return (
    <div className="ers-card" style={{ ...style, color: suitColors[card.suit] }}>
      <div className="ers-card-corner ers-card-top-left">
        <span className="ers-card-rank">{card.rank}</span>
        <span className="ers-card-suit">{suitSymbols[card.suit]}</span>
      </div>
      <div className="ers-card-center">
        <span className="ers-card-suit-large">{suitSymbols[card.suit]}</span>
      </div>
      <div className="ers-card-corner ers-card-bottom-right">
        <span className="ers-card-rank">{card.rank}</span>
        <span className="ers-card-suit">{suitSymbols[card.suit]}</span>
      </div>
    </div>
  );
};

export default CardComponent;