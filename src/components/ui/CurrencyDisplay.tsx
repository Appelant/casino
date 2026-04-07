import { clsx } from 'clsx';
import { formatCurrency } from '@/utils/currency';
import { useCountUp } from '@/hooks/useCountUp';

export interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  animated?: boolean;
  showSign?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Composant CurrencyDisplay — affichage du solde animé
 *
 * Features:
 * - Formatage ZVC$ automatique
 * - Animation count-up optionnelle
 * - Affichage avec signe +/- optionnel
 */
export function CurrencyDisplay({
  amount,
  className,
  animated = true,
  showSign = false,
  size = 'md',
}: CurrencyDisplayProps) {
  const formatted = formatCurrency(amount);
  const displayValue = showSign
    ? (amount >= 0 ? '+' : '-') + formatted
    : formatted;

  const { value } = useCountUp(amount, {
    enabled: animated,
    duration: 0.5,
  });

  const animatedValue = formatCurrency(Math.round(value));

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl font-bold',
  };

  return (
    <span
      className={clsx(
        'font-mono',
        sizeClasses[size],
        amount >= 0 ? 'text-neon-green' : 'text-neon-red',
        className
      )}
    >
      {animated ? animatedValue : displayValue}
    </span>
  );
}

/**
 * Version statique (sans animation) pour les toasts et overlays
 */
export function CurrencyStatic({
  amount,
  className,
  showSign = false,
}: { amount: number; className?: string; showSign?: boolean }) {
  const formatted = formatCurrency(amount);
  const displayValue = showSign
    ? (amount >= 0 ? '+' : '-') + formatted
    : formatted;

  return (
    <span
      className={clsx(
        'font-mono',
        amount >= 0 ? 'text-neon-green' : 'text-neon-red',
        className
      )}
    >
      {displayValue}
    </span>
  );
}
