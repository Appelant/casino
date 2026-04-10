import { clsx } from 'clsx';
import { GAME_CONFIG } from '@/config/game.config';
import { formatCurrency } from '@/utils/currency';
import { calcMultiplier } from '../utils/minesMultiplier';

interface MinesControlsProps {
  wager: number;
  mineCount: number;
  playerBalance: number;
  disabled: boolean;
  onSetWager: (v: number) => void;
  onSetMineCount: (v: number) => void;
}

const MINE_COUNTS = [1, 2, 3, 5, 8, 12, 16, 20, 24];

function chipLabel(v: number): string {
  const zvc = v / 100;
  if (zvc >= 1000) return `${zvc / 1000}K`;
  return String(zvc);
}

const CHIP_COLORS = [
  'bg-slate-600 border-slate-400 text-white',
  'bg-blue-700 border-blue-400 text-white',
  'bg-red-700 border-red-400 text-white',
  'bg-green-700 border-green-400 text-white',
  'bg-yellow-600 border-yellow-400 text-black',
  'bg-purple-700 border-purple-400 text-white',
  'bg-orange-700 border-orange-400 text-white',
  'bg-pink-700 border-pink-400 text-white',
];

export function MinesControls({
  wager,
  mineCount,
  playerBalance,
  disabled,
  onSetWager,
  onSetMineCount,
}: MinesControlsProps) {
  // Multiplicateur si prochaine case est sûre (1 révélation)
  const firstMultiplier = calcMultiplier(mineCount, 1);

  return (
    <div className="space-y-4">
      {/* Chips de mise */}
      <div>
        <div className="text-xs text-white/50 uppercase tracking-wider mb-2">Mise</div>
        <div className="flex flex-wrap gap-2 justify-center">
          {GAME_CONFIG.CHIP_VALUES.map((v, i) => {
            const canAfford = playerBalance >= v;
            const selected = wager === v;
            return (
              <button
                key={v}
                type="button"
                disabled={disabled || !canAfford}
                onClick={() => onSetWager(v)}
                className={clsx(
                  'w-12 h-12 rounded-full border-[3px] text-xs font-black',
                  'transition-all duration-150',
                  CHIP_COLORS[i % CHIP_COLORS.length],
                  selected && 'ring-2 ring-white ring-offset-2 ring-offset-casino-dark scale-110',
                  !selected && !disabled && canAfford && 'hover:scale-105 hover:brightness-125',
                  (disabled || !canAfford) && 'opacity-40 cursor-not-allowed',
                )}
              >
                {chipLabel(v)}
              </button>
            );
          })}
        </div>
        <div className="text-center mt-2">
          <span className="text-white/40 text-xs">Mise sélectionnée : </span>
          <span className="text-neon-gold font-bold text-sm">{formatCurrency(wager)}</span>
        </div>
      </div>

      {/* Sélecteur de mines */}
      <div>
        <div className="text-xs text-white/50 uppercase tracking-wider mb-2">Nombre de mines</div>
        <div className="flex flex-wrap gap-2 justify-center">
          {MINE_COUNTS.map((n) => (
            <button
              key={n}
              type="button"
              disabled={disabled}
              onClick={() => onSetMineCount(n)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm font-bold border transition-all',
                mineCount === n
                  ? 'bg-neon-red/20 border-neon-red/60 text-neon-red shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                  : 'bg-white/5 border-white/15 text-white/60 hover:bg-white/10',
                disabled && 'opacity-40 cursor-not-allowed',
              )}
            >
              {n} 💣
            </button>
          ))}
        </div>
      </div>

      {/* Info multiplicateur */}
      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <div className="rounded-lg bg-white/5 border border-white/10 p-2">
          <div className="text-white/40">1ère case sûre</div>
          <div className="text-neon-green font-bold mt-0.5">{firstMultiplier.toFixed(3)}×</div>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-2">
          <div className="text-white/40">Gain potentiel</div>
          <div className="text-neon-gold font-bold mt-0.5">{formatCurrency(Math.floor(wager * firstMultiplier))}</div>
        </div>
      </div>
    </div>
  );
}
