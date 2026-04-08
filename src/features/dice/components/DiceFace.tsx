/**
 * Composant DiceFace — représentation visuelle d'une face de dé
 *
 * Affiche les points dans la configuration classique du dé.
 * Anime le dé pendant le lancer.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { DiceFace as DiceFaceType } from '@/types';
import { diceRoll, diceRollReduced, prefersReducedMotion } from '@/config/animations.config';
import { secureRandomInt } from '@/utils/rng/rng';

// Positions des points pour chaque face ([rangée, colonne] dans une grille 3×3)
const DOT_POSITIONS: Record<DiceFaceType, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 2], [2, 0]],
  3: [[0, 2], [1, 1], [2, 0]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

export interface DiceFaceProps {
  face: DiceFaceType;
  isRolling: boolean;
  size?: 'sm' | 'md' | 'lg';
  highlighted?: boolean;
  onRollComplete?: () => void;
}

const sizeConfig = {
  sm: { container: 'w-14 h-14', dot: 'w-2.5 h-2.5', padding: 'p-2' },
  md: { container: 'w-20 h-20', dot: 'w-3.5 h-3.5', padding: 'p-3' },
  lg: { container: 'w-36 h-36', dot: 'w-6 h-6', padding: 'p-5' },
};

export function DiceFace({
  face,
  isRolling,
  size = 'lg',
  highlighted = false,
  onRollComplete,
}: DiceFaceProps) {
  const [displayFace, setDisplayFace] = useState<DiceFaceType>(face);
  const reduced = prefersReducedMotion();
  const config = sizeConfig[size];

  // Pendant le lancer: cycle rapide des faces
  useEffect(() => {
    if (!isRolling) {
      setDisplayFace(face);
      onRollComplete?.();
      return;
    }

    const interval = setInterval(() => {
      setDisplayFace(secureRandomInt(1, 6) as DiceFaceType);
    }, reduced ? 100 : 80);

    return () => clearInterval(interval);
  }, [isRolling, face, onRollComplete, reduced]);

  const dots = DOT_POSITIONS[displayFace];
  const variant = reduced ? diceRollReduced : diceRoll;

  return (
    <motion.div
      variants={variant}
      animate={isRolling ? 'rolling' : 'idle'}
      className={`
        ${config.container} ${config.padding}
        relative rounded-2xl
        bg-white/90 border-2
        ${highlighted
          ? 'border-neon-cyan shadow-[0_0_20px_rgba(6,182,212,0.6)]'
          : 'border-white/20 shadow-lg'
        }
        flex items-center justify-center
      `}
    >
      {/* Grille 3×3 des points */}
      <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-0.5">
        {Array.from({ length: 9 }, (_, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const hasDot = dots.some(([r, c]) => r === row && c === col);

          return (
            <div key={i} className="flex items-center justify-center">
              {hasDot && (
                <motion.div
                  key={`${displayFace}-${i}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.1 }}
                  className={`
                    ${config.dot} rounded-full bg-casino-dark
                    shadow-sm
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
