import { clsx } from 'clsx';
import { useEffect, useCallback, useRef } from 'react';
import type { RouletteColor } from '@/types';
import { WHEEL_ORDER, getNumberColor } from '../utils/rouletteNumbers';
import { POCKET_ANGLE, OUTER_RADIUS, INNER_RADIUS, CENTER_RADIUS, createArc } from '../utils/wheelGeometry';

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
 * Composant RouletteWheel — roue SVG animée avec bille
 *
 * Features:
 * - 37 cases européennes (0-36)
 * - Animation de rotation avec décélération physique
 * - Bille qui tourne en sens inverse
 * - Respect prefers-reduced-motion
 */
export function RouletteWheel({
  isSpinning,
  targetNumber,
  onSpinComplete,
  className,
}: RouletteWheelProps) {
  const wheelRef = useRef<SVGGElement>(null);
  const ballRef = useRef<SVGCircleElement>(null);
  const animationRef = useRef<number | null>(null);
  const currentRotationRef = useRef(0);

  // Refs pour la position de la bille - évite les problèmes de setState dans rAF en production
  const ballXRef = useRef(200);
  const ballYRef = useRef(25);
  const ballRadiusRef = useRef(178);
  const ballAngleRef = useRef(0);

  // Callback pour la fin d'animation
  const handleAnimationComplete = useCallback(() => {
    if (targetNumber !== null) {
      onSpinComplete(targetNumber);
    }
  }, [targetNumber, onSpinComplete]);

  useEffect(() => {
    if (!isSpinning || targetNumber === null) return;

    // Vérifications robustes pour la production
    const wheel = wheelRef.current;
    const ball = ballRef.current;

    if (!wheel) {
      console.error('[RouletteWheel] Wheel ref not ready');
      return;
    }

    if (!ball) {
      console.error('[RouletteWheel] Ball ref not ready');
      return;
    }

    // S'assurer que l'élément ball a les méthodes nécessaires
    if (typeof ball.setAttribute !== 'function') {
      console.error('[RouletteWheel] Ball element does not have setAttribute');
      return;
    }

    // Trouver la position du numéro gagnant sur la roue
    const targetIndex = WHEEL_ORDER.indexOf(targetNumber as never);

    // ============================================
    // === PARAMÈTRES PHYSIQUES ===================
    // ============================================
    const PHYSICS = {
      wheelInitialSpeed: 25,
      wheelFriction: 0.997,
      ballInitialSpeed: -60,
      outerFriction: 0.992,
      outerTrackRadius: 178,
      descentSpeedThreshold: 8,
      descentSpeed: 0.03,
      velocityRetentionOnDrop: 0.7,
      innerFriction: 0.985,
      innerOrbitRadius: 158,
      chaosFactor: 0.4,
      bounceDeflector: 0.25,
      pocketBounceRadius: 152,
      pocketCaptureThreshold: 1.5,
      pocketFriction: 0.92,
      targetDuration: 10000,
    };

    // ============================================
    // === ÉTAT DE L'ANIMATION (refs pour persister entre frames)
    // ============================================
    const startTime = performance.now();
    const startRotation = currentRotationRef.current;

    // État de la roue (via refs pour persister entre les frames)
    const wheelState = {
      angle: startRotation,
      velocity: PHYSICS.wheelInitialSpeed,
    };

    // État de la bille
    const ballState = {
      angle: 0,
      velocity: PHYSICS.ballInitialSpeed,
      radius: PHYSICS.outerTrackRadius,
      phase: 'OUTER_RIM_SPIN' as 'OUTER_RIM_SPIN' | 'DESCENT' | 'INNER_ORBIT' | 'POCKET_BOUNCE' | 'CAPTURE',
      bounceCount: 0,
    };

    // ============================================
    // === CALCUL DE LA CIBLE FINALE =============
    // ============================================
    const winningNumberAngleOnWheel = targetIndex * POCKET_ANGLE;
    const rotationToAlignTop = (360 - (winningNumberAngleOnWheel % 360)) % 360;
    const finalWheelRotation = startRotation + 5 * 360 + rotationToAlignTop;
    const finalRelativeBallAngle = winningNumberAngleOnWheel + POCKET_ANGLE / 2;

    // ============================================
    // === UTILITAIRES ===========================
    // ============================================
    const seededRandom = (seed: number): number => {
      const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
      return x - Math.floor(x);
    };

    const applyDeflectorBounce = (velocity: number, timeSeed: number): number => {
      const relativeAngle = (ballState.angle - wheelState.angle) % 360;
      const normalizedAngle = relativeAngle < 0 ? relativeAngle + 360 : relativeAngle;
      const pocketAngle = normalizedAngle % POCKET_ANGLE;
      const isNearDeflector = pocketAngle < 3 || pocketAngle > (POCKET_ANGLE - 3);

      if (isNearDeflector) {
        const bounceDirection = seededRandom(timeSeed) > 0.5 ? 1 : -1;
        return velocity * (1 - PHYSICS.bounceDeflector) + bounceDirection * PHYSICS.bounceDeflector * Math.abs(velocity);
      }
      return velocity;
    };

    // Mise à jour directe du DOM SVG avec vérifications robustes
    const updateBallPosition = (radius: number, angle: number) => {
      const ballAngleRad = ((angle - 90) * Math.PI) / 180;
      const ballX = 200 + radius * Math.cos(ballAngleRad);
      const ballY = 200 + radius * Math.sin(ballAngleRad);

      ballXRef.current = ballX;
      ballYRef.current = ballY;
      ballRadiusRef.current = radius;
      ballAngleRef.current = angle;

      // Mise à jour DOM avec vérification robuste
      const ballElement = ballRef.current;
      if (ballElement && typeof ballElement.setAttribute === 'function') {
        try {
          ballElement.setAttribute('cx', String(ballX));
          ballElement.setAttribute('cy', String(ballY));
        } catch (e) {
          // En cas d'erreur, on utilise property assignment
          ballElement.cx.baseVal.value = ballX;
          ballElement.cy.baseVal.value = ballY;
        }
      }
    };

    // ============================================
    // === BOUCLE D'ANIMATION ====================
    // ============================================
    const animate = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const elapsedSeconds = elapsed / 1000;
      const timeSeed = elapsed * 0.001;

      // 1. MISE À JOUR DE LA ROUE
      wheelState.velocity *= PHYSICS.wheelFriction;
      wheelState.angle += wheelState.velocity;

      // 2. MACHINE D'ÉTATS DE LA BILLE
      switch (ballState.phase) {
        case 'OUTER_RIM_SPIN':
          ballState.velocity *= PHYSICS.outerFriction;
          ballState.angle += ballState.velocity;
          if (Math.abs(ballState.velocity) < PHYSICS.descentSpeedThreshold) {
            ballState.phase = 'DESCENT';
            ballState.velocity *= PHYSICS.velocityRetentionOnDrop;
          }
          break;

        case 'DESCENT':
          ballState.velocity *= PHYSICS.outerFriction;
          ballState.angle += ballState.velocity;
          ballState.radius += (PHYSICS.innerOrbitRadius - ballState.radius) * PHYSICS.descentSpeed;
          if (ballState.radius <= PHYSICS.innerOrbitRadius + 1) {
            ballState.phase = 'INNER_ORBIT';
            ballState.radius = PHYSICS.innerOrbitRadius;
          }
          break;

        case 'INNER_ORBIT':
          ballState.velocity *= PHYSICS.innerFriction;
          ballState.velocity = applyDeflectorBounce(ballState.velocity, timeSeed);
          const chaos = (seededRandom(timeSeed * 17) - 0.5) * PHYSICS.chaosFactor * Math.abs(ballState.velocity);
          ballState.angle += ballState.velocity + chaos;
          ballState.radius = PHYSICS.innerOrbitRadius + Math.sin(elapsedSeconds * 20) * 1.5;
          if (Math.abs(ballState.velocity) < PHYSICS.pocketCaptureThreshold * 3) {
            ballState.phase = 'POCKET_BOUNCE';
            ballState.radius = PHYSICS.pocketBounceRadius;
          }
          break;

        case 'POCKET_BOUNCE':
          ballState.velocity *= PHYSICS.pocketFriction;
          const pocketBounce = (seededRandom(timeSeed * 23) - 0.5) * 2;
          ballState.angle += ballState.velocity + pocketBounce;
          ballState.bounceCount++;
          ballState.radius = PHYSICS.pocketBounceRadius + Math.sin(elapsedSeconds * 30) * 0.5;
          if (Math.abs(ballState.velocity) < PHYSICS.pocketCaptureThreshold || ballState.bounceCount >= 8) {
            ballState.phase = 'CAPTURE';
          }
          break;

        case 'CAPTURE':
          let relativeBallAngle = (ballState.angle - wheelState.angle) % 360;
          if (relativeBallAngle < 0) relativeBallAngle += 360;

          const targetRelativeAngle = finalRelativeBallAngle;
          let angleDiff = targetRelativeAngle - relativeBallAngle;
          if (angleDiff > 180) angleDiff -= 360;
          if (angleDiff < -180) angleDiff += 360;

          ballState.angle = wheelState.angle + relativeBallAngle + angleDiff * 0.15;
          ballState.velocity *= 0.7;
          ballState.radius = PHYSICS.pocketBounceRadius;

          if (Math.abs(ballState.velocity) < 0.05 && Math.abs(angleDiff) < 0.5) {
            // Positions finales
            wheelState.angle = finalWheelRotation;
            ballState.angle = wheelState.angle + finalRelativeBallAngle;
            ballState.radius = PHYSICS.pocketBounceRadius;

            wheel.style.transform = `rotate(${wheelState.angle}deg)`;
            updateBallPosition(ballState.radius, ballState.angle);

            handleAnimationComplete();
            return;
          }
          break;
      }

      // 3. RENDU - Mise à jour de la position de la bille via React state
      wheel.style.transform = `rotate(${wheelState.angle}deg)`;
      updateBallPosition(ballState.radius, ballState.angle);

      // 4. TIMEOUT DE SÉCURITÉ
      if (elapsed > 14000) {
        wheelState.angle = finalWheelRotation;
        wheel.style.transform = `rotate(${wheelState.angle}deg)`;

        ballState.angle = wheelState.angle + finalRelativeBallAngle;
        ballState.radius = PHYSICS.pocketBounceRadius;
        updateBallPosition(ballState.radius, ballState.angle);

        handleAnimationComplete();
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Démarrer l'animation
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
          className="absolute inset-4 rounded-full"
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

              {/* Ball gradient */}
              <radialGradient id="ballGradient">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#f0f0f0" />
                <stop offset="100%" stopColor="#9ca3af" />
              </radialGradient>
            </defs>
          </g>

          {/* Ball - rendered AFTER the wheel so it appears on top */}
          <circle
            ref={ballRef}
            cx="200"
            cy="25"
            r="6"
            fill="url(#ballGradient)"
            className="drop-shadow-lg"
          />
        </svg>

      </div>
    </div>
  );
}
