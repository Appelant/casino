import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuthStore } from '@/stores/auth/authStore';
import { formatCurrency } from '@/utils/currency';
import { fadeIn } from '@/config/animations.config';

type GameFilter = 'all' | 'roulette' | 'blackjack';

/**
 * HistoryPanel — affichage paginé de l'historique des rounds
 * avec filtre par jeu et action effacer.
 */
export function HistoryPanel() {
  const rounds = useAuthStore((s) => s.currentUser?.rounds ?? []);
  const clearHistory = useAuthStore((s) => s.clearHistory);

  const [filter, setFilter] = useState<GameFilter>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filtered = useMemo(() => {
    if (filter === 'all') return rounds;
    return rounds.filter((r) => r.gameId === filter);
  }, [rounds, filter]);

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Historique</h1>
          <p className="text-sm text-white/50">
            {filtered.length} round{filtered.length > 1 ? 's' : ''}
          </p>
        </div>
        {rounds.length > 0 && (
          <NeonButton
            variant="ghost"
            size="sm"
            onClick={() => setShowClearConfirm(true)}
          >
            Effacer
          </NeonButton>
        )}
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-4">
        {(['all', 'roulette', 'blackjack'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              filter === f
                ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/40'
                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
            )}
          >
            {f === 'all' ? 'Tous' : f === 'roulette' ? 'Roulette' : 'Blackjack'}
          </button>
        ))}
      </div>

      {/* Liste */}
      <GlassCard className="p-4">
        {filtered.length === 0 ? (
          <p className="text-center text-white/40 py-12">
            Aucun round à afficher.
          </p>
        ) : (
          <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {filtered.map((round) => (
              <li
                key={round.id}
                className={clsx(
                  'flex items-center justify-between p-3 rounded-lg border',
                  round.isWin
                    ? 'bg-neon-green/5 border-neon-green/20'
                    : 'bg-neon-red/5 border-neon-red/20'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {round.gameId === 'roulette' ? '🎡' : '🃏'}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-white/90">
                      {round.gameId === 'roulette' &&
                        'winningNumber' in round.details &&
                        `Numéro ${round.details.winningNumber}`}
                      {round.gameId === 'blackjack' &&
                        'outcome' in round.details &&
                        round.details.outcome}
                    </div>
                    <div className="text-xs text-white/40">
                      {new Date(round.timestamp).toLocaleString('fr-FR')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={clsx(
                      'font-mono font-bold text-sm',
                      round.isWin ? 'text-neon-green' : 'text-neon-red'
                    )}
                  >
                    {round.isWin ? '+' : ''}
                    {formatCurrency(round.netProfit)}
                  </div>
                  <div className="text-xs text-white/40">
                    Mise {formatCurrency(round.wagered)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={clearHistory}
        title="Effacer l'historique ?"
        message="Tous les rounds enregistrés seront supprimés. Cette action est irréversible."
        confirmLabel="Effacer"
        variant="danger"
      />
    </motion.div>
  );
}
