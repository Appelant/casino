import { clsx } from 'clsx';
import { getRankFromAmount, getRankProgress } from '../utils/rankSystem';
import { formatCurrency } from '@/utils/currency';

export interface RankBadgeProps {
  /** Solde actuel en centimes — détermine le rang */
  balance: number;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  className?: string;
}

/**
 * RankBadge — pilier de rank Valorant-style avec icône, label et glow.
 * Le rang est calculé d'après le solde actuel (balance).
 */
export function RankBadge({ balance, size = 'md', showProgress = false, className }: RankBadgeProps) {
  const rank = getRankFromAmount(balance);
  const progress = getRankProgress(balance);

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

      {showProgress && rank.maxAmount !== null && (
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
          {formatCurrency(balance)}
        </div>
      )}
    </div>
  );
}
