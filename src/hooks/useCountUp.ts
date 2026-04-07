/**
 * Hook pour l'animation de compteur numérique
 * Interpolation linéaire de A à B sur une durée donnée
 */

import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  enabled?: boolean;
  duration?: number; // en secondes
  easing?: 'linear' | 'easeOut' | 'easeInOut';
}

/**
 * Fonction d'easing
 */
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOut(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Hook pour animer un compteur de startValue à endValue
 *
 * @param endValue - Valeur finale à atteindre
 * @param options - Configuration de l'animation
 * @returns Objet avec value (valeur actuelle) et reset (pour redémarrer)
 */
export function useCountUp(
  endValue: number,
  options: UseCountUpOptions = {}
): { value: number; reset: () => void } {
  const {
    enabled = true,
    duration = 0.5,
    easing = 'easeOut',
  } = options;

  const [value, setValue] = useState(endValue);
  const startValueRef = useRef(endValue);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = (timestamp - startTimeRef.current) / 1000;
    const progress = Math.min(elapsed / duration, 1);

    // Appliquer l'easing
    let easedProgress: number;
    switch (easing) {
      case 'linear':
        easedProgress = progress;
        break;
      case 'easeOut':
        easedProgress = easeOut(progress);
        break;
      case 'easeInOut':
        easedProgress = easeInOut(progress);
        break;
    }

    // Interpolation linéaire
    const currentValue = startValueRef.current + (endValue - startValueRef.current) * easedProgress;
    setValue(currentValue);

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setValue(endValue);
      startValueRef.current = endValue;
    }
  };

  useEffect(() => {
    if (!enabled) {
      setValue(endValue);
      startValueRef.current = endValue;
      return;
    }

    // Démarrer l'animation
    startTimeRef.current = null;
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [endValue, enabled, duration, easing]);

  const reset = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setValue(startValueRef.current);
    startTimeRef.current = null;
  };

  return { value, reset };
}
