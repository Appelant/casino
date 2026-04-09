/**
 * Affichage des 3 rouleaux — animation défilement vertical style casino
 *
 * Mécanique identique au prototype HTML :
 *   - setInterval à 80 ms, déplacement top de −30 px par tick
 *   - Rouleau 1 s'arrête après 26 ticks (~2 080 ms)
 *   - Rouleau 2 s'arrête après 36 ticks (~2 880 ms)
 *   - Rouleau 3 s'arrête après 46 ticks (~3 680 ms)
 * Le symbole final (connu dès le lancement) s'affiche à l'arrêt du rouleau.
 */

import { useRef, useEffect, useState } from 'react';
import type { SlotSymbol, ReelResult } from '@/types';
import { SYMBOL_CONFIG } from '../utils/slotsConstants';
import { secureRandomInt } from '@/utils/rng/rng';

// ── Constantes d'animation ────────────────────────────────────────────────────

const SYMBOL_HEIGHT_PX = 120;
const TICK_INTERVAL_MS = 80;
const TICK_SPEED_PX = 30;
const SYMBOLS_COUNT = 20;
const BASE_TICKS = 25;       // rouleau 0 s'arrête au-delà de ce seuil
const EXTRA_TICKS_PER_REEL = 10; // chaque rouleau suivant tourne 10 ticks de plus

const ALL_SYMBOLS: SlotSymbol[] = ['seven', 'bar', 'diamond', 'bell', 'cherry', 'lemon'];

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function generateSymbols(): SlotSymbol[] {
  return Array.from({ length: SYMBOLS_COUNT }, () =>
    ALL_SYMBOLS[secureRandomInt(0, ALL_SYMBOLS.length - 1)]
  );
}

// ── Rouleau individuel ────────────────────────────────────────────────────────

interface ReelProps {
  reelIndex: number;
  isSpinning: boolean;
  finalSymbol: SlotSymbol | null;
}

function Reel({ reelIndex, isSpinning, finalSymbol }: ReelProps) {
  const reelRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showFinal, setShowFinal] = useState(false);
  const [everSpun, setEverSpun] = useState(false);

  // Lance l'animation quand isSpinning passe à true
  useEffect(() => {
    if (!isSpinning) return;

    setShowFinal(false);
    setEverSpun(true);

    // Reduced motion : afficher directement le symbole final sans animation
    if (prefersReducedMotion) {
      const delay = reelIndex * 150;
      const t = setTimeout(() => setShowFinal(true), delay);
      return () => clearTimeout(t);
    }

    const reelEl = reelRef.current;
    if (!reelEl) return;

    // Remplir le rouleau avec 20 symboles aléatoires (style HTML original)
    reelEl.innerHTML = '';
    generateSymbols().forEach((symbol) => {
      const config = SYMBOL_CONFIG[symbol];
      const div = document.createElement('div');
      div.style.cssText = [
        `height:${SYMBOL_HEIGHT_PX}px`,
        `line-height:${SYMBOL_HEIGHT_PX}px`,
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'font-size:3.5rem',
        'font-weight:bold',
        'color:#111',
      ].join(';');
      div.textContent = config.display;
      reelEl.appendChild(div);
    });
    reelEl.style.top = '0px';

    let position = 0;
    let ticks = 0;
    const maxTicks = BASE_TICKS + reelIndex * EXTRA_TICKS_PER_REEL;

    intervalRef.current = setInterval(() => {
      position -= TICK_SPEED_PX;
      reelEl.style.top = `${position}px`;
      ticks += 1;

      if (ticks > maxTicks) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setShowFinal(true);
      }
    }, TICK_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isSpinning, reelIndex]);

  // Réinitialisation au retour à idle
  useEffect(() => {
    if (!isSpinning && !finalSymbol) {
      setShowFinal(false);
    }
  }, [isSpinning, finalSymbol]);

  const renderFinalSymbol = () => {
    if (!finalSymbol) return <span style={{ fontSize: '3.5rem', color: '#888' }}>?</span>;
    const config = SYMBOL_CONFIG[finalSymbol];
    return (
      <span
        className={`font-bold ${config.color}`}
        style={{
          fontSize: '3.5rem',
          filter: 'drop-shadow(0 0 10px currentColor)',
        }}
      >
        {config.display}
      </span>
    );
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl border-4 border-neon-gold bg-white shadow-[0_0_20px_rgba(245,158,11,0.8)]"
      style={{ width: '120px', height: '120px' }}
    >
      {/* Bande défilante (DOM direct, style HTML original) */}
      <div
        ref={reelRef}
        className="absolute w-full"
        style={{
          top: '0px',
          visibility: showFinal ? 'hidden' : 'visible',
        }}
      />

      {/* Placeholder avant le premier spin */}
      {!everSpun && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ fontSize: '3.5rem', color: '#ccc' }}>?</span>
        </div>
      )}

      {/* Symbole final après arrêt du rouleau */}
      {showFinal && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          {renderFinalSymbol()}
        </div>
      )}

      {/* Reflet discret */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10" />
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

interface ReelDisplayProps {
  isSpinning: boolean;
  targetReels: ReelResult | null;
}

export function ReelDisplay({ isSpinning, targetReels }: ReelDisplayProps) {
  return (
    <div className="flex justify-center gap-5">
      <Reel reelIndex={0} isSpinning={isSpinning} finalSymbol={targetReels?.[0] ?? null} />
      <Reel reelIndex={1} isSpinning={isSpinning} finalSymbol={targetReels?.[1] ?? null} />
      <Reel reelIndex={2} isSpinning={isSpinning} finalSymbol={targetReels?.[2] ?? null} />
    </div>
  );
}
