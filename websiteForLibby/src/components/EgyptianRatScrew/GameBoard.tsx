import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, SlapResult } from './types';
import CardComponent from './CardComponent';

interface GameBoardProps {
  gameState: GameState;
  playerId: string;
  playerName: string;
  onPlayCard: () => void;
  onSlap: () => void;
  onCollect: () => void;
  onStartGame: () => void;
  onRestart: () => void;
  slapResult: SlapResult | null;
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  playerId,
  playerName,
  onPlayCard,
  onSlap,
  onCollect,
  onStartGame,
  onRestart,
  slapResult,
}) => {
  const [slapFlash, setSlapFlash] = useState<string | null>(null);
  const [cardFlip, setCardFlip] = useState(false);
  const prevPileLengthRef = useRef(gameState.centralPileCount);

  const myIndex = gameState.players.findIndex((p) => p.id === playerId);
  const me = gameState.players[myIndex];
  const opponent = gameState.players.find((p) => p.id !== playerId);

  const isMyTurn = gameState.challenge
    ? gameState.challenge.responderIndex === myIndex
    : gameState.currentPlayerIndex === myIndex;

  // Can I collect?
  const canCollect =
    gameState.pendingCollection !== null &&
    gameState.pendingCollection.playerIndex === myIndex;

  // Card flip animation
  useEffect(() => {
    if (gameState.centralPileCount > prevPileLengthRef.current) {
      setCardFlip(true);
      const timer = setTimeout(() => setCardFlip(false), 300);
      prevPileLengthRef.current = gameState.centralPileCount;
      return () => clearTimeout(timer);
    }
    prevPileLengthRef.current = gameState.centralPileCount;
  }, [gameState.centralPileCount]);

  // Slap flash
  useEffect(() => {
    if (slapResult) {
      setSlapFlash(slapResult.valid ? 'valid' : 'invalid');
      const timer = setTimeout(() => setSlapFlash(null), 600);
      return () => clearTimeout(timer);
    }
  }, [slapResult]);

  // Keyboard: Space = flip, S = slap, C = collect
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!gameState.gameStarted || gameState.gameOver) return;

      if (e.code === 'Space') {
        e.preventDefault();
        onPlayCard();
      }
      if (e.code === 'KeyS') {
        e.preventDefault();
        onSlap();
      }
      if (e.code === 'KeyC') {
        e.preventDefault();
        onCollect();
      }
    },
    [gameState.gameStarted, gameState.gameOver, onPlayCard, onSlap, onCollect]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const topCards = gameState.centralPile.slice(-3);

  // ── Pre-game Lobby ──
  if (!gameState.gameStarted) {
    return (
      <div className="ers-board">
        <div className="ers-waiting">
          <h2>
            Room: <span className="ers-room-code">{gameState.roomCode}</span>
          </h2>
          <p className="ers-share-hint">Share this code with your partner! 💕</p>

          <div className="ers-player-list">
            {gameState.players.map((p, i) => (
              <div
                key={i}
                className={`ers-player-tag ${p.connected ? 'connected' : 'disconnected'}`}
              >
                {p.name} {p.id === playerId ? '(you)' : ''}
                <span className={`ers-status-dot ${p.connected ? 'green' : 'red'}`} />
              </div>
            ))}
            {gameState.players.length < 2 && (
              <div className="ers-player-tag waiting">Waiting for opponent...</div>
            )}
          </div>

          {gameState.players.length === 2 && (
            <button className="ers-btn ers-btn-primary ers-btn-lg" onClick={onStartGame}>
              Start Game!
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Game Over ──
  if (gameState.gameOver) {
    const iWon = gameState.winner === playerName;
    return (
      <div className="ers-board">
        <div className="ers-game-over">
          <h2>{iWon ? '🎉 You Win!' : '😔 You Lost!'}</h2>
          <p>{gameState.winner} collected all 52 cards!</p>
          <button className="ers-btn ers-btn-primary ers-btn-lg" onClick={onRestart}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // ── Main Game ──
  return (
    <div className={`ers-board ${slapFlash ? `ers-slap-${slapFlash}` : ''}`}>
      {/* Opponent Area */}
      <div className="ers-opponent-area">
        <div className="ers-player-info">
          <span className={`ers-player-name ${!opponent?.connected ? 'disconnected' : ''}`}>
            {opponent?.name || 'Waiting...'}
            {opponent && !opponent.connected && ' (disconnected)'}
          </span>
          <span className="ers-card-count">{opponent?.cardCount ?? 0} cards</span>
        </div>
        <div className="ers-hand-indicator">
          {opponent && opponent.cardCount > 0 && (
            <div className="ers-deck-stack">
              <CardComponent card={{ suit: 'spades', rank: 'A', id: 'back' }} faceDown />
              <span className="ers-deck-count">{opponent.cardCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Center */}
      <div className="ers-center-area">
        <div className="ers-action-text">{gameState.lastAction}</div>

        {gameState.challenge && (
          <div className="ers-challenge-badge">
            ⚡ {gameState.challenge.faceCardRank} Challenge — {gameState.challenge.chancesLeft}{' '}
            chance(s) left
          </div>
        )}

        {/* Pending collection banner */}
        {gameState.pendingCollection && (
          <div className="ers-collect-badge">
            🎴 {gameState.players[gameState.pendingCollection.playerIndex].name} —{' '}
            {gameState.pendingCollection.reason}
            {canCollect && ' Press C or click Collect!'}
          </div>
        )}

        <div className="ers-pile-area" onClick={onSlap} title="Click to slap!">
          {topCards.length === 0 ? (
            <div className="ers-pile-empty">Pile empty</div>
          ) : (
            <div className="ers-pile-stack">
              {topCards.map((card, i) => (
                <CardComponent
                  key={card.id + i}
                  card={card}
                  style={{
                    position: 'absolute',
                    transform: `rotate(${(i - 1) * 5}deg) translate(${(i - 1) * 3}px, ${(i - 1) * 2}px)`,
                    zIndex: i,
                  }}
                />
              ))}
              {cardFlip && <div className="ers-flip-anim" />}
            </div>
          )}
          <div className="ers-pile-count">{gameState.centralPileCount} cards in pile</div>
        </div>

        {slapResult && (
          <div className={`ers-slap-feedback ${slapResult.valid ? 'valid' : 'invalid'}`}>
            {slapResult.valid
              ? `✅ ${slapResult.slapperName}: ${slapResult.reason}`
              : `❌ ${slapResult.slapperName}: ${slapResult.reason}`}
          </div>
        )}
      </div>

      {/* My Area */}
      <div className="ers-my-area">
        <div className="ers-my-controls">
          <button
            className={`ers-btn ers-btn-play ${isMyTurn && !gameState.pendingCollection ? 'ers-pulse' : ''}`}
            onClick={onPlayCard}
            disabled={!isMyTurn || !me || me.cardCount === 0 || !!gameState.pendingCollection}
          >
            {isMyTurn && !gameState.pendingCollection ? '🃏 Flip Card (Space)' : 'Waiting...'}
          </button>

          <button
            className="ers-btn ers-btn-slap"
            onClick={onSlap}
            disabled={!gameState.canSlap}
          >
            👋 SLAP! (S)
          </button>

          {/* NEW: Collect button */}
          <button
            className={`ers-btn ers-btn-collect ${canCollect ? 'ers-pulse-collect' : ''}`}
            onClick={onCollect}
            disabled={!canCollect}
          >
            📥 Collect (C)
          </button>
        </div>

        <div className="ers-my-info">
          <div className="ers-hand-indicator">
            {me && me.cardCount > 0 && (
              <div className="ers-deck-stack">
                <CardComponent card={{ suit: 'hearts', rank: 'A', id: 'myback' }} faceDown />
                <span className="ers-deck-count">{me.cardCount}</span>
              </div>
            )}
          </div>
          <div className="ers-player-info">
            <span className="ers-player-name ers-me">{me?.name} (you)</span>
            <span className="ers-card-count">{me?.cardCount ?? 0} cards</span>
          </div>
        </div>
      </div>

      {/* Turn indicator */}
      <div className={`ers-turn-indicator ${isMyTurn ? 'your-turn' : ''}`}>
        {canCollect ? 'COLLECT!' : isMyTurn ? 'YOUR TURN' : `${opponent?.name}'s turn`}
      </div>
    </div>
  );
};

export default GameBoard;