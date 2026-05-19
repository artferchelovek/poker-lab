import { Card, HandResult, PokerCombination, RANK_LABELS } from '../types/poker';

function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [first, ...rest] = arr;
  const withFirst = combinations(rest, k - 1).map(c => [first, ...c]);
  const withoutFirst = combinations(rest, k);
  return [...withFirst, ...withoutFirst];
}

function checkStraight(ranks: number[]): number | null {
  const unique = [...new Set(ranks)].sort((a, b) => b - a);

  for (let i = 0; i <= unique.length - 5; i++) {
    if (unique[i] - unique[i + 4] === 4) {
      return unique[i];
    }
  }

  if (unique.includes(14) && unique.includes(5) && unique.includes(4) && unique.includes(3) && unique.includes(2)) {
    return 5;
  }

  return null;
}

export function evaluateFiveCards(cards: Card[]): HandResult {
  const rankValues = cards.map(c => c.rank);
  const sortedRanks = [...rankValues].sort((a, b) => b - a);
  const suits = cards.map(c => c.suit);

  const isFlush = suits.every(s => s === suits[0]);
  const straightHigh = checkStraight(sortedRanks);
  const isStraight = straightHigh !== null;

  if (isFlush && isStraight) {
    if (straightHigh === 14) {
      return { rank: 10, name: 'Royal Flush', tieBreakers: [] };
    }
    return { rank: 9, name: 'Straight Flush', tieBreakers: [straightHigh] };
  }

  const freq: Record<number, number> = {};
  for (const r of rankValues) {
    freq[r] = (freq[r] || 0) + 1;
  }

  const groups = Object.entries(freq)
    .map(([r, c]) => ({ rank: Number(r) as 2|3|4|5|6|7|8|9|10|11|12|13|14, count: c }))
    .sort((a, b) => b.count - a.count || b.rank - a.rank);

  if (groups[0].count === 4) {
    return { rank: 8, name: 'Four of a Kind', tieBreakers: [groups[0].rank, groups[1].rank] };
  }

  if (groups[0].count === 3 && groups.length > 1 && groups[1].count === 2) {
    return { rank: 7, name: 'Full House', tieBreakers: [groups[0].rank, groups[1].rank] };
  }

  if (isFlush) {
    return { rank: 6, name: 'Flush', tieBreakers: sortedRanks };
  }

  if (isStraight) {
    return { rank: 5, name: 'Straight', tieBreakers: [straightHigh] };
  }

  if (groups[0].count === 3) {
    const kickers = groups.filter(g => g.count === 1).map(g => g.rank).sort((a, b) => b - a);
    return { rank: 4, name: 'Three of a Kind', tieBreakers: [groups[0].rank, ...kickers] };
  }

  if (groups[0].count === 2 && groups.length > 1 && groups[1].count === 2) {
    const highPair = Math.max(groups[0].rank, groups[1].rank) as 2|3|4|5|6|7|8|9|10|11|12|13|14;
    const lowPair = Math.min(groups[0].rank, groups[1].rank) as 2|3|4|5|6|7|8|9|10|11|12|13|14;
    const kicker = groups[2].rank;
    return { rank: 3, name: 'Two Pair', tieBreakers: [highPair, lowPair, kicker] };
  }

  if (groups[0].count === 2) {
    const kickers = groups.filter(g => g.count === 1).map(g => g.rank).sort((a, b) => b - a);
    return { rank: 2, name: 'One Pair', tieBreakers: [groups[0].rank, ...kickers] };
  }

  return { rank: 1, name: 'High Card', tieBreakers: sortedRanks };
}

export function evaluateHand(cards: Card[]): HandResult {
  if (cards.length < 5) {
    const rankValues = cards.map(c => c.rank).sort((a, b) => b - a);
    return { rank: 0, name: 'High Card', tieBreakers: rankValues };
  }

  const combos = combinations(cards, 5);
  let best: HandResult | null = null;

  for (const combo of combos) {
    const result = evaluateFiveCards(combo);
    if (!best || compareHands(result, best) > 0) {
      best = result;
    }
  }

  return best!;
}

export function compareHands(a: HandResult, b: HandResult): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  for (let i = 0; i < a.tieBreakers.length; i++) {
    const aVal = i < a.tieBreakers.length ? a.tieBreakers[i] : -1;
    const bVal = i < b.tieBreakers.length ? b.tieBreakers[i] : -1;
    if (aVal !== bVal) return aVal - bVal;
  }
  return 0;
}

export function handName(cards: Card[]): string {
  const result = evaluateHand(cards);
  return result.name;
}

export function describeHand(cards: Card[]): string {
  const result = evaluateHand(cards);
  if (result.rank === 0) return 'Недостаточно карт';
  if (result.name === 'High Card') {
    return `Старшая карта: ${RANK_LABELS[result.tieBreakers[0] as keyof typeof RANK_LABELS] || result.tieBreakers[0]}`;
  }
  if (result.name === 'One Pair') {
    return `Пара: ${RANK_LABELS[result.tieBreakers[0] as keyof typeof RANK_LABELS] || result.tieBreakers[0]}`;
  }
  if (result.name === 'Two Pair') {
    return `Две пары: ${RANK_LABELS[result.tieBreakers[0] as keyof typeof RANK_LABELS] || result.tieBreakers[0]} и ${RANK_LABELS[result.tieBreakers[1] as keyof typeof RANK_LABELS] || result.tieBreakers[1]}`;
  }
  if (result.name === 'Three of a Kind') {
    return `Сет: ${RANK_LABELS[result.tieBreakers[0] as keyof typeof RANK_LABELS] || result.tieBreakers[0]}`;
  }
  return result.name;
}
