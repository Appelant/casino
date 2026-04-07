import { clsx } from 'clsx';
import { useEffect, useCallback, useRef } from 'react';
import type { RouletteColor } from '@/types';
import { WHEEL_ORDER, getNumberColor } from '../utils/rouletteNumbers';
import { POCKET_ANGLE, OUTER_RADIUS, INNER_RADIUS, CENTER_RADIUS, createArc } from '../utils/wheelGeometry';
import { prefersReducedMotion } from '@/config/animations.config';

export interface RouletteWheelProps {
  isSpinning: boolean;
  targetNumber: number | null;
  onSpinComplete: (number: number) => void;
  className?: string;
}

const COLOR_MAP: Record<RouletteColor, string> = {
  red: '#DC2626',
  black: '#1F1F1F',
  green: '#16A34A',
};

/**
 * Composant RouletteWheel — roue SVG animée
 *
 * Features:
 * - 37 cases européennes (0-36)
 * - Animation de rotation avec décélération physique
 * - Respect prefers-reduced-motion
 */
export function RouletteWheel({
  isSpinning,
  targetNumber,
  onSpinComplete,
  className,
}: RouletteWheelProps) {
  const wheelRef = useRef<SVGGElement>(null);
  const animationRef = useRef<number | null>(null);
  const currentRotationRef = useRef(0);

  // Callback pour la fin d'animation
  const handleAnimationComplete = useCallback((_finalRotation: number) => {
    if (targetNumber !== null) {
      onSpinComplete(targetNumber);
    }
  }, [targetNumber, onSpinComplete]);

  useEffect(() => {
    if (!isSpinning || targetNumber === null) return;

    const wheel = wheelRef.current;
    if (!wheel) return;

    const useReducedMotion = prefersReducedMotion();

    // Calculer la rotation finale pour amener le numéro gagnant en haut
    const targetIndex = WHEEL_ORDER.indexOf(targetNumber as never);
    const targetAngle = targetIndex * POCKET_ANGLE;

    // Nombre de tours complets + angle cible
    const fullRotations = useReducedMotion ? 0 : 4;
    const finalRotation = currentRotationRef.current + (fullRotations * 360) + (targetAngle - (currentRotationRef.current % 360));

    // Animation avec décélération physique (ease-out)
    const duration = useReducedMotion ? 200 : 4500;
    const startTime = performance.now();
    const startRotation = currentRotationRef.current;

    const easeOutQuart = (t: number): number => {
      return 1 - Math.pow(1 - t, 4);
    };

    const animate = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);

      currentRotationRef.current = startRotation + (finalRotation - startRotation) * easedProgress;
      wheel.style.transform = `rotate(${currentRotationRef.current}deg)`;

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        handleAnimationComplete(finalRotation);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpinning, targetNumber, onSpinComplete, handleAnimationComplete]);

  return (
    <div className={clsx('relative', className)}>
      {/* Wheel container with shadow */}
      <div className="relative w-72 h-72 md:w-96 md:h-96">
        {/* Outer ring decoration */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 shadow-2xl" />

        {/* Wheel SVG */}
        <svg
          viewBox="0 0 400 400"
          className="absolute inset-4 rounded-full overflow-hidden"
        >
          <g ref={wheelRef} className="origin-center">
            {/* Pockets (numéros) */}
            {WHEEL_ORDER.map((number, index) => {
              const color = getNumberColor(number);
              const startAngle = index * POCKET_ANGLE;
              const endAngle = startAngle + POCKET_ANGLE;

              return (
                <path
                  key={number}
                  d={createArc(200, 200, OUTER_RADIUS, INNER_RADIUS, startAngle, endAngle)}
                  fill={COLOR_MAP[color]}
                  stroke="#C9A55B"
                  strokeWidth="1"
                />
              );
            })}

            {/* Inner decoration ring */}
            <circle
              cx="200"
              cy="200"
              r={INNER_RADIUS - 5}
              fill="none"
              stroke="#C9A55B"
              strokeWidth="2"
            />

            {/* Center decoration */}
            <circle
              cx="200"
              cy="200"
              r={CENTER_RADIUS}
              fill="url(#centerGradient)"
              stroke="#C9A55B"
              strokeWidth="3"
            />

            {/* Numbers */}
            {WHEEL_ORDER.map((number, index) => {
              const angle = index * POCKET_ANGLE + POCKET_ANGLE / 2;
              const radians = ((angle - 90) * Math.PI) / 180;
              const textRadius = (OUTER_RADIUS + INNER_RADIUS) / 2;
              const x = 200 + textRadius * Math.cos(radians);
              const y = 200 + textRadius * Math.sin(radians);

              return (
                <text
                  key={`num-${number}`}
                  x={x}
                  y={y}
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${angle}, ${x}, ${y})`}
                >
                  {number}
                </text>
              );
            })}

            {/* Gradient definition */}
            <defs>
              <radialGradient id="centerGradient">
                <stop offset="0%" stopColor="#C9A55B" />
                <stop offset="50%" stopColor="#8B6914" />
                <stop offset="100%" stopColor="#5C4712" />
              </radialGradient>
            </defs>
          </g>
        </svg>

        {/* Ball marker at top */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-white via-gray-100 to-gray-400 shadow-lg border-2 border-gray-300"
               style={{
                 boxShadow: '0 0 10px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.3)'
               }} />
        </div>
      </div>
    </div>
  );
}
