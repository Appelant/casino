import type { Hand, Card } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { HandOfCards } from './PlayingCard';
import { ScoreDisplay } from './ScoreDisplay';

export interface DealerHandProps {
  hand: Hand | null;
  isPlaying?: boolean;
  isRevealed?: boolean;
  dealerUpCard?: Card | null;
}

/**
 * Composant DealerHand — main du dealer
 *
 * Features:
 * - Carte cachée face-down pendant le tour joueur
 * - Révélation automatique après stand
 * - Affichage du score (partiel si carte cachée)
 */
export function DealerHand({
  hand,
  isPlaying = false,
  isRevealed = false,
}: DealerHandProps) {
  // Pendant le jeu, seule la première carte est visible
  const showingCards = hand?.cards.filter((c) => !c.isFaceDown) ?? [];

  // Calcul du score visible (sans la carte cachée)
  const visibleScore = showingCards.reduce((sum, card) => {
    let value: number;
    if (card.rank === 'A') value = 11;
    else if (['J', 'Q', 'K'].includes(card.rank)) value = 10;
    else value = parseInt(card.rank, 10);
    return sum + value;
  }, 0);

  return (
    <GlassCard glowColor="purple" className="p-4">
      <div className="flex flex-col items-center gap-4">
        {/* Label */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-lg">🎰</span>
          </div>
          <span className="font-medium text-white/80">Dealer</span>
        </div>

        {/* Cards */}
        <HandOfCards
          cards={hand?.cards ?? []}
          isDealer={true}
          hiddenCardIndex={isPlaying && !isRevealed ? 1 : undefined}
        />

        {/* Score */}
        <ScoreDisplay
          hand={hand}
          isBust={hand?.isBust}
          isBlackjack={hand?.isBlackjack}
        />

        {/* Hint during play */}
        {isPlaying && !isRevealed && (
          <div className="text-xs text-white/40">
            Carte visible: {visibleScore}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
