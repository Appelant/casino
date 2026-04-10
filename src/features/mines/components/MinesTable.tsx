/**
 * MinesTable — composant principal du jeu Mines
 *
 * Orchestre la grille, les contrôles, et l'affichage des résultats.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useMinesEngine } from '../hooks/useMinesEngine';
import { MinesGrid } from './MinesGrid';
import { MinesControls } from './MinesControls';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { usePlayerStore } from '@/stores';
import { formatCurrency } from '@/utils/currency';
import { fadeIn, scaleIn } from '@/config/animations.config';

// 25 tuiles vides pour l'état idle (avant démarrage)
const EMPTY_TILES = Array.from({ length: 25 }, (_, i) => ({ index: i, state: 'hidden' as const }));

export function MinesTable() {
  const engine = useMinesEngine();
  const playerBalance = usePlayerStore((s) => s.balance);

  const isIdle = engine.status === 'idle';
  const isActive = engine.status === 'active';
  const isOver = engine.status === 'cashed_out' || engine.status === 'exploded';

  const tiles = engine.round?.tiles ?? EMPTY_TILES;
  const currentMultiplier = engine.round?.currentMultiplier ?? 1;
  const nextMultiplier = engine.round?.nextMultiplier ?? 1;
  const potentialPayout = engine.round?.potentialPayout ?? engine.wager;

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      {/* Titre */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">
          <span className="text-neon-red">M</span>ines
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Révélez des cases sûres et encaissez avant d'exploser
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">

        {/* ── Colonne gauche : grille + résultat ── */}
        <div className="space-y-4">

          {/* Bannière résultat */}
          <AnimatePresence mode="wait">
            {isOver && engine.round && (
              <motion.div
                key="result"
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className={clsx(
                  'rounded-xl p-4 text-center border',
                  engine.status === 'cashed_out'
                    ? 'bg-neon-green/15 border-neon-green/40'
                    : 'bg-neon-red/15 border-neon-red/40',
                )}
              >
                <div className="text-4xl mb-2">
                  {engine.status === 'cashed_out' ? '💰' : '💥'}
                </div>
                <div className={clsx(
                  'text-xl font-bold',
                  engine.status === 'cashed_out' ? 'text-neon-green' : 'text-neon-red',
                )}>
                  {engine.status === 'cashed_out' ? 'Encaissé !' : 'Explosion !'}
                </div>
                {engine.status === 'cashed_out' && (
                  <div className="text-white/70 text-sm mt-1">
                    +{formatCurrency(engine.round.wonAmount ?? 0)}
                    {' '}({engine.round.currentMultiplier.toFixed(3)}×)
                  </div>
                )}
                {engine.status === 'exploded' && (
                  <div className="text-white/50 text-sm mt-1">
                    -{formatCurrency(engine.wager)}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grille 5×5 */}
          <GlassCard glowColor={isActive ? 'purple' : 'none'} className="p-6">
            <MinesGrid
              tiles={tiles}
              status={engine.status === 'idle' ? 'active' : engine.status}
              isLoading={engine.isLoading}
              onReveal={engine.reveal}
            />
          </GlassCard>

          {/* Stats en cours de partie */}
          {(isActive || isOver) && (
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                <div className="text-white/40 text-xs">Cases sûres</div>
                <div className="text-neon-green font-bold mt-1">
                  {engine.round?.revealedSafe ?? 0}
                </div>
              </div>
              <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                <div className="text-white/40 text-xs">Multiplicateur</div>
                <div className="text-neon-gold font-bold mt-1">
                  {currentMultiplier.toFixed(3)}×
                </div>
              </div>
              <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                <div className="text-white/40 text-xs">Gain si retrait</div>
                <div className="text-white font-bold mt-1">
                  {formatCurrency(potentialPayout)}
                </div>
              </div>
            </div>
          )}

          {/* Prochain multiplicateur */}
          {isActive && (
            <div className="rounded-lg bg-neon-purple/5 border border-neon-purple/20 px-4 py-2 flex items-center justify-between text-sm">
              <span className="text-white/50">Prochain si sûre</span>
              <span className="text-neon-purple font-bold">{nextMultiplier.toFixed(3)}×</span>
            </div>
          )}
        </div>

        {/* ── Colonne droite : contrôles ── */}
        <div className="space-y-4">
          <GlassCard glowColor="gold" className="p-5">

            {/* Solde */}
            <div className="text-center mb-4 pb-4 border-b border-white/10">
              <div className="text-xs text-white/40 uppercase tracking-wider">Solde</div>
              <div className="text-xl font-bold text-neon-gold mt-1">
                {formatCurrency(playerBalance)}
              </div>
            </div>

            {/* Contrôles (visibles seulement en idle) */}
            {isIdle && (
              <MinesControls
                wager={engine.wager}
                mineCount={engine.mineCount}
                playerBalance={playerBalance}
                disabled={false}
                onSetWager={engine.setWager}
                onSetMineCount={engine.setMineCount}
              />
            )}

            {/* Résumé en cours de partie */}
            {(isActive || isOver) && (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Mise</span>
                  <span className="font-mono text-white">{formatCurrency(engine.wager)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Mines</span>
                  <span className="font-mono text-neon-red">{engine.mineCount} 💣</span>
                </div>
                {isActive && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Gain potentiel</span>
                    <span className="font-mono text-neon-gold">{formatCurrency(potentialPayout)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Erreur */}
            {engine.error && (
              <div className="mt-3 rounded-lg bg-neon-red/10 border border-neon-red/30 px-3 py-2 text-xs text-neon-red text-center">
                {engine.error}
              </div>
            )}

            {/* Boutons */}
            <div className="mt-5 space-y-2">
              {isIdle && (
                <NeonButton
                  variant="purple"
                  size="lg"
                  onClick={engine.start}
                  disabled={!engine.canStart || engine.isLoading}
                  loading={engine.isLoading}
                  className="w-full"
                >
                  {engine.isLoading ? 'Démarrage...' : '🚀 Démarrer'}
                </NeonButton>
              )}

              {isActive && (
                <>
                  <NeonButton
                    variant="gold"
                    size="lg"
                    onClick={engine.cashout}
                    disabled={!engine.canCashout || engine.isLoading}
                    loading={engine.isLoading}
                    className="w-full"
                  >
                    {engine.isLoading
                      ? 'Traitement...'
                      : `💰 Encaisser ${formatCurrency(potentialPayout)}`}
                  </NeonButton>
                  <div className="text-center text-xs text-white/30">
                    {(engine.round?.revealedSafe ?? 0) === 0
                      ? 'Révélez une case pour pouvoir encaisser'
                      : `${engine.mineCount} mines cachées sur 25 cases`}
                  </div>
                </>
              )}

              {isOver && (
                <NeonButton
                  variant="cyan"
                  size="lg"
                  onClick={engine.reset}
                  className="w-full"
                >
                  🔄 Nouvelle partie
                </NeonButton>
              )}
            </div>
          </GlassCard>

          {/* Disclaimer */}
          <p className="text-center text-xs text-white/25">
            Argent fictif — Aucun gain réel
          </p>
        </div>
      </div>
    </motion.div>
  );
}
