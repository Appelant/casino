import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { scaleIn } from '@/config/animations.config';

export interface StatsBadgeProps {
  type: 'hot' | 'cold';
  numbers: number[];
}

/**
 * Composant StatsBadge — badge pour numéros chauds/froids
 */
export function StatsBadge({ type, numbers }: StatsBadgeProps) {
  if (numbers.length === 0) return null;

  const colorClass = type === 'hot'
    ? 'bg-neon-red/20 border-neon-red/50 text-neon-red'
    : 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan';

  const icon = type === 'hot' ? '🔥' : '❄️';
  const label = type === 'hot' ? 'Numéros chauds' : 'Numéros froids';

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className={clsx(
        'px-4 py-2 rounded-lg border backdrop-blur-sm',
        colorClass
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <span>{icon}</span>
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="flex gap-1 flex-wrap">
        {numbers.slice(0, 5).map((num) => (
          <span
            key={num}
            className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-xs font-bold"
          >
            {num}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
