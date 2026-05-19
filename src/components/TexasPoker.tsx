import { useState, useCallback } from 'react';
import { Card, SimulationResult, PokerCombination, COMBINATION_NAMES } from '../types/poker';
import { CardSelector } from './CardSelector';
import { PlayingCard } from './PlayingCard';
import { evaluateHand, describeHand } from '../logic/ComboEvaluator';
import { simulateTexas } from '../logic/MonteCarloSimulator';

interface TexasPokerProps {
  burnedCards: Card[];
  onBurnCards: (cards: Card[]) => void;
}

type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'result';

export function TexasPoker({ burnedCards, onBurnCards }: TexasPokerProps) {
  const [street, setStreet] = useState<Street>('preflop');
  const [holeCards, setHoleCards] = useState<Card[]>([]);
  const [boardCards, setBoardCards] = useState<Card[]>([]);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [guess, setGuess] = useState<PokerCombination | ''>('');
  const [guessResult, setGuessResult] = useState<string | null>(null);
  const [bonusMessage, setBonusMessage] = useState<string | null>(null);
  const [round, setRound] = useState(1);

  const toggleHole = useCallback((card: Card) => {
    if (street !== 'preflop') return;
    setHoleCards(prev => {
      const exists = prev.find(c => c.id === card.id);
      if (exists) return prev.filter(c => c.id !== card.id);
      if (prev.length >= 2) return prev;
      return [...prev, card];
    });
    setSimResult(null);
    setGuessResult(null);
    setBonusMessage(null);
  }, [street]);

  const toggleBoard = useCallback((card: Card) => {
    setBoardCards(prev => {
      const exists = prev.find(c => c.id === card.id);
      if (exists) return prev.filter(c => c.id !== card.id);
      const maxCards = street === 'flop' ? 3 : street === 'turn' ? 4 : 5;
      if (prev.length >= maxCards) return prev;
      return [...prev, card];
    });
    setSimResult(null);
  }, [street]);

  const getBoardMax = () => {
    switch (street) {
      case 'flop': return 3;
      case 'turn': return 4;
      case 'river': return 5;
      default: return 0;
    }
  };

  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const result = simulateTexas(holeCards, boardCards, burnedCards, 8000);
      setSimResult(result);
      setIsSimulating(false);
    }, 50);
  };

  const advanceStreet = () => {
    switch (street) {
      case 'preflop':
        if (holeCards.length === 2) {
          runSimulation();
          setStreet('flop');
        }
        break;
      case 'flop':
        if (boardCards.length === 3) {
          runSimulation();
          setStreet('turn');
        }
        break;
      case 'turn':
        if (boardCards.length === 4) {
          runSimulation();
          setStreet('river');
        }
        break;
      case 'river':
        if (boardCards.length === 5) {
          runSimulation();
          setStreet('result');
        }
        break;
    }
  };

  const handleGuess = () => {
    if (!guess || !simResult) return;
    const topCombo = Object.entries(simResult.opponentCombos)
      .sort(([, a], [, b]) => b - a)[0][0] as PokerCombination;
    if (guess === topCombo) {
      setGuessResult('Вы угадали! (+0.1 балла)');
    } else {
      setGuessResult(`Не угадали. Была комбинация: ${topCombo}`);
    }
    if (simResult.winRate > 50) {
      setBonusMessage('Условия пункта 11 выполнены! (+0.1 балла)');
    }
  };

  const handleNextRound = () => {
    onBurnCards([...holeCards, ...boardCards]);
    setHoleCards([]);
    setBoardCards([]);
    setSimResult(null);
    setGuess('');
    setGuessResult(null);
    setBonusMessage(null);
    setStreet('preflop');
    setRound(r => r + 1);
  };

  const currentHand = evaluateHand([...holeCards, ...boardCards]);

  const currentComboColor = (combo: string) => {
    const names: Record<string, string> = {
      'Royal Flush': '#gold', 'Straight Flush': '#e74c3c', 'Four of a Kind': '#e67e22',
      'Full House': '#f39c12', 'Flush': '#27ae60', 'Straight': '#2ecc71',
      'Three of a Kind': '#3498db', 'Two Pair': '#9b59b6', 'One Pair': '#95a5a6', 'High Card': '#7f8c8d',
    };
    return names[combo] || '#7f8c8d';
  };

  return (
    <div className="game-mode texas-mode">
      <div className="round-info">Раунд {round}/3</div>

      <div className="street-indicator">
        {(['preflop', 'flop', 'turn', 'river'] as Street[]).map((s, i) => (
          <span key={s} className={`street-dot ${street === s ? 'active' : ''}`}>
            {['Префлоп', 'Флоп', 'Терн', 'Ривер'][i]}
          </span>
        ))}
      </div>

      <div className="texas-layout">
        <div className="board-section">
          <h3>Стол (общие карты)</h3>
          <div className="hand-display">
            {boardCards.length === 0 && <p className="hint">Карты стола появятся после флопа</p>}
            {boardCards.map(card => (
              <PlayingCard key={card.id} card={card} />
            ))}
          </div>

          {(street === 'flop' || street === 'turn' || street === 'river') && (
            <CardSelector
              selectedCards={boardCards}
              excludedCards={[...burnedCards, ...holeCards]}
              onToggleCard={toggleBoard}
              maxSelect={getBoardMax()}
            />
          )}
        </div>

        <div className="hole-section">
          <h3>Ваши карты</h3>
          <div className="hand-display">
            {holeCards.length === 0 && <p className="hint">Выберите 2 карты</p>}
            {holeCards.map(card => (
              <PlayingCard key={card.id} card={card} />
            ))}
          </div>

          {street === 'preflop' && (
            <CardSelector
              selectedCards={holeCards}
              excludedCards={burnedCards}
              onToggleCard={toggleHole}
              maxSelect={2}
            />
          )}
        </div>
      </div>

      {currentHand.rank > 0 && (
        <div className="hand-info" style={{ color: currentComboColor(currentHand.name) }}>
          Текущая комбинация: <strong>{describeHand([...holeCards, ...boardCards])}</strong>
        </div>
      )}

      {simResult && !isSimulating && (
        <div className="sim-results">
          <div className="winrate-display">
            WinRate: <strong>{simResult.winRate.toFixed(1)}%</strong>
          </div>

          <div className="opponent-combos">
            <h4>Проекция руки соперника:</h4>
            <div className="combo-bars">
              {Object.entries(simResult.opponentCombos)
                .sort(([, a], [, b]) => b - a)
                .filter(([, v]) => v > 1)
                .map(([combo, rate]) => (
                  <div key={combo} className="combo-bar-row">
                    <span className="combo-label">{combo}</span>
                    <div className="combo-bar-track">
                      <div
                        className="combo-bar-fill"
                        style={{ width: `${rate}%`, backgroundColor: currentComboColor(combo) }}
                      />
                    </div>
                    <span className="combo-value">{rate.toFixed(1)}%</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="bonus-section">
            <h4>Угадайте комбинацию соперника</h4>
            <select value={guess} onChange={e => setGuess(e.target.value as PokerCombination)}>
              <option value="">-- Выберите --</option>
              {COMBINATION_NAMES.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <button className="btn btn-small" onClick={handleGuess} disabled={!guess}>
              Проверить
            </button>
            {guessResult && <p className="guess-result">{guessResult}</p>}
            {bonusMessage && <p className="bonus-msg">{bonusMessage}</p>}
          </div>
        </div>
      )}

      {isSimulating && <p className="simulating">Симуляция...</p>}

      <div className="texas-actions">
        {street !== 'result' && (
          <button
            className="btn btn-primary"
            onClick={advanceStreet}
            disabled={
              (street === 'preflop' && holeCards.length !== 2) ||
              (street === 'flop' && boardCards.length !== 3) ||
              (street === 'turn' && boardCards.length !== 4) ||
              (street === 'river' && boardCards.length !== 5)
            }
          >
            {street === 'preflop' ? 'Рассчитать' : 'Далее'}
          </button>
        )}

        {street === 'result' && (
          <button className="btn btn-primary" onClick={handleNextRound}>
            Следующий раунд
          </button>
        )}
      </div>
    </div>
  );
}
