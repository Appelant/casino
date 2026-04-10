import { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { usePlayerStore } from '@/stores/player/playerStore';
import { useAuthStore } from '@/stores/auth/authStore';
import { calculateUserStats, type UserStats } from '@/stores/stats/userStatsStore';
import { formatCurrency } from '@/utils/currency';
import { fadeIn, staggerContainer } from '@/config/animations.config';

export interface StatsPanelProps {
  onClose?: () => void;
}

/**
 * Composant StatsPanel — tableau de bord statistique complet
 *
 * Affiche :
 * - Stats globales (toutes parties confondues)
 * - Stats par jeu (roulette / blackjack)
 * - Win/Loss streaks
 * - RTP (Return To Player)
 * - Historique récent
 * - Distribution des résultats
 */
export function StatsPanel({ onClose }: StatsPanelProps) {
  const currentUsername = usePlayerStore((s) => s.username);

  // S'abonner à l'historique de l'utilisateur courant
  const rounds = useAuthStore((s) => s.currentUser?.rounds ?? []);

  // État local pour les stats (recalculé à chaque changement de rounds)
  const [stats, setStats] = useState<UserStats>(() => calculateUserStats(rounds));

  // Recalculer les stats quand l'historique change
  useEffect(() => {
    setStats(calculateUserStats(rounds));
  }, [rounds]);

  // Calculs dérivés
  const rtp = useMemo(() => {
    if (stats.totalWagered === 0) return 0;
    return Math.round((stats.totalWon / stats.totalWagered) * 100 * 100) / 100;
  }, [stats.totalWagered, stats.totalWon]);

  const winRate = useMemo(() => {
    if (stats.totalGames === 0) return 0;
    return Math.round((stats.totalWins / stats.totalGames) * 100 * 100) / 100;
  }, [stats.totalGames, stats.totalWins]);

  const netProfit = stats.totalWon - stats.totalWagered;

  // Stats par jeu - avec états locaux pour persistance
  const [rouletteStats, setRouletteStats] = useState<UserStats>(() => calculateUserStats(rounds.filter((r) => r.gameId === 'roulette')));
  const [blackjackStats, setBlackjackStats] = useState<UserStats>(() => calculateUserStats(rounds.filter((r) => r.gameId === 'blackjack')));
  const [diceStats, setDiceStats] = useState<UserStats>(() => calculateUserStats(rounds.filter((r) => r.gameId === 'dice')));
  const [slotsStats, setSlotsStats] = useState<UserStats>(() => calculateUserStats(rounds.filter((r) => r.gameId === 'slots')));
  const [minesStats, setMinesStats] = useState<UserStats>(() => calculateUserStats(rounds.filter((r) => r.gameId === 'mines')));

  useEffect(() => {
    setRouletteStats(calculateUserStats(rounds.filter((r) => r.gameId === 'roulette')));
    setBlackjackStats(calculateUserStats(rounds.filter((r) => r.gameId === 'blackjack')));
    setDiceStats(calculateUserStats(rounds.filter((r) => r.gameId === 'dice')));
    setSlotsStats(calculateUserStats(rounds.filter((r) => r.gameId === 'slots')));
    setMinesStats(calculateUserStats(rounds.filter((r) => r.gameId === 'mines')));
  }, [rounds]);

  // Derniers rounds
  const recentRounds = rounds.slice(0, 10);

  // Meilleure victoire (round avec le plus gros netProfit positif)
  const bestWin = useMemo(() => {
    return rounds.reduce<typeof rounds[number] | null>((best, r) => {
      if (r.netProfit <= 0) return best;
      if (!best || r.netProfit > best.netProfit) return r;
      return best;
    }, null);
  }, [rounds]);

  // Streak status
  const streakStatus = stats.currentStreak >= 3 ? 'hot' : stats.currentStreak <= -3 ? 'cold' : 'neutral';

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Statistiques</h2>
          <p className="text-sm text-white/50">
            Joueur : <span className="text-neon-purple font-medium">{currentUsername}</span>
          </p>
        </div>
        {onClose && (
          <NeonButton variant="purple" size="md" onClick={onClose}>
            Fermer
          </NeonButton>
        )}
      </div>

      {/* Stats globales */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Parties jouées"
          value={stats.totalGames.toString()}
          icon="🎮"
          color="purple"
        />
        <StatCard
          label="Taux de victoire"
          value={`${winRate}%`}
          icon="🎯"
          color="cyan"
        />
        <StatCard
          label="RTP"
          value={`${rtp}%`}
          icon="📊"
          color="gold"
        />
        <StatCard
          label="Gain/Perte net"
          value={`${netProfit >= 0 ? '+' : ''}${formatCurrency(netProfit)}`}
          icon={netProfit >= 0 ? '💰' : '📉'}
          color={netProfit >= 0 ? 'green' : 'red'}
        />
      </motion.div>

      {/* Deuxième ligne de stats */}
      <motion.div variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total misé"
          value={formatCurrency(stats.totalWagered)}
          icon="💵"
          color="purple"
        />
        <StatCard
          label="Total gagné"
          value={formatCurrency(stats.totalWon)}
          icon="🏆"
          color="green"
        />
        <StatCard
          label="Plus gros gain"
          value={formatCurrency(stats.biggestWin)}
          icon="🔥"
          color="gold"
        />
        <StatCard
          label="Streak actuelle"
          value={`${stats.currentStreak >= 0 ? '+' : ''}${stats.currentStreak}`}
          icon={streakStatus === 'hot' ? '🔥' : streakStatus === 'cold' ? '❄️' : '➖'}
          color={streakStatus === 'hot' ? 'green' : streakStatus === 'cold' ? 'blue' : 'gray'}
        />
      </motion.div>

      {/* Meilleure victoire */}
      <GlassCard glowColor="gold" className="p-6 mb-6 bg-gradient-to-br from-neon-gold/10 to-transparent">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🏆</span>
          <div>
            <h3 className="text-lg font-bold text-white">Meilleure victoire</h3>
            <p className="text-xs text-white/40 uppercase tracking-wider">
              Le plus gros gain de tous les temps
            </p>
          </div>
        </div>

        {bestWin ? (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-5xl">
                {bestWin.gameId === 'roulette' ? '🎡' : bestWin.gameId === 'blackjack' ? '🃏' : bestWin.gameId === 'slots' ? '🎰' : bestWin.gameId === 'mines' ? '💣' : '🎲'}
              </div>
              <div>
                <div className="text-sm text-white/50 uppercase tracking-wider">
                  {bestWin.gameId === 'roulette' ? 'Roulette' : bestWin.gameId === 'blackjack' ? 'Blackjack' : bestWin.gameId === 'slots' ? 'Slots' : bestWin.gameId === 'mines' ? 'Mines' : 'Dés'}
                </div>
                <div className="text-xs text-white/40 mt-1">
                  {new Date(bestWin.timestamp).toLocaleString('fr-FR')}
                </div>
                <div className="text-xs text-white/40 mt-0.5">
                  Mise : {formatCurrency(bestWin.wagered)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/40 uppercase tracking-wider mb-1">
                Gain net
              </div>
              <div
                className="text-4xl md:text-5xl font-bold font-mono text-neon-gold"
                style={{ textShadow: '0 0 24px rgba(245, 158, 11, 0.6)' }}
              >
                +{formatCurrency(bestWin.netProfit)}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-white/40 py-6">
            Aucune victoire enregistrée pour l'instant. À toi de jouer !
          </p>
        )}
      </GlassCard>

      {/* Stats par jeu */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Roulette */}
        <GlassCard glowColor="purple" className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🎡</span>
            <h3 className="font-bold text-white">Roulette</h3>
          </div>
          <div className="space-y-2 text-sm">
            <StatRow label="Parties" value={rouletteStats.totalGames.toString()} />
            <StatRow label="Victoires" value={rouletteStats.totalWins.toString()} />
            <StatRow label="Misé" value={formatCurrency(rouletteStats.totalWagered)} />
            <StatRow
              label="Net"
              value={`${(rouletteStats.totalWon - rouletteStats.totalWagered) >= 0 ? '+' : ''}${formatCurrency(rouletteStats.totalWon - rouletteStats.totalWagered)}`}
              highlight
            />
          </div>
        </GlassCard>

        {/* Blackjack */}
        <GlassCard glowColor="gold" className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🃏</span>
            <h3 className="font-bold text-white">Blackjack</h3>
          </div>
          <div className="space-y-2 text-sm">
            <StatRow label="Parties" value={blackjackStats.totalGames.toString()} />
            <StatRow label="Victoires" value={blackjackStats.totalWins.toString()} />
            <StatRow label="Misé" value={formatCurrency(blackjackStats.totalWagered)} />
            <StatRow
              label="Net"
              value={`${(blackjackStats.totalWon - blackjackStats.totalWagered) >= 0 ? '+' : ''}${formatCurrency(blackjackStats.totalWon - blackjackStats.totalWagered)}`}
              highlight
            />
          </div>
        </GlassCard>

        {/* Dés */}
        <GlassCard glowColor="cyan" className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🎲</span>
            <h3 className="font-bold text-white">Dés</h3>
          </div>
          <div className="space-y-2 text-sm">
            <StatRow label="Parties" value={diceStats.totalGames.toString()} />
            <StatRow label="Victoires" value={diceStats.totalWins.toString()} />
            <StatRow label="Misé" value={formatCurrency(diceStats.totalWagered)} />
            <StatRow
              label="Net"
              value={`${(diceStats.totalWon - diceStats.totalWagered) >= 0 ? '+' : ''}${formatCurrency(diceStats.totalWon - diceStats.totalWagered)}`}
              highlight
            />
          </div>
        </GlassCard>

        {/* Slots */}
        <GlassCard glowColor="purple" className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🎰</span>
            <h3 className="font-bold text-white">Slots</h3>
          </div>
          <div className="space-y-2 text-sm">
            <StatRow label="Parties" value={slotsStats.totalGames.toString()} />
            <StatRow label="Victoires" value={slotsStats.totalWins.toString()} />
            <StatRow label="Misé" value={formatCurrency(slotsStats.totalWagered)} />
            <StatRow
              label="Net"
              value={`${(slotsStats.totalWon - slotsStats.totalWagered) >= 0 ? '+' : ''}${formatCurrency(slotsStats.totalWon - slotsStats.totalWagered)}`}
              highlight
            />
          </div>
        </GlassCard>

        {/* Mines */}
        <GlassCard glowColor="none" className="p-5 border-neon-red/20">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💣</span>
            <h3 className="font-bold text-white">Mines</h3>
          </div>
          <div className="space-y-2 text-sm">
            <StatRow label="Parties" value={minesStats.totalGames.toString()} />
            <StatRow label="Victoires" value={minesStats.totalWins.toString()} />
            <StatRow label="Misé" value={formatCurrency(minesStats.totalWagered)} />
            <StatRow
              label="Net"
              value={`${(minesStats.totalWon - minesStats.totalWagered) >= 0 ? '+' : ''}${formatCurrency(minesStats.totalWon - minesStats.totalWagered)}`}
              highlight
            />
          </div>
        </GlassCard>
      </div>

      {/* Streaks et historique */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Streaks */}
        <GlassCard className="p-5">
          <h3 className="text-lg font-bold text-white mb-4">Séries</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Série de victoires</span>
              <span className={clsx(
                'px-3 py-1 rounded-full text-sm font-bold',
                stats.bestWinStreak >= 5 ? 'bg-neon-green/20 text-neon-green' :
                stats.bestWinStreak >= 3 ? 'bg-neon-gold/20 text-neon-gold' :
                'bg-white/10 text-white/40'
              )}>
                🔥 {stats.bestWinStreak}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Série de défaites</span>
              <span className={clsx(
                'px-3 py-1 rounded-full text-sm font-bold',
                stats.bestLossStreak >= 5 ? 'bg-neon-red/20 text-neon-red' :
                stats.bestLossStreak >= 3 ? 'bg-blue-500/20 text-blue-400' :
                'bg-white/10 text-white/40'
              )}>
                ❄️ {stats.bestLossStreak}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Streak actuelle</span>
              <span className={clsx(
                'px-3 py-1 rounded-full text-sm font-bold',
                streakStatus === 'hot' ? 'bg-neon-green/20 text-neon-green' :
                streakStatus === 'cold' ? 'bg-blue-500/20 text-blue-400' :
                'bg-white/10 text-white/40'
              )}>
                {streakStatus === 'hot' ? '🔥' : streakStatus === 'cold' ? '❄️' : '➖'} {stats.currentStreak >= 0 ? '+' : ''}{stats.currentStreak}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Historique récent */}
        <GlassCard className="p-5">
          <h3 className="text-lg font-bold text-white mb-4">10 derniers rounds</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentRounds.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-4">Aucune partie jouée</p>
            ) : (
              recentRounds.map((round) => (
                <div
                  key={round.id}
                  className={clsx(
                    'flex items-center justify-between p-2 rounded-lg text-sm',
                    round.isWin ? 'bg-neon-green/10 border border-neon-green/20' : 'bg-neon-red/10 border border-neon-red/20'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>
                      {round.gameId === 'roulette' ? '🎡'
                        : round.gameId === 'blackjack' ? '🃏'
                        : round.gameId === 'slots' ? '🎰'
                        : round.gameId === 'mines' ? '💣'
                        : '🎲'}
                    </span>
                    <span className="text-white/80">
                      {round.gameId === 'roulette' && 'winningNumber' in round.details && `N°${round.details.winningNumber}`}
                      {round.gameId === 'blackjack' && 'outcome' in round.details && round.details.outcome}
                      {round.gameId === 'dice' && 'rolledFace' in round.details && `Face ${round.details.rolledFace}`}
                      {round.gameId === 'slots' && 'winLabel' in round.details && (round.details.winLabel ?? 'Perdu')}
                      {round.gameId === 'mines' && 'outcome' in round.details && round.details.outcome}
                    </span>
                  </div>
                  <span className={clsx(
                    'font-bold font-mono',
                    round.isWin ? 'text-neon-green' : 'text-neon-red'
                  )}>
                    {round.isWin ? '+' : ''}{formatCurrency(round.netProfit)}
                  </span>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {/* Disclaimer */}
      <div className="text-center text-xs text-white/30">
        ⚠️ Argent fictif uniquement — Aucune valeur réelle
      </div>
    </motion.div>
  );
}

// ============================================
// SOUS-COMPOSANTS
// ============================================

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  color: 'purple' | 'cyan' | 'gold' | 'green' | 'red' | 'blue' | 'gray';
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  const colorClasses = {
    purple: 'border-neon-purple/30 bg-neon-purple/5',
    cyan: 'border-neon-cyan/30 bg-neon-cyan/5',
    gold: 'border-neon-gold/30 bg-neon-gold/5',
    green: 'border-neon-green/30 bg-neon-green/5',
    red: 'border-neon-red/30 bg-neon-red/5',
    blue: 'border-blue-500/30 bg-blue-500/5',
    gray: 'border-white/10 bg-white/5',
  };

  return (
    <GlassCard className={clsx('p-4 border', colorClasses[color])}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-xs text-white/50 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white font-mono">{value}</div>
    </GlassCard>
  );
}

interface StatRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function StatRow({ label, value, highlight }: StatRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/50">{label}</span>
      <span className={clsx(
        'font-bold font-mono',
        highlight ? 'text-lg text-neon-gold' : 'text-white'
      )}>
        {value}
      </span>
    </div>
  );
}
