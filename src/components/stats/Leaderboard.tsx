import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { GlassCard } from '@/components/ui/GlassCard';
import { RankBadge } from '@/features/auth/components/RankBadge';
import { leaderboardApi } from '@/api/client';
import { useAuthStore } from '@/stores/auth/authStore';
import { formatCurrency } from '@/utils/currency';
import { fadeIn } from '@/config/animations.config';
import { getAllRanks } from '@/features/auth/utils/rankSystem';

interface LeaderboardPlayer {
  id: string;
  username: string;
  balance: number;
  elo: number;
  total_games: number;
  total_wins: number;
  total_losses: number;
  total_wagered: number;
  total_won: number;
  biggest_win: number;
}

/**
 * Leaderboard — classement global trié par ELO (synchronisé serveur).
 * Met en évidence l'utilisateur connecté.
 */
export function Leaderboard() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRanks, setShowRanks] = useState(false);

  // Grouper tous les paliers par tier
  const allRanks = getAllRanks();
  const tiers = Array.from(new Set(allRanks.map((r) => r.tier)));
  const ranksByTier = tiers.map((tier) => ({
    tier,
    ranks: allRanks.filter((r) => r.tier === tier),
  }));

  // Fetch initial
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Refresh quand l'utilisateur courant change
  useEffect(() => {
    fetchLeaderboard();
  }, [currentUser?.balance, currentUser?.totalGames]);

  // Polling pour rafraîchir le classement toutes les 5s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeaderboard();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchLeaderboard() {
    try {
      const { players: fetched } = await leaderboardApi.get(50);
      const sorted = [...fetched].sort((a, b) => b.balance - a.balance || b.total_won - a.total_won);
      setPlayers(sorted);
      setIsLoading(false);
    } catch (err) {
      console.error('Erreur fetch leaderboard:', err);
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <span className="text-neon-purple">Classement</span>
        </h1>
        <p className="text-sm text-white/50 uppercase tracking-widest mb-4">
          Les meilleurs joueurs ZVC
        </p>
        <button
          onClick={() => setShowRanks((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/90 text-sm transition-all"
        >
          <span>🏅</span>
          <span>{showRanks ? 'Masquer les rangs' : 'Voir les rangs'}</span>
          <span className="text-xs">{showRanks ? '▲' : '▼'}</span>
        </button>

        <AnimatePresence>
          {showRanks && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mt-4"
            >
              <GlassCard className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {ranksByTier.map(({ tier, ranks }) => {
                    const color = ranks[0]!.color;
                    const icon = ranks[0]!.icon;
                    return (
                      <div
                        key={tier}
                        className="rounded-lg border overflow-hidden"
                        style={{ borderColor: `${color}44`, backgroundColor: `${color}08` }}
                      >
                        {/* En-tête du tier */}
                        <div
                          className="flex items-center gap-1.5 px-3 py-2 border-b"
                          style={{ borderColor: `${color}33`, backgroundColor: `${color}18` }}
                        >
                          <span className="text-lg">{icon}</span>
                          <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
                            {tier}
                          </span>
                        </div>
                        {/* Paliers */}
                        <div className="divide-y" style={{ borderColor: `${color}22` }}>
                          {ranks.map((rank) => (
                            <div key={rank.label} className="flex items-center justify-between px-3 py-1.5">
                              <span className="text-xs text-white/60">
                                {rank.division !== null ? `${tier} ${rank.division}` : 'Radiant'}
                              </span>
                              <span className="text-[11px] font-mono" style={{ color: `${color}cc` }}>
                                {formatCurrency(rank.minAmount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <GlassCard className="p-4">
        {isLoading ? (
          <p className="text-center text-white/40 py-12">
            Chargement du classement...
          </p>
        ) : players.length === 0 ? (
          <p className="text-center text-white/40 py-12">
            Aucun joueur classé pour l'instant.
          </p>
        ) : (
          <ul className="space-y-2">
            {players.map((player, index) => {
              const isMe = currentUser?.id === player.id;
              const winRate =
                player.total_games > 0
                  ? Math.round((player.total_wins / player.total_games) * 100)
                  : 0;

              return (
                <motion.li
                  key={player.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={clsx(
                    'flex items-center gap-4 p-3 rounded-xl border transition-all',
                    isMe
                      ? 'bg-neon-purple/15 border-neon-purple/50 shadow-[0_0_20px_rgba(139,92,246,0.25)]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  )}
                >
                  {/* Rang */}
                  <div
                    className={clsx(
                      'w-10 h-10 rounded-lg flex items-center justify-center font-bold',
                      index === 0 && 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
                      index === 1 && 'bg-gray-300/20 text-gray-200 border border-gray-300/40',
                      index === 2 && 'bg-orange-700/20 text-orange-400 border border-orange-700/40',
                      index > 2 && 'bg-white/5 text-white/60 border border-white/10'
                    )}
                  >
                    {index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
                  </div>

                  {/* Pseudo + stats */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white truncate">
                        {player.username}
                      </span>
                      {isMe && (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-neon-purple/30 text-neon-purple">
                          Toi
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/40 mt-0.5">
                      <span>{player.total_games} parties</span>
                      <span>•</span>
                      <span>{winRate}% WR</span>
                      <span>•</span>
                      <span className="font-mono">{formatCurrency(player.balance)}</span>
                    </div>
                  </div>

                  {/* Rank badge */}
                  <RankBadge balance={player.balance} size="sm" />
                </motion.li>
              );
            })}
          </ul>
        )}
      </GlassCard>
    </motion.div>
  );
}
