import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { Game } from './Game';
import { CreateRoomPayload, JoinRoomPayload } from './types';

const app = express();
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://libs-valentines.vercel.app',  // ← replace with your actual Vercel URL
  ],
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://libs-valentines.vercel.app',  // ← replace with your actual Vercel URL
    ],
    methods: ['GET', 'POST'],
  },
});

const rooms: Map<string, Game> = new Map();

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rooms.has(code) ? generateRoomCode() : code;
}

function broadcastState(game: Game) {
  const state = game.getStateForClient();
  io.to(game.roomCode).emit('game-state', state);
}

io.on('connection', (socket: Socket) => {
  console.log(`[Connect] ${socket.id}`);

  let currentRoom: string | null = null;

  // ── Create Room ──
  socket.on('create-room', (data: CreateRoomPayload) => {
    const roomCode = generateRoomCode();
    const game = new Game(roomCode);
    const added = game.addPlayer(socket.id, data.playerName);

    if (!added) {
      socket.emit('error-msg', { message: 'Could not create room.' });
      return;
    }

    rooms.set(roomCode, game);
    socket.join(roomCode);
    currentRoom = roomCode;

    socket.emit('room-joined', {
      roomCode,
      playerId: socket.id,
      playerName: data.playerName,
    });

    broadcastState(game);
    console.log(`[Room Created] ${roomCode} by ${data.playerName}`);
  });

  // ── Join Room ──
  socket.on('join-room', (data: JoinRoomPayload) => {
    const code = data.roomCode.toUpperCase();
    const game = rooms.get(code);

    if (!game) {
      socket.emit('error-msg', { message: 'Room not found.' });
      return;
    }

    const disconnected = game.players.find(
      (p) => p.name === data.playerName && !p.connected
    );
    if (disconnected) {
      game.reconnectPlayer(disconnected.id, socket.id);
      socket.join(code);
      currentRoom = code;
      socket.emit('room-joined', {
        roomCode: code,
        playerId: socket.id,
        playerName: data.playerName,
      });
      broadcastState(game);
      return;
    }

    const added = game.addPlayer(socket.id, data.playerName);
    if (!added) {
      socket.emit('error-msg', { message: 'Room is full or game already started.' });
      return;
    }

    socket.join(code);
    currentRoom = code;

    socket.emit('room-joined', {
      roomCode: code,
      playerId: socket.id,
      playerName: data.playerName,
    });

    broadcastState(game);
    console.log(`[Room Joined] ${code} by ${data.playerName}`);
  });

  // ── Start Game ──
  socket.on('start-game', () => {
    if (!currentRoom) return;
    const game = rooms.get(currentRoom);
    if (!game) return;

    const started = game.startGame();
    if (!started) {
      socket.emit('error-msg', { message: 'Cannot start. Need exactly 2 players.' });
      return;
    }

    broadcastState(game);
    console.log(`[Game Started] ${currentRoom}`);
  });

  // ── Play Card ──
  socket.on('play-card', () => {
    if (!currentRoom) return;
    const game = rooms.get(currentRoom);
    if (!game) return;

    const result = game.playCard(socket.id);

    if (!result.success) {
      socket.emit('error-msg', { message: result.message });
      return;
    }

    broadcastState(game);
  });

  // ── Slap ──
  socket.on('slap', () => {
    if (!currentRoom) return;
    const game = rooms.get(currentRoom);
    if (!game) return;

    const result = game.slap(socket.id);

    io.to(currentRoom).emit('slap-result', result);
    broadcastState(game);
  });

  // ── Collect Pile (NEW) ──
  socket.on('collect-pile', () => {
    if (!currentRoom) return;
    const game = rooms.get(currentRoom);
    if (!game) return;

    const result = game.collectPile(socket.id);

    if (!result.success) {
      socket.emit('error-msg', { message: result.message });
      return;
    }

    broadcastState(game);
    console.log(`[Collected] ${socket.id} collected the pile in ${currentRoom}`);
  });

  // ── Restart ──
  socket.on('restart-game', () => {
    if (!currentRoom) return;
    const game = rooms.get(currentRoom);
    if (!game) return;

    game.startGame();
    broadcastState(game);
  });

  // ── Disconnect ──
  socket.on('disconnect', () => {
    console.log(`[Disconnect] ${socket.id}`);
    if (currentRoom) {
      const game = rooms.get(currentRoom);
      if (game) {
        game.removePlayer(socket.id);
        broadcastState(game);

        const allDisconnected = game.players.every((p) => !p.connected);
        if (allDisconnected) {
          rooms.delete(currentRoom);
          console.log(`[Room Deleted] ${currentRoom}`);
        }
      }
    }
  });
});

app.get('/', (_req, res) => {
  res.json({ status: 'ERS server running', rooms: rooms.size });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`ERS server listening on :${PORT}`);
});