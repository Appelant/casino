import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { GlassCard } from '@/components/ui/GlassCard';
import { RankBadge } from '@/features/auth/components/RankBadge';
import { usersRepo } from '@/db/users.repo';
import type { UserRecord } from '@/db/schema';
import { useAuthStore } from '@/stores/auth/authStore';
import { formatCurrency } from '@/utils/currency';
import { fadeIn } from '@/config/animations.config';

/**
 * Leaderboard — classement global trié par ELO.
 * Met en évidence l'utilisateur connecté.
 */
export function Leaderboard() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [players, setPlayers] = useState<UserRecord[]>([]);

  useEffect(() => {
    setPlayers(usersRepo.leaderboard(50));
  }, [currentUser?.elo]);

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
        <p className="text-sm text-white/50 uppercase tracking-widest">
          Les meilleurs joueurs ZVC
        </p>
      </div>

      <GlassCard className="p-4">
        {players.length === 0 ? (
          <p className="text-center text-white/40 py-12">
            Aucun joueur classé pour l'instant.
          </p>
        ) : (
          <ul className="space-y-2">
            {players.map((player, index) => {
              const isMe = currentUser?.id === player.id;
              const winRate =
                player.totalGames > 0
                  ? Math.round((player.totalWins / player.totalGames) * 100)
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
                      <span>{player.totalGames} parties</span>
                      <span>•</span>
                      <span>{winRate}% WR</span>
                      <span>•</span>
                      <span className="font-mono">{formatCurrency(player.balance)}</span>
                    </div>
                  </div>

                  {/* Rank badge */}
                  <RankBadge elo={player.elo} size="sm" />
                </motion.li>
              );
            })}
          </ul>
        )}
      </GlassCard>
    </motion.div>
  );
}
