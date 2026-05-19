import { Card, HandResult, PokerCombination, SimulationResult, COMBINATION_NAMES } from '../types/poker';
import { getRemainingDeck, shuffleDeck } from './DeckManager';
import { evaluateHand, compareHands } from './ComboEvaluator';

function initComboCounter(): Record<PokerCombination, number> {
  const obj = {} as Record<PokerCombination, number>;
  for (const name of COMBINATION_NAMES) {
    obj[name] = 0;
  }
  return obj;
}

export function simulateClassic(
  ourHand: Card[],
  keepIndices: number[],
  excludedCards: Card[],
  iterations: number = 5000
): SimulationResult {
  const remainingDeck = getRemainingDeck([...ourHand, ...excludedCards]);
  const keptCards = keepIndices.map(i => ourHand[i]);
  const cardsToDraw = 5 - keptCards.length;

  let wins = 0;
  const comboCounts = initComboCounter();

  for (let i = 0; i < iterations; i++) {
    const shuffled = shuffleDeck(remainingDeck);
    let cursor = 0;

    const drawn: Card[] = [];
    for (let d = 0; d < cardsToDraw; d++) {
      drawn.push(shuffled[cursor++]);
    }
    const ourFinalCards = [...keptCards, ...drawn];

    const opponentCards = shuffled.slice(cursor, cursor + 5);

    const ourResult = evaluateHand(ourFinalCards);
    const opponentResult = evaluateHand(opponentCards);

    comboCounts[opponentResult.name]++;
    if (compareHands(ourResult, opponentResult) > 0) {
      wins++;
    }
  }

  const winRate = (wins / iterations) * 100;
  const opponentCombos = {} as Record<PokerCombination, number>;
  for (const name of COMBINATION_NAMES) {
    opponentCombos[name] = (comboCounts[name] / iterations) * 100;
  }

  return { winRate, opponentCombos };
}

export function simulateClassicCurrentHand(
  ourHand: Card[],
  excludedCards: Card[],
  iterations: number = 5000
): SimulationResult {
  return simulateClassic(ourHand, [0, 1, 2, 3, 4], excludedCards, iterations);
}

export function simulateTexas(
  ourHand: Card[],
  boardCards: Card[],
  excludedCards: Card[],
  iterations: number = 5000
): SimulationResult {
  const remainingDeck = getRemainingDeck([...ourHand, ...boardCards, ...excludedCards]);
  const boardToDeal = 5 - boardCards.length;

  let wins = 0;
  const comboCounts = initComboCounter();

  for (let i = 0; i < iterations; i++) {
    const shuffled = shuffleDeck(remainingDeck);
    let cursor = 0;

    const opponentHole = [shuffled[cursor++], shuffled[cursor++]];
    const dealtBoard = shuffled.slice(cursor, cursor + boardToDeal);
    const fullBoard = [...boardCards, ...dealtBoard];

    const ourResult = evaluateHand([...ourHand, ...fullBoard]);
    const opponentResult = evaluateHand([...opponentHole, ...fullBoard]);

    comboCounts[opponentResult.name]++;
    if (compareHands(ourResult, opponentResult) > 0) {
      wins++;
    }
  }

  const winRate = (wins / iterations) * 100;
  const opponentCombos = {} as Record<PokerCombination, number>;
  for (const name of COMBINATION_NAMES) {
    opponentCombos[name] = (comboCounts[name] / iterations) * 100;
  }

  return { winRate, opponentCombos };
}
