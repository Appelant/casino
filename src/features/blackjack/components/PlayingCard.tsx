import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import type { Card } from '@/types';
import { flip3D, flip3DReduced, prefersReducedMotion } from '@/config/animations.config';
import { SUIT_SYMBOLS } from '../utils/blackjackConstants';

export interface PlayingCardProps {
  card: Card;
  index?: number;
  isRevealed?: boolean;
  className?: string;
}

const suitColors: Record<string, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-white',
  spades: 'text-white',
};

/**
 * Composant PlayingCard — carte à jouer avec flip 3D
 *
 * Features:
 * - Flip 3D avec Framer Motion
 * - Carte face-down (dos) ou face-up (valeur visible)
 * - Animation respectant prefers-reduced-motion
 */
export function PlayingCard({
  card,
  isRevealed = true,
  className,
}: PlayingCardProps) {
  const useReducedMotion = prefersReducedMotion();
  const variants = useReducedMotion ? flip3DReduced : flip3D;

  const isFaceDown = card.isFaceDown ?? !isRevealed;
  const suitColor = suitColors[card.suit] || 'text-white';
  const suitSymbol = SUIT_SYMBOLS[card.suit] || '?';

  return (
    <motion.div
      className={clsx('perspective-1000', className)}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        initial={isFaceDown ? 'faceDown' : 'faceUp'}
        animate={isFaceDown ? 'faceDown' : 'faceUp'}
        variants={variants}
        className={clsx(
          'relative w-20 h-28 md:w-24 md:h-36 rounded-lg shadow-xl',
          'transform-style-3d',
          'transition-transform duration-500'
        )}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Face avant (valeur de la carte) */}
        <div
          className={clsx(
            'absolute inset-0 rounded-lg',
            'bg-white border-2 border-gray-200',
            'backface-hidden',
            'flex flex-col justify-between p-2',
            suitColor
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Top-left corner */}
          <div className="text-left">
            <div className="text-lg md:text-xl font-bold leading-none">
              {card.rank}
            </div>
            <div className="text-sm leading-none">{suitSymbol}</div>
          </div>

          {/* Center suit (large) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl md:text-5xl">{suitSymbol}</span>
          </div>

          {/* Bottom-right corner (rotated 180°) */}
          <div className="text-right rotate-180">
            <div className="text-lg md:text-xl font-bold leading-none">
              {card.rank}
            </div>
            <div className="text-sm leading-none">{suitSymbol}</div>
          </div>
        </div>

        {/* Face arrière (dos de carte) */}
        <div
          className={clsx(
            'absolute inset-0 rounded-lg',
            'bg-gradient-to-br from-blue-800 to-blue-950',
            'border-2 border-blue-700',
            'backface-hidden',
            'flex items-center justify-center'
          )}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Pattern décoratif */}
          <div className="w-16 h-20 border-2 border-blue-400/30 rounded flex items-center justify-center">
            <div className="text-2xl opacity-30">♠</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Rendu d'une main complète de cartes
 */
export interface HandOfCardsProps {
  cards: Card[];
  isDealer?: boolean;
  hiddenCardIndex?: number;
}

export function HandOfCards({
  cards,
  hiddenCardIndex,
}: HandOfCardsProps) {
  if (cards.length === 0) {
    return (
      <div className="w-20 h-28 md:w-24 md:h-36 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center">
        <span className="text-white/20 text-sm">Vide</span>
      </div>
    );
  }

  return (
    <div className="flex -space-x-8 md:-space-x-10">
      {cards.map((card, index) => {
        const isHidden = index === hiddenCardIndex;
        return (
          <PlayingCard
            key={`${card.suit}-${card.rank}-${index}`}
            card={{ ...card, isFaceDown: isHidden }}
            index={index}
            isRevealed={!isHidden}
          />
        );
      })}
    </div>
  );
}
