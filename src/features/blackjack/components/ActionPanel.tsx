import { motion } from 'framer-motion';
import { NeonButton } from '@/components/ui/NeonButton';
import { fadeIn, staggerItem } from '@/config/animations.config';

export interface ActionPanelProps {
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
  onSplit: () => void;
  canHit: boolean;
  canStand: boolean;
  canDouble: boolean;
  canSplit: boolean;
  disabled?: boolean;
}

/**
 * Composant ActionPanel — panneau d'actions du joueur
 *
 * Actions disponibles:
 * - Hit (Prendre une carte)
 * - Stand (Rester)
 * - Double (Doubler la mise)
 * - Split (Séparer la main)
 */
export function ActionPanel({
  onHit,
  onStand,
  onDouble,
  onSplit,
  canHit,
  canStand,
  canDouble,
  canSplit = false,
  disabled = false,
}: ActionPanelProps) {
  const hasAnyAction = canHit || canStand || canDouble || canSplit;

  if (!hasAnyAction || disabled) {
    return null;
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="flex justify-center gap-3 flex-wrap"
    >
      {/* Hit button */}
      {canHit && (
        <motion.div variants={staggerItem}>
          <NeonButton
            variant="purple"
            size="lg"
            onClick={onHit}
            disabled={disabled}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tirer
            </span>
          </NeonButton>
        </motion.div>
      )}

      {/* Stand button */}
      {canStand && (
        <motion.div variants={staggerItem}>
          <NeonButton
            variant="cyan"
            size="lg"
            onClick={onStand}
            disabled={disabled}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Rester
            </span>
          </NeonButton>
        </motion.div>
      )}

      {/* Double button */}
      {canDouble && (
        <motion.div variants={staggerItem}>
          <NeonButton
            variant="gold"
            size="lg"
            onClick={onDouble}
            disabled={disabled}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Doubler
            </span>
          </NeonButton>
        </motion.div>
      )}

      {/* Split button */}
      {canSplit && (
        <motion.div variants={staggerItem}>
          <NeonButton
            variant="cyan"
            size="lg"
            onClick={onSplit}
            disabled={disabled}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Split
            </span>
          </NeonButton>
        </motion.div>
      )}
    </motion.div>
  );
}
