import { Card, Rank, Suit, SUITS, RANKS } from '../types/poker';

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${rank}-${suit}`,
        rank,
        suit,
      });
    }
  }
  return deck;
}

export function getRemainingDeck(deadCards: Card[]): Card[] {
  const deadIds = new Set(deadCards.map(c => c.id));
  return createDeck().filter(c => !deadIds.has(c.id));
}

export function shuffleDeck(deck: Card[]): Card[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function isCardInList(card: Card, list: Card[]): boolean {
  return list.some(c => c.id === card.id);
}
