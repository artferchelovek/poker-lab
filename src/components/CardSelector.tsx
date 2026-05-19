import { useState } from 'react';
import { Card, SUITS, RANKS, RANK_LABELS, SUIT_SYMBOLS } from '../types/poker';

interface CardSelectorProps {
  selectedCards: Card[];
  excludedCards: Card[];
  onToggleCard: (card: Card) => void;
  maxSelect: number;
}

export function CardSelector({ selectedCards, excludedCards, onToggleCard, maxSelect }: CardSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedIds = new Set(selectedCards.map(c => c.id));
  const excludedIds = new Set(excludedCards.map(c => c.id));
  const isFull = selectedCards.length >= maxSelect;

  return (
    <div className="card-selector">
      <button className="btn btn-selector" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? 'Скрыть карты' : 'Выбрать карты'} ({selectedCards.length}/{maxSelect})
      </button>

      {isOpen && (
        <div className="card-grid-overlay">
          <div className="card-grid">
            <div className="card-grid-header">
              <span>Выберите до {maxSelect} карт</span>
              <button className="btn btn-small" onClick={() => setIsOpen(false)}>Готово</button>
            </div>
            <div className="card-grid-body">
              {SUITS.map(suit => (
                <div key={suit} className="card-suit-row">
                  <div className="suit-label" style={{ color: suit === 'H' || suit === 'D' ? '#e74c3c' : '#2c3e50' }}>
                    {SUIT_SYMBOLS[suit]}
                  </div>
                  {RANKS.map(rank => {
                    const id = `${rank}-${suit}`;
                    const isSelected = selectedIds.has(id);
                    const isExcluded = excludedIds.has(id);
                    const canSelect = !isExcluded && !isFull;

                    return (
                      <div
                        key={id}
                        className={`grid-card ${isSelected ? 'grid-selected' : ''} ${isExcluded ? 'grid-excluded' : ''} ${!canSelect && !isSelected ? 'grid-disabled' : ''}`}
                        onClick={() => {
                          if (isSelected) {
                            onToggleCard({ id, rank, suit });
                          } else if (!isExcluded && !isFull) {
                            onToggleCard({ id, rank, suit });
                          }
                        }}
                      >
                        <span className="grid-rank">{RANK_LABELS[rank]}</span>
                        <span className="grid-suit" style={{ color: suit === 'H' || suit === 'D' ? '#e74c3c' : '#2c3e50' }}>
                          {SUIT_SYMBOLS[suit]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
