/**
 * Bandeau de résultat avec animation
 */

import { motion } from 'framer-motion';
import { NeonButton } from '@/components/ui';
import type { SlotsResult } from '@/types';
import { bounceIn, fadeIn } from '@/config/animations.config';
import { formatCurrency } from '@/utils/currency';

interface ResultBannerProps {
  result: SlotsResult;
  onContinue: () => void;
}

export function ResultBanner({ result, onContinue }: ResultBannerProps) {
  const isWin = result.isWin;
  const isJackpot = result.isJackpot;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className={`my-4 rounded-xl border-2 p-6 text-center ${
        isJackpot
          ? 'border-neon-gold bg-gradient-to-r from-purple-900/50 via-gold-900/30 to-purple-900/50 shadow-[0_0_40px_rgba(245,158,11,0.6)]'
          : isWin
          ? 'border-neon-green bg-green-900/20 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
          : 'border-neon-red bg-red-900/20 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
      }`}
    >
      {/* Icône / Titre */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={bounceIn}
        className="mb-2"
      >
        {isJackpot ? (
          <span className="text-5xl">🎰</span>
        ) : isWin ? (
          <span className="text-4xl">🎉</span>
        ) : (
          <span className="text-4xl">😢</span>
        )}
      </motion.div>

      {/* Message principal */}
      <h3
        className={`mb-1 text-2xl font-bold ${
          isJackpot
            ? 'text-neon-gold drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]'
            : isWin
            ? 'text-neon-green'
            : 'text-gray-400'
        }`}
      >
        {isJackpot
          ? 'JACKPOT 777 !'
          : isWin
          ? result.winLabel
          : 'Perdu'}
      </h3>

      {/* Montant */}
      <p
        className={`mb-4 text-lg ${
          isWin ? 'text-neon-green' : 'text-gray-500'
        }`}
      >
        {isWin ? (
          <span className="font-bold">+{formatCurrency(result.won)}</span>
        ) : (
          <span className="font-bold">-{formatCurrency(result.wagered)}</span>
        )}
      </p>

      {/* Détails du gain */}
      {isWin && result.winLabel && !isJackpot && (
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-sm text-gray-400"
        >
          {result.winLabel}
        </motion.p>
      )}

      {/* Bouton Continuer */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="mt-4"
      >
        <NeonButton
          variant={isWin ? 'gold' : 'purple'}
          size="md"
          onClick={onContinue}
          aria-label="Continuer"
        >
          🔄 Continuer
        </NeonButton>
      </motion.div>
    </motion.div>
  );
}
