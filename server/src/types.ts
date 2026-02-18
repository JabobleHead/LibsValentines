export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  connected: boolean;
}

export interface ChallengeState {
  challengerIndex: number;
  responderIndex: number;
  chancesLeft: number;
  faceCardRank: Rank;
}

export interface SlapResult {
  valid: boolean;
  slapperId: string;
  slapperName: string;
  reason: string;
  burnedCard?: Card;  
}

export interface PendingCollection {
  playerIndex: number;
  reason: string;
}
export interface GameStateForClient {
  roomCode: string;
  players: {
    id: string;
    name: string;
    cardCount: number;
    connected: boolean;
  }[];
  centralPile: Card[];
  centralPileCount: number;
  currentPlayerIndex: number;
  challenge: ChallengeState | null;
  pendingCollection: PendingCollection | null;
  gameStarted: boolean;
  gameOver: boolean;
  winner: string | null;
  lastAction: string;
  lastSlapResult: SlapResult | null;
  lastCardPlayed: Card | null;
  lastBurnedCard: Card | null;    // NEW
  cardRevealed: boolean;          // NEW
  canSlap: boolean;
}

export interface CreateRoomPayload {
  playerName: string;
}

export interface JoinRoomPayload {
  roomCode: string;
  playerName: string;
}

export interface RoomJoinedPayload {
  roomCode: string;
  playerId: string;
  playerName: string;
}

export interface ErrorPayload {
  message: string;
}