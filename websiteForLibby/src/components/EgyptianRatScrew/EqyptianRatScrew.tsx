import React, { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket } from './socket';
import type { GameState, SlapResult } from './types';
import GameLobby from './GameLobby';
import GameBoard from './GameBoard';
import './styles.css';

const EgyptianRatScrew: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [, setRoomCode] = useState<string>('');
  const [inRoom, setInRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slapResult, setSlapResult] = useState<SlapResult | null>(null);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    s.on('connect', () => {
      console.log('Connected to ERS server:', s.id);
    });

    s.on('room-joined', (data: { roomCode: string; playerId: string; playerName: string }) => {
      setPlayerId(data.playerId);
      setPlayerName(data.playerName);
      setRoomCode(data.roomCode);
      setInRoom(true);
      setError(null);
    });

    s.on('game-state', (state: GameState) => {
      setGameState(state);
    });

    s.on('slap-result', (result: SlapResult) => {
      setSlapResult(result);
      setTimeout(() => setSlapResult(null), 1500);
    });

    s.on('error-msg', (data: { message: string }) => {
      setError(data.message);
      setTimeout(() => setError(null), 4000);
    });

    s.on('disconnect', () => {
      console.log('Disconnected from ERS server');
    });

    return () => {
      s.off('connect');
      s.off('room-joined');
      s.off('game-state');
      s.off('slap-result');
      s.off('error-msg');
      s.off('disconnect');
      disconnectSocket();
    };
  }, []);

  const handleCreateRoom = useCallback(
    (name: string) => {
      socket?.emit('create-room', { playerName: name });
    },
    [socket]
  );

  const handleJoinRoom = useCallback(
    (code: string, name: string) => {
      socket?.emit('join-room', { roomCode: code, playerName: name });
    },
    [socket]
  );

  const handleStartGame = useCallback(() => {
    socket?.emit('start-game');
  }, [socket]);

  const handlePlayCard = useCallback(() => {
    socket?.emit('play-card');
  }, [socket]);

  const handleSlap = useCallback(() => {
    socket?.emit('slap');
  }, [socket]);

  // NEW
  const handleCollect = useCallback(() => {
    socket?.emit('collect-pile');
  }, [socket]);

  const handleRestart = useCallback(() => {
    socket?.emit('restart-game');
  }, [socket]);

  if (!inRoom || !gameState) {
    return (
      <GameLobby
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        error={error}
      />
    );
  }

  return (
    <GameBoard
      gameState={gameState}
      playerId={playerId}
      playerName={playerName}
      onPlayCard={handlePlayCard}
      onSlap={handleSlap}
      onCollect={handleCollect}
      onStartGame={handleStartGame}
      onRestart={handleRestart}
      slapResult={slapResult}
    />
  );
};

export default EgyptianRatScrew;