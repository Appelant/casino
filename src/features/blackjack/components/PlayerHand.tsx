import { clsx } from 'clsx';
import type { Hand } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { HandOfCards } from './PlayingCard';
import { ScoreDisplay } from './ScoreDisplay';

export interface PlayerHandProps {
  hand: Hand | null;
  isSplit?: boolean;
  isActive?: boolean;
  label?: string;
}

/**
 * Composant PlayerHand — main du joueur
 */
export function PlayerHand({
  hand,
  isSplit = false,
  isActive = false,
  label = 'Vous',
}: PlayerHandProps) {
  if (!hand) return null;

  return (
    <GlassCard
      glowColor={isActive ? 'gold' : 'none'}
      className={clsx(
        'p-4 transition-all duration-300',
        isActive && 'ring-2 ring-neon-gold/50 scale-105'
      )}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Label */}
        <div className="flex items-center gap-2">
          <div className={clsx(
            'w-8 h-8 rounded-full flex items-center justify-center',
            isActive ? 'bg-neon-gold/20' : 'bg-white/10'
          )}>
            <span className="text-lg">👤</span>
          </div>
          <span className={clsx(
            'font-medium',
            isActive ? 'text-neon-gold' : 'text-white/80'
          )}>
            {label}
          </span>
          {isSplit && (
            <span className="text-xs text-white/40 px-2 py-0.5 rounded bg-white/10">
              Split
            </span>
          )}
        </div>

        {/* Cards */}
        <HandOfCards cards={hand.cards} />

        {/* Score */}
        <ScoreDisplay
          hand={hand}
          isBust={hand.isBust}
          isBlackjack={hand.isBlackjack}
        />
      </div>
    </GlassCard>
  );
}

/**
 * Version pour mains splitées (affiche plusieurs mains)
 */
export interface SplitHandsProps {
  hands: Hand[];
  activeHandIndex?: number;
}

export function SplitHands({ hands, activeHandIndex }: SplitHandsProps) {
  return (
    <div className="flex gap-4 justify-center flex-wrap">
      {hands.map((hand, index) => (
        <PlayerHand
          key={`split-${index}`}
          hand={hand}
          isSplit={true}
          isActive={index === activeHandIndex}
          label={`Main ${index + 1}`}
        />
      ))}
    </div>
  );
}
