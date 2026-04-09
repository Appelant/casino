/**
 * Panneau de mise — interface jetons style casino
 * Toutes les valeurs sont en centimes ZVC$ (1 ZVC$ = 100 centimes).
 */

import { clsx } from 'clsx';
import { formatCurrency } from '@/utils/currency';
import { GAME_CONFIG } from '@/config/game.config';
import type { SlotsStatus } from '../hooks/useSlotsEngine';
import { SLOTS_MIN_BET } from '../utils/slotsConstants';

// ── Configuration des jetons ──────────────────────────────────────────────────

interface ChipConfig {
  value: number;   // centimes
  label: string;   // affiché sur le jeton (ex: "1", "5K")
  color: string;
  glow: string;
  innerBg: string;
}

/** Formate la valeur du jeton en ZVC$ lisible court (sans "ZVC$") */
function chipLabel(centimes: number): string {
  const zvc = centimes / 100;
  if (zvc >= 1000) return `${zvc / 1000}K`;
  return String(zvc);
}

const CHIP_COLORS: ReadonlyArray<{ color: string; glow: string; innerBg: string }> = [
  { color: '#8b5cf6', glow: 'rgba(139,92,246,0.45)',  innerBg: 'rgba(139,92,246,0.14)'  },
  { color: '#22d3ee', glow: 'rgba(34,211,238,0.45)',  innerBg: 'rgba(34,211,238,0.14)'  },
  { color: '#f59e0b', glow: 'rgba(245,158,11,0.45)',  innerBg: 'rgba(245,158,11,0.14)'  },
  { color: '#ef4444', glow: 'rgba(239,68,68,0.45)',   innerBg: 'rgba(239,68,68,0.14)'   },
  { color: '#20c997', glow: 'rgba(32,201,151,0.45)',  innerBg: 'rgba(32,201,151,0.14)'  },
  { color: '#fb923c', glow: 'rgba(251,146,60,0.45)',  innerBg: 'rgba(251,146,60,0.14)'  },
  { color: '#e5e7eb', glow: 'rgba(229,231,235,0.45)', innerBg: 'rgba(229,231,235,0.14)' },
  { color: '#facc15', glow: 'rgba(250,204,21,0.45)',  innerBg: 'rgba(250,204,21,0.14)'  },
];

const CHIPS: ChipConfig[] = GAME_CONFIG.CHIP_VALUES.map((value, i) => ({
  value,
  label: chipLabel(value),
  ...CHIP_COLORS[i % CHIP_COLORS.length],
}));

// ── Props ─────────────────────────────────────────────────────────────────────

interface BetPanelProps {
  currentWager: number;   // centimes
  status: SlotsStatus;
  playerBalance: number;  // centimes
  onSetWager: (amount: number) => void;
}

// ── Composant ─────────────────────────────────────────────────────────────────

export function BetPanel({ currentWager, status, playerBalance, onSetWager }: BetPanelProps) {
  const canModifyBet = status === 'idle';

  const handleAllIn = () => {
    if (!canModifyBet) return;
    if (playerBalance >= SLOTS_MIN_BET) onSetWager(playerBalance);
  };

  return (
    <div
      className="rounded-[28px] border border-[rgba(180,120,35,0.35)] px-7 py-10"
      style={{
        background: 'radial-gradient(circle at top, rgba(24,29,53,0.95), rgba(7,8,15,1))',
        boxShadow: '0 0 80px rgba(0,0,0,0.45)',
      }}
    >
      {/* ── Grille de jetons ── */}
      <div className="flex flex-wrap justify-center gap-4 md:gap-6">
        {CHIPS.map((chip) => {
          const isActive = currentWager === chip.value;
          const isDisabled = !canModifyBet || chip.value > playerBalance;

          return (
            <button
              key={chip.value}
              onClick={() => !isDisabled && onSetWager(chip.value)}
              disabled={isDisabled}
              aria-label={`Mise de ${formatCurrency(chip.value)}`}
              className={clsx(
                'relative h-[86px] w-[86px] cursor-pointer rounded-full border-0 bg-transparent transition-transform duration-200',
                'md:h-[112px] md:w-[112px]',
                !isDisabled && 'hover:-translate-y-1',
                isDisabled && 'cursor-not-allowed opacity-40',
              )}
              style={{ filter: `drop-shadow(0 0 14px ${chip.glow})` }}
            >
              {/* Anneau extérieur */}
              <span
                className="pointer-events-none absolute inset-0 rounded-full border-4"
                style={{ borderColor: isActive ? '#ffffff' : chip.color }}
              />
              {/* Anneau intérieur (7 px inset) */}
              <span
                className="pointer-events-none absolute rounded-full border-4"
                style={{ inset: '7px', borderColor: chip.color, opacity: 0.95 }}
              />
              {/* Fond coloré (18 px inset) */}
              <span
                className="pointer-events-none absolute rounded-full border border-white/20"
                style={{ inset: '18px', background: chip.innerBg }}
              />
              {/* Label */}
              <span
                className="relative z-10 flex h-full w-full items-center justify-center text-2xl font-extrabold md:text-[28px]"
                style={{
                  color: chip.color,
                  textShadow: `0 0 12px ${chip.glow}`,
                }}
              >
                {chip.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── ALL IN ── */}
      <div className="mt-6 flex justify-center md:mt-[26px]">
        <button
          onClick={handleAllIn}
          disabled={!canModifyBet || playerBalance < SLOTS_MIN_BET}
          aria-label="Miser tout votre solde"
          className={clsx(
            'rounded-[20px] border border-[rgba(248,113,113,0.75)] px-8 py-4',
            'text-lg font-extrabold tracking-widest text-[#ff5a5a]',
            'bg-[rgba(69,10,10,0.45)] shadow-[0_0_30px_rgba(239,68,68,0.35)]',
            'transition-all duration-200 md:px-[34px] md:py-[18px] md:text-[22px]',
            canModifyBet && playerBalance >= SLOTS_MIN_BET
              ? 'cursor-pointer hover:scale-[1.02] hover:bg-[rgba(100,20,20,0.5)]'
              : 'cursor-not-allowed opacity-50',
          )}
        >
          🔴 ALL IN — {formatCurrency(playerBalance)}
        </button>
      </div>
    </div>
  );
}
