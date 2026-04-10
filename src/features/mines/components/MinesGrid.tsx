import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { MinesTile, MinesStatus } from '@/types';
import { scaleIn } from '@/config/animations.config';

interface MinesGridProps {
  tiles: MinesTile[];
  status: MinesStatus;
  isLoading: boolean;
  onReveal: (index: number) => void;
}

export function MinesGrid({ tiles, status, isLoading, onReveal }: MinesGridProps) {
  const isActive = status === 'active';

  return (
    <div className="grid grid-cols-5 gap-2 w-full max-w-sm mx-auto">
      {tiles.map((tile) => (
        <Tile
          key={tile.index}
          tile={tile}
          isActive={isActive && !isLoading}
          onReveal={onReveal}
        />
      ))}
    </div>
  );
}

// ── Tuile individuelle ────────────────────────────────────────────────────────

interface TileProps {
  tile: MinesTile;
  isActive: boolean;
  onReveal: (index: number) => void;
}

function Tile({ tile, isActive, onReveal }: TileProps) {
  const isHidden = tile.state === 'hidden';
  const isSafe = tile.state === 'safe';
  const isMine = tile.state === 'mine';
  const isMineRevealed = tile.state === 'mine_safe';
  const isClickable = isActive && isHidden;

  return (
    <motion.button
      type="button"
      onClick={() => isClickable && onReveal(tile.index)}
      disabled={!isClickable}
      whileHover={isClickable ? { scale: 1.08 } : undefined}
      whileTap={isClickable ? { scale: 0.93 } : undefined}
      className={clsx(
        'relative aspect-square rounded-xl flex items-center justify-center text-xl font-bold',
        'transition-colors duration-200 select-none',
        // Hidden
        isHidden && isActive && 'bg-casino-surface border-2 border-white/20 hover:border-neon-purple/60 hover:bg-neon-purple/10 cursor-pointer',
        isHidden && !isActive && 'bg-casino-surface border-2 border-white/10 cursor-default',
        // Safe — vert néon
        isSafe && 'bg-neon-green/20 border-2 border-neon-green/60 cursor-default',
        // Mine touchée — rouge
        isMine && 'bg-neon-red/30 border-2 border-neon-red/80 cursor-default',
        // Mine révélée en fin de partie
        isMineRevealed && 'bg-white/5 border-2 border-white/10 cursor-default',
      )}
    >
      {isSafe && (
        <motion.span variants={scaleIn} initial="hidden" animate="visible">
          💎
        </motion.span>
      )}
      {isMine && (
        <motion.span variants={scaleIn} initial="hidden" animate="visible">
          💣
        </motion.span>
      )}
      {isMineRevealed && (
        <span className="opacity-40 text-base">💣</span>
      )}
      {isHidden && !isActive && (
        <span className="text-white/10 text-xs">?</span>
      )}
    </motion.button>
  );
}
