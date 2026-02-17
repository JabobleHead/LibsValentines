import React, { useState } from 'react';

interface GameLobbyProps {
  onCreateRoom: (name: string) => void;
  onJoinRoom: (code: string, name: string) => void;
  error: string | null;
}

const GameLobby: React.FC<GameLobbyProps> = ({ onCreateRoom, onJoinRoom, error }) => {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');

  const handleCreate = () => {
    if (name.trim()) onCreateRoom(name.trim());
  };

  const handleJoin = () => {
    if (name.trim() && roomCode.trim()) onJoinRoom(roomCode.trim().toUpperCase(), name.trim());
  };

  return (
    <div className="ers-lobby">
      <div className="ers-lobby-card">
        <h1 className="ers-title">🃏 Egyptian Rat Screw</h1>
        <p className="ers-subtitle">Real-time 2-player card game</p>

        {error && <div className="ers-error">{error}</div>}

        {mode === 'menu' && (
          <div className="ers-lobby-buttons">
            <button className="ers-btn ers-btn-primary" onClick={() => setMode('create')}>
              Create Room
            </button>
            <button className="ers-btn ers-btn-secondary" onClick={() => setMode('join')}>
              Join Room
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="ers-lobby-form">
            <input
              className="ers-input"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <button className="ers-btn ers-btn-primary" onClick={handleCreate} disabled={!name.trim()}>
              Create Game
            </button>
            <button className="ers-btn ers-btn-ghost" onClick={() => setMode('menu')}>
              Back
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="ers-lobby-form">
            <input
              className="ers-input"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              autoFocus
            />
            <input
              className="ers-input"
              type="text"
              placeholder="Room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={5}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            />
            <button
              className="ers-btn ers-btn-primary"
              onClick={handleJoin}
              disabled={!name.trim() || !roomCode.trim()}
            >
              Join Game
            </button>
            <button className="ers-btn ers-btn-ghost" onClick={() => setMode('menu')}>
              Back
            </button>
          </div>
        )}

        <div className="ers-rules-mini">
          <h3>Quick Rules</h3>
          <ul>
            <li><strong>Flip:</strong> Take turns flipping cards onto the pile</li>
            <li><strong>Face cards:</strong> J=1, Q=2, K=3, A=4 chances for opponent</li>
            <li><strong>Slap doubles:</strong> Two same-rank cards in a row (5-5)</li>
            <li><strong>Slap sandwich:</strong> Same rank with one card between (5-X-5)</li>
            <li><strong>Bad slap:</strong> Burn a card as penalty</li>
            <li><strong>Win:</strong> Collect all 52 cards!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;