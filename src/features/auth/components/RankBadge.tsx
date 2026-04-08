import { clsx } from 'clsx';
import { getRankFromElo, getRankProgress } from '../utils/rankSystem';

export interface RankBadgeProps {
  elo: number;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  className?: string;
}

/**
 * RankBadge — pilier de rank Valorant-style avec icône, label et glow.
 */
export function RankBadge({ elo, size = 'md', showProgress = false, className }: RankBadgeProps) {
  const rank = getRankFromElo(elo);
  const progress = getRankProgress(elo);

  const sizes = {
    sm: { icon: 'text-lg', label: 'text-xs', padding: 'px-2 py-1', gap: 'gap-1.5' },
    md: { icon: 'text-2xl', label: 'text-sm', padding: 'px-3 py-2', gap: 'gap-2' },
    lg: { icon: 'text-4xl', label: 'text-lg', padding: 'px-4 py-3', gap: 'gap-3' },
  }[size];

  return (
    <div className={clsx('inline-flex flex-col', className)}>
      <div
        className={clsx(
          'inline-flex items-center rounded-lg border backdrop-blur-sm',
          sizes.padding,
          sizes.gap
        )}
        style={{
          borderColor: `${rank.color}66`,
          backgroundColor: `${rank.color}15`,
          boxShadow: rank.glow,
        }}
      >
        <span className={sizes.icon}>{rank.icon}</span>
        <span
          className={clsx('font-bold uppercase tracking-wider', sizes.label)}
          style={{ color: rank.color }}
        >
          {rank.label}
        </span>
      </div>

      {showProgress && rank.maxElo !== null && (
        <div className="mt-1 w-full h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              backgroundColor: rank.color,
              boxShadow: rank.glow,
            }}
          />
        </div>
      )}

      {showProgress && (
        <div className="mt-1 text-[10px] text-white/40 text-center font-mono">
          {elo} ELO
        </div>
      )}
    </div>
  );
}
