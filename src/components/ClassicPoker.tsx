import { useState, useCallback, useEffect } from 'react';
import { Card, SimulationResult, PokerCombination, COMBINATION_NAMES } from '../types/poker';
import { CardSelector } from './CardSelector';
import { PlayingCard } from './PlayingCard';
import { evaluateHand, describeHand } from '../logic/ComboEvaluator';
import { simulateClassic, simulateClassicCurrentHand } from '../logic/MonteCarloSimulator';

interface ClassicPokerProps {
  burnedCards: Card[];
  onBurnCards: (cards: Card[]) => void;
}

type Step = 'select' | 'analyze' | 'opponent' | 'result';

export function ClassicPoker({ burnedCards, onBurnCards }: ClassicPokerProps) {
  const [step, setStep] = useState<Step>('select');
  const [hand, setHand] = useState<Card[]>([]);
  const [discardIndices, setDiscardIndices] = useState<number[]>([]);
  const [currentResult, setCurrentResult] = useState<SimulationResult | null>(null);
  const [recommendations, setRecommendations] = useState<{ keepIndices: number[]; result: SimulationResult }[]>([]);
  const [finalResult, setFinalResult] = useState<SimulationResult | null>(null);
  const [opponentExchange, setOpponentExchange] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [guess, setGuess] = useState<PokerCombination | ''>('');
  const [guessResult, setGuessResult] = useState<string | null>(null);
  const [bonusMessage, setBonusMessage] = useState<string | null>(null);
  const [newCards, setNewCards] = useState<Card[]>([]);

  const handResult = hand.length === 5 ? evaluateHand(hand) : null;

  const toggleCard = useCallback((card: Card) => {
    setHand(prev => {
      const exists = prev.find(c => c.id === card.id);
      if (exists) {
        return prev.filter(c => c.id !== card.id);
      }
      if (prev.length >= 5) return prev;
      return [...prev, card];
    });
  }, []);

  const toggleDiscard = (index: number) => {
    setDiscardIndices(prev => {
      if (prev.includes(index)) return prev.filter(i => i !== index);
      if (prev.length >= 3) return prev;
      return [...prev, index];
    });
  };

  const runAnalysis = async () => {
    if (hand.length !== 5) return;
    setIsAnalyzing(true);
    setAnalyzeProgress(0);

    const keepCount = 5 - discardIndices.length;
    if (keepCount < 2) {
      setIsAnalyzing(false);
      return;
    }

    const keepIndices = [0, 1, 2, 3, 4].filter(i => !discardIndices.includes(i));

    const current = simulateClassicCurrentHand(hand, burnedCards, 4000);
    setCurrentResult(current);
    setAnalyzeProgress(1);

    const newResult = simulateClassic(hand, keepIndices, burnedCards, 4000);
    setAnalyzeProgress(2);

    setRecommendations([
      { keepIndices: [0, 1, 2, 3, 4], result: current },
      { keepIndices, result: newResult },
    ]);

    setIsAnalyzing(false);
    setStep('opponent');
  };

  const runFinalSimulation = () => {
    const keepIndices = [0, 1, 2, 3, 4].filter(i => !discardIndices.includes(i));
    const result = simulateClassic(hand, keepIndices, burnedCards, 8000);
    setFinalResult(result);

    const keptCards = keepIndices.map(i => hand[i]);
    const drawn = result as any;
    setNewCards(keptCards);

    setStep('result');
  };

  const currentCombo = handResult?.name || '';
  const comboColor = (combo: string) => {
    const names: Record<string, string> = {
      'Royal Flush': '#gold', 'Straight Flush': '#e74c3c', 'Four of a Kind': '#e67e22',
      'Full House': '#f39c12', 'Flush': '#27ae60', 'Straight': '#2ecc71',
      'Three of a Kind': '#3498db', 'Two Pair': '#9b59b6', 'One Pair': '#95a5a6', 'High Card': '#7f8c8d',
    };
    return names[combo] || '#7f8c8d';
  };

  const handleGuess = () => {
    if (!guess || !currentResult) return;
    const topCombo = Object.entries(currentResult.opponentCombos)
      .sort(([, a], [, b]) => b - a)[0][0] as PokerCombination;
    if (guess === topCombo) {
      setGuessResult('Вы угадали! (+0.1 балла)');
    } else {
      setGuessResult(`Не угадали. Была комбинация: ${topCombo}`);
    }
    if (currentResult.winRate > 50) {
      setBonusMessage('Условия пункта 11 выполнены! (+0.1 балла)');
    }
  };

  const handleNextRound = () => {
    const allCards = [...hand, ...(currentResult ? [] : [])];
    onBurnCards(allCards);
    setHand([]);
    setDiscardIndices([]);
    setCurrentResult(null);
    setRecommendations([]);
    setFinalResult(null);
    setOpponentExchange(0);
    setGuess('');
    setGuessResult(null);
    setNewCards([]);
    setStep('select');
  };

  return (
    <div className="game-mode classic-mode">
      <div className="step-indicator">
        <span className={`step-dot ${step === 'select' ? 'active' : ''} ${step !== 'select' ? 'done' : ''}`}>1</span>
        <span className="step-line" />
        <span className={`step-dot ${step === 'opponent' ? 'active' : ''} ${step === 'result' ? 'done' : ''}`}>2</span>
        <span className="step-line" />
        <span className={`step-dot ${step === 'result' ? 'active' : ''}`}>3</span>
      </div>

      {step === 'select' && (
        <div className="step-content">
          <h3>1. Ваши карты (Раздача)</h3>
          <CardSelector
            selectedCards={hand}
            excludedCards={burnedCards}
            onToggleCard={toggleCard}
            maxSelect={5}
          />

          <div className="hand-display">
            {hand.length === 0 && <p className="hint">Выберите 5 карт из селектора выше</p>}
            {hand.map((card, i) => (
              <div key={card.id} className="hand-card-wrapper">
                <PlayingCard card={card} />
                {hand.length === 5 && (
                  <label className="discard-checkbox">
                    <input
                      type="checkbox"
                      checked={discardIndices.includes(i)}
                      onChange={() => toggleDiscard(i)}
                    />
                    <span>Сбросить</span>
                  </label>
                )}
              </div>
            ))}
          </div>

          {handResult && (
            <div className="hand-info" style={{ color: comboColor(currentCombo) }}>
              Текущая комбинация: <strong>{describeHand(hand)}</strong>
            </div>
          )}

          {hand.length === 5 && (
            <button
              className="btn btn-primary"
              onClick={runAnalysis}
              disabled={isAnalyzing || discardIndices.length === 0}
            >
              {isAnalyzing ? 'Анализ...' : 'Анализ обмена'}
            </button>
          )}
        </div>
      )}

      {step === 'opponent' && (
        <div className="step-content">
          <h3>2. Результаты анализа</h3>

          <div className="recommendations">
            <h4>Рекомендации по обмену:</h4>
            {recommendations.slice(1).map((rec, idx) => {
              const discarding = [0, 1, 2, 3, 4]
                .filter(i => !rec.keepIndices.includes(i));
              return (
                <div key={idx} className="rec-card">
                  <span className="rec-label">Сбросить: </span>
                  {discarding.map(i => (
                    <PlayingCard key={hand[i].id} card={hand[i]} small />
                  ))}
                  <span className="rec-winrate">
                    Ожидаемый WinRate: <strong>{rec.result.winRate.toFixed(1)}%</strong>
                  </span>
                </div>
              );
            })}
          </div>

          <div className="opponent-section">
            <h4>3. Обмен соперника</h4>
            <label className="input-label">
              Сколько карт поменял соперник?
              <select
                value={opponentExchange}
                onChange={e => setOpponentExchange(Number(e.target.value))}
              >
                {[0, 1, 2, 3].map(n => (
                  <option key={n} value={n}>{n} карт{n === 1 ? 'а' : n > 1 ? '' : ''}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="bonus-section">
            <h4>4. Угадайте комбинацию соперника</h4>
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

          <button className="btn btn-primary" onClick={runFinalSimulation}>
            Вскрываемся
          </button>
        </div>
      )}

      {step === 'result' && finalResult && (
        <div className="step-content">
          <h3>Финальный результат</h3>

          {newCards.length > 0 && (
            <div className="final-hand">
              <h4>Ваша рука после обмена:</h4>
              <div className="hand-display">
                {newCards.map(card => (
                  <PlayingCard key={card.id} card={card} />
                ))}
              </div>
            </div>
          )}

          <div className="result-stats">
            <div className="stat-card winrate">
              <span className="stat-label">Ваш WinRate</span>
              <span className="stat-value">{finalResult.winRate.toFixed(1)}%</span>
            </div>
          </div>

          <div className="opponent-combos">
            <h4>Предполагаемые комбинации соперника:</h4>
            <div className="combo-bars">
              {Object.entries(finalResult.opponentCombos)
                .sort(([, a], [, b]) => b - a)
                .filter(([, v]) => v > 0.5)
                .map(([combo, rate]) => (
                  <div key={combo} className="combo-bar-row">
                    <span className="combo-label">{combo}</span>
                    <div className="combo-bar-track">
                      <div
                        className="combo-bar-fill"
                        style={{ width: `${rate}%`, backgroundColor: comboColor(combo) }}
                      />
                    </div>
                    <span className="combo-value">{rate.toFixed(1)}%</span>
                  </div>
                ))}
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleNextRound}>
            Следующий раунд
          </button>
        </div>
      )}
    </div>
  );
}
