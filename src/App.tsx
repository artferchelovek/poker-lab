import { useState } from 'react';
import { Card } from './types/poker';
import { ClassicPoker } from './components/ClassicPoker';
import { TexasPoker } from './components/TexasPoker';

type GameMode = 'classic' | 'texas';

export default function App() {
  const [mode, setMode] = useState<GameMode>('texas');
  const [burnedCards, setBurnedCards] = useState<Card[]>([]);

  const handleBurnCards = (cards: Card[]) => {
    setBurnedCards(prev => {
      const existing = new Set(prev.map(c => c.id));
      const newCards = cards.filter(c => !existing.has(c.id));
      return [...prev, ...newCards];
    });
  };

  const handleReset = () => {
    setBurnedCards([]);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>PokerLab</h1>
        <div className="mode-switcher">
          <button
            className={`mode-btn ${mode === 'classic' ? 'active' : ''}`}
            onClick={() => { setMode('classic'); handleReset(); }}
          >
            Классический
          </button>
          <button
            className={`mode-btn ${mode === 'texas' ? 'active' : ''}`}
            onClick={() => { setMode('texas'); handleReset(); }}
          >
            Техасский
          </button>
        </div>
        <button className="btn btn-reset" onClick={handleReset}>
          Сбросить игру
        </button>
      </header>

      <main className="app-main">
        {burnedCards.length > 0 && (
          <div className="burned-info">
            Сожжённые карты: {burnedCards.length}
          </div>
        )}

        {mode === 'classic' ? (
          <ClassicPoker burnedCards={burnedCards} onBurnCards={handleBurnCards} />
        ) : (
          <TexasPoker burnedCards={burnedCards} onBurnCards={handleBurnCards} />
        )}
      </main>
    </div>
  );
}
