import type {
  Card,
  Suit,
  Rank,
  Player,
  ChallengeState,
  SlapResult,
  PendingCollection,
  GameStateForClient,
} from './types';

export class Game {
  roomCode: string;
  players: Player[] = [];
  centralPile: Card[] = [];
  currentPlayerIndex: number = 0;
  challenge: ChallengeState | null = null;
  pendingCollection: PendingCollection | null = null;
  gameStarted: boolean = false;
  gameOver: boolean = false;
  winner: string | null = null;
  lastAction: string = 'Waiting for players...';
  lastSlapResult: SlapResult | null = null;
  lastCardPlayed: Card | null = null;
  lastBurnedCard: Card | null = null;          // NEW: track burned card
  lastCardPlayedBy: number = -1;               // NEW: who played the card (index)
  cardRevealed: boolean = true;                // NEW: false until reveal delay passes
  slapLocked: boolean = false;
  turnPlayed: boolean = false;

  constructor(roomCode: string) {
    this.roomCode = roomCode;
  }

  // ── Deck Helpers ──────────────────────────────────

  private static buildDeck(): Card[] {
    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks: Rank[] = [
      'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K',
    ];
    const deck: Card[] = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ suit, rank, id: `${suit}-${rank}` });
      }
    }
    return deck;
  }

  private static shuffle(deck: Card[]): Card[] {
    const a = [...deck];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ── Player Management ─────────────────────────────

  addPlayer(id: string, name: string): boolean {
    if (this.players.length >= 2) return false;
    if (this.gameStarted) return false;
    this.players.push({ id, name, hand: [], connected: true });
    return true;
  }

  removePlayer(id: string): void {
    const player = this.players.find((p) => p.id === id);
    if (player) {
      player.connected = false;
    }
  }

  reconnectPlayer(oldId: string, newId: string): boolean {
    const player = this.players.find((p) => p.id === oldId);
    if (player) {
      player.id = newId;
      player.connected = true;
      return true;
    }
    return false;
  }

  getPlayerIndex(id: string): number {
    return this.players.findIndex((p) => p.id === id);
  }

  // ── Game Lifecycle ────────────────────────────────

  startGame(): boolean {
    if (this.players.length !== 2) return false;
    if (this.gameStarted) return false;

    const deck = Game.shuffle(Game.buildDeck());
    const half = Math.ceil(deck.length / 2);
    this.players[0].hand = deck.slice(0, half);
    this.players[1].hand = deck.slice(half);

    this.centralPile = [];
    this.currentPlayerIndex = 0;
    this.challenge = null;
    this.pendingCollection = null;
    this.gameStarted = true;
    this.gameOver = false;
    this.winner = null;
    this.lastAction = `${this.players[0].name}'s turn to flip.`;
    this.lastSlapResult = null;
    this.lastCardPlayed = null;
    this.lastBurnedCard = null;     // NEW
    this.lastCardPlayedBy = -1;     // NEW
    this.cardRevealed = true;       // NEW
    this.turnPlayed = false;
    return true;
  }

  // ── Core Play Logic ───────────────────────────────

  private nextPlayerIndex(from: number): number {
    return (from + 1) % this.players.length;
  }

  private isFaceOrAce(rank: Rank): boolean {
    return ['J', 'Q', 'K', 'A'].includes(rank);
  }

  private chancesForRank(rank: Rank): number {
    switch (rank) {
      case 'J': return 1;
      case 'Q': return 2;
      case 'K': return 3;
      case 'A': return 4;
      default: return 0;
    }
  }

  // NEW: Find next player who actually has cards to play
  private nextPlayablePlayerIndex(from: number): number {
    let next = this.nextPlayerIndex(from);
    // If next player has no cards, come back to current player
    if (this.players[next].hand.length === 0) {
      return from;
    }
    return next;
  }

  // NEW: server calls this after a delay to reveal the card
  revealCard(): void {
    this.cardRevealed = true;
  }

  playCard(playerId: string): {
    success: boolean;
    message: string;
    card?: Card;
    needsRevealDelay?: boolean;   // NEW: tells server to delay then re-broadcast
  } {
    if (!this.gameStarted || this.gameOver) {
      return { success: false, message: 'Game is not active.' };
    }

    // Block play while someone needs to collect
    if (this.pendingCollection) {
      const collector = this.players[this.pendingCollection.playerIndex];
      return {
        success: false,
        message: `${collector.name} must collect the pile first!`,
      };
    }

    const playerIndex = this.getPlayerIndex(playerId);
    if (playerIndex === -1) {
      return { success: false, message: 'Player not found.' };
    }

    const player = this.players[playerIndex];
    if (player.hand.length === 0) {
      return { success: false, message: 'You have no cards.' };
    }

    // Determine who should play
    let expectedIndex: number;
    if (this.challenge) {
      expectedIndex = this.challenge.responderIndex;

      // CHANGED: If the responder has no cards, challenger wins the challenge immediately
      if (this.players[expectedIndex].hand.length === 0) {
        const challenger = this.players[this.challenge.challengerIndex];
        this.pendingCollection = {
          playerIndex: this.challenge.challengerIndex,
          reason: 'Face-card challenge won! (opponent had no cards)',
        };
        this.challenge = null;
        this.lastAction = `${challenger.name} won the challenge! Press Collect to take the pile.`;
        return { success: true, message: this.lastAction };
      }
    } else {
      expectedIndex = this.currentPlayerIndex;
    }

    if (playerIndex !== expectedIndex) {
      return { success: false, message: 'Not your turn.' };
    }

    // Flip top card from hand onto pile
    const card = player.hand.shift()!;
    this.centralPile.push(card);
    this.lastCardPlayed = card;
    this.lastSlapResult = null;
    this.lastBurnedCard = null;          // NEW: clear burned card
    this.lastCardPlayedBy = playerIndex; // NEW: track who played
    this.cardRevealed = false;           // NEW: hidden until reveal delay

    // ── Challenge Logic ──
    if (this.challenge) {
      if (this.isFaceOrAce(card.rank)) {
        // Responder played their own face card — new challenge reverses
        const nextResponder = this.nextPlayerIndex(playerIndex);

        this.challenge = {
          challengerIndex: playerIndex,
          responderIndex: nextResponder,
          chancesLeft: this.chancesForRank(card.rank),
          faceCardRank: card.rank,
        };

        // CHANGED: If the new responder has no cards, challenger wins immediately
        if (this.players[nextResponder].hand.length === 0) {
          this.pendingCollection = {
            playerIndex: playerIndex,
            reason: 'Face-card challenge won! (opponent had no cards)',
          };
          this.challenge = null;
          this.lastAction = `${player.name} played ${card.rank} and wins the challenge!`;
          return { success: true, message: this.lastAction, card, needsRevealDelay: true };
        }

        this.lastAction = `${player.name} played ${card.rank}! ${
          this.players[this.challenge.responderIndex].name
        } has ${this.challenge.chancesLeft} chance(s).`;
      } else {
        // Responder played a number card — decrement chances
        this.challenge.chancesLeft--;
        if (this.challenge.chancesLeft <= 0) {
          // CHANGED: Challenger wins — set pending collection
          // But DON'T block slapping — the last card might form a double/sandwich
          const challenger = this.players[this.challenge.challengerIndex];
          this.pendingCollection = {
            playerIndex: this.challenge.challengerIndex,
            reason: 'Face-card challenge won!',
          };
          this.challenge = null;
          this.lastAction = `${challenger.name} won the challenge! Press Collect to take the pile.`;
          // Don't check win condition yet — allow slapping first
          return { success: true, message: this.lastAction, card, needsRevealDelay: true };
        } else {
          this.lastAction = `${player.name} played ${card.rank}. ${this.challenge.chancesLeft} chance(s) left.`;
        }
      }
    } else {
      // No active challenge
      if (this.isFaceOrAce(card.rank)) {
        const nextResponder = this.nextPlayerIndex(playerIndex);

        this.challenge = {
          challengerIndex: playerIndex,
          responderIndex: nextResponder,
          chancesLeft: this.chancesForRank(card.rank),
          faceCardRank: card.rank,
        };

        // CHANGED: If responder has no cards, challenger wins immediately
        if (this.players[nextResponder].hand.length === 0) {
          this.pendingCollection = {
            playerIndex: playerIndex,
            reason: 'Face-card challenge won! (opponent had no cards)',
          };
          this.challenge = null;
          this.lastAction = `${player.name} played ${card.rank} and wins the challenge!`;
          return { success: true, message: this.lastAction, card, needsRevealDelay: true };
        }

        this.lastAction = `${player.name} played ${card.rank}! ${
          this.players[this.challenge.responderIndex].name
        } has ${this.challenge.chancesLeft} chance(s).`;
      } else {
        // CHANGED: use nextPlayablePlayerIndex to skip players with 0 cards
        this.currentPlayerIndex = this.nextPlayablePlayerIndex(playerIndex);
        this.lastAction = `${player.name} played ${card.rank}. ${
          this.players[this.currentPlayerIndex].name
        }'s turn.`;
      }
    }

    // CHANGED: only check win if no pending collection (slap window still open)
    if (!this.pendingCollection) {
      this.checkWinCondition();
    }
    return { success: true, message: this.lastAction, card, needsRevealDelay: true };
  }

  // ── Collect Pile ──────────────────────────────────

  collectPile(playerId: string): {
    success: boolean;
    message: string;
  } {
    if (!this.gameStarted || this.gameOver) {
      return { success: false, message: 'Game is not active.' };
    }

    if (!this.pendingCollection) {
      return { success: false, message: 'No pile to collect.' };
    }

    const playerIndex = this.getPlayerIndex(playerId);
    if (playerIndex === -1) {
      return { success: false, message: 'Player not found.' };
    }

    if (playerIndex !== this.pendingCollection.playerIndex) {
      return { success: false, message: 'You are not the one who should collect!' };
    }

    const player = this.players[playerIndex];

    // Move entire pile to bottom of player's hand
    player.hand.push(...this.centralPile);
    this.centralPile = [];
    this.pendingCollection = null;
    this.lastCardPlayed = null;
    this.lastBurnedCard = null;        // NEW
    this.currentPlayerIndex = playerIndex;

    this.lastAction = `${player.name} collected the pile! Their turn to flip.`;
    this.checkWinCondition();

    return { success: true, message: this.lastAction };
  }

  // ── Slap Logic (Doubles & Sandwich Only) ──────────

  private checkSlapValid(): { valid: boolean; reason: string } {
    const pile = this.centralPile;
    const len = pile.length;

    // Double: top two cards same rank
    if (len >= 2) {
      const top = pile[len - 1];
      const second = pile[len - 2];
      if (top.rank === second.rank) {
        return { valid: true, reason: 'Double!' };
      }
    }

    // Sandwich: cards at positions top and top-2 have same rank
    if (len >= 3) {
      const top = pile[len - 1];
      const third = pile[len - 3];
      if (top.rank === third.rank) {
        return { valid: true, reason: 'Sandwich!' };
      }
    }

    return { valid: false, reason: 'Invalid slap.' };
  }

  slap(playerId: string): SlapResult {
    if (!this.gameStarted || this.gameOver) {
      return {
        valid: false,
        slapperId: playerId,
        slapperName: '',
        reason: 'Game not active.',
      };
    }

    // CHANGED: Removed the pendingCollection block!
    // Players CAN slap during pending collection (e.g. after challenge ends
    // and the last card forms a double/sandwich)

    const playerIndex = this.getPlayerIndex(playerId);
    if (playerIndex === -1) {
      return {
        valid: false,
        slapperId: playerId,
        slapperName: '',
        reason: 'Player not found.',
      };
    }

    const player = this.players[playerIndex];

    if (this.centralPile.length === 0) {
      return {
        valid: false,
        slapperId: playerId,
        slapperName: player.name,
        reason: 'Nothing to slap!',
      };
    }

    const slapCheck = this.checkSlapValid();

    if (slapCheck.valid) {
      // CHANGED: Override any pending collection — this slapper wins instead
      this.challenge = null;
      this.pendingCollection = {
        playerIndex: playerIndex,
        reason: slapCheck.reason,
      };

      const result: SlapResult = {
        valid: true,
        slapperId: playerId,
        slapperName: player.name,
        reason: slapCheck.reason,
      };
      this.lastSlapResult = result;
      this.lastBurnedCard = null;      // NEW: clear burned card on valid slap
      this.lastAction = `${player.name} slapped — ${slapCheck.reason} Press Collect to take the pile!`;
      return result;
    } else {
      // Penalty: burn a card
      // CHANGED: track the burned card and show it
      const burned = player.hand.shift();
      let burnedCard: Card | undefined;

      if (burned) {
        this.centralPile.unshift(burned);
        burnedCard = burned;
        this.lastBurnedCard = burned;  // NEW: store for display
        this.lastAction = `${player.name} slapped incorrectly! Burned: ${burned.rank} of ${burned.suit}.`;
      } else {
        this.lastAction = `${player.name} slapped incorrectly! No cards to burn.`;
      }

      const result: SlapResult = {
        valid: false,
        slapperId: playerId,
        slapperName: player.name,
        reason: burnedCard
          ? `Bad slap! Burned: ${burnedCard.rank} of ${burnedCard.suit}`
          : 'Bad slap! No cards to burn.',
        burnedCard,                    // NEW: include burned card in result
      };
      this.lastSlapResult = result;
      this.checkWinCondition();
      return result;
    }
  }

  // ── Win Condition ─────────────────────────────────

  // CHANGED: More robust win condition
  private checkWinCondition(): void {
    // Don't end game if there's a pending collection — pile is about to move
    if (this.pendingCollection) return;

    for (const player of this.players) {
      const otherPlayer = this.players.find((p) => p.id !== player.id);
      if (!otherPlayer) continue;

      // A player wins if they have all the cards
      // (opponent has 0 cards AND pile is empty)
      if (
        otherPlayer.hand.length === 0 &&
        this.centralPile.length === 0
      ) {
        this.gameOver = true;
        this.winner = player.name;
        this.lastAction = `${player.name} wins the game!`;
        return;
      }
    }

    // CHANGED: Also check — if a player has 0 cards and the pile is empty
    // and there's no challenge active, the other player wins
    // This handles edge cases where both conditions align
  }

  // ── State Serialisation ───────────────────────────

  getStateForClient(): GameStateForClient {
    return {
      roomCode: this.roomCode,
      players: this.players.map((p) => ({
        id: p.id,
        name: p.name,
        cardCount: p.hand.length,
        connected: p.connected,
      })),
      centralPile: this.centralPile,
      centralPileCount: this.centralPile.length,
      currentPlayerIndex: this.currentPlayerIndex,
      challenge: this.challenge,
      pendingCollection: this.pendingCollection,
      gameStarted: this.gameStarted,
      gameOver: this.gameOver,
      winner: this.winner,
      lastAction: this.lastAction,
      lastSlapResult: this.lastSlapResult,
      lastCardPlayed: this.lastCardPlayed,
      lastBurnedCard: this.lastBurnedCard,       // NEW
      cardRevealed: this.cardRevealed,           // NEW
      // CHANGED: allow slapping even during pending collection
      canSlap: this.centralPile.length > 0 && !this.gameOver,
    };
  }
}