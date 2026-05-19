import { Card, RANK_LABELS, SUIT_SYMBOLS } from '../types/poker';

interface PlayingCardProps {
  card: Card;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  small?: boolean;
}

export function PlayingCard({ card, onClick, disabled, selected, small }: PlayingCardProps) {
  const isRed = card.suit === 'H' || card.suit === 'D';
  const color = isRed ? '#e74c3c' : '#2c3e50';

  const handleClick = () => {
    if (!disabled && onClick) onClick();
  };

  const sizeClass = small ? 'card-small' : '';

  return (
    <div
      className={`playing-card ${sizeClass} ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
      style={{ borderColor: color }}
    >
      <div className="card-rank" style={{ color }}>{RANK_LABELS[card.rank]}</div>
      <div className="card-suit" style={{ color }}>{SUIT_SYMBOLS[card.suit]}</div>
    </div>
  );
}
