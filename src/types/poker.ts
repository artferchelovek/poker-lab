export type Suit = 'H' | 'D' | 'C' | 'S';
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export interface Card {
  id: string;
  rank: Rank;
  suit: Suit;
}

export type PokerCombination =
  | 'High Card'
  | 'One Pair'
  | 'Two Pair'
  | 'Three of a Kind'
  | 'Straight'
  | 'Flush'
  | 'Full House'
  | 'Four of a Kind'
  | 'Straight Flush'
  | 'Royal Flush';

export interface SimulationResult {
  winRate: number;
  opponentCombos: Record<PokerCombination, number>;
}

export interface HandResult {
  rank: number;
  name: PokerCombination;
  tieBreakers: number[];
}

export const SUITS: Suit[] = ['H', 'D', 'C', 'S'];
export const RANKS: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

export const RANK_LABELS: Record<Rank, string> = {
  2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
  11: 'J', 12: 'Q', 13: 'K', 14: 'A',
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  H: '♥', D: '♦', C: '♣', S: '♠',
};

export const SUIT_NAMES: Record<Suit, string> = {
  H: 'Hearts', D: 'Diamonds', C: 'Clubs', S: 'Spades',
};

export const COMBINATION_NAMES: PokerCombination[] = [
  'High Card',
  'One Pair',
  'Two Pair',
  'Three of a Kind',
  'Straight',
  'Flush',
  'Full House',
  'Four of a Kind',
  'Straight Flush',
  'Royal Flush',
];

export const HAND_RANK: Record<PokerCombination, number> = {
  'High Card': 1,
  'One Pair': 2,
  'Two Pair': 3,
  'Three of a Kind': 4,
  'Straight': 5,
  'Flush': 6,
  'Full House': 7,
  'Four of a Kind': 8,
  'Straight Flush': 9,
  'Royal Flush': 10,
};
