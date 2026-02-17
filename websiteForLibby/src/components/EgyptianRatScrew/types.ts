export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
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
}

// NEW
export interface PendingCollection {
  playerIndex: number;
  reason: string;
}

export interface PlayerInfo {
  id: string;
  name: string;
  cardCount: number;
  connected: boolean;
}

export interface GameState {
  roomCode: string;
  players: PlayerInfo[];
  centralPile: Card[];
  centralPileCount: number;
  currentPlayerIndex: number;
  challenge: ChallengeState | null;
  pendingCollection: PendingCollection | null; // NEW
  gameStarted: boolean;
  gameOver: boolean;
  winner: string | null;
  lastAction: string;
  lastSlapResult: SlapResult | null;
  lastCardPlayed: Card | null;
  canSlap: boolean;
}