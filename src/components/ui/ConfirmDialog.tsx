import { useState } from 'react';
import { Modal } from './Modal';
import { NeonButton } from './NeonButton';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

/**
 * Composant ConfirmDialog — demande de confirmation
 *
 * Usage typique:
 * - Reset du solde
 * - Quitter une partie en cours
 * - Effacer l'historique
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
      onClose();
    }
  };

  const variantColors = {
    danger: 'red',
    warning: 'gold',
    info: 'cyan',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      showCloseButton={true}
    >
      <div className="space-y-6">
        <p className="text-white/80">{message}</p>

        <div className="flex justify-end gap-3">
          <NeonButton
            variant="ghost"
            onClick={onClose}
            disabled={isConfirming}
          >
            {cancelLabel}
          </NeonButton>
          <NeonButton
            variant={variantColors[variant] as 'purple' | 'cyan' | 'gold'}
            onClick={handleConfirm}
            loading={isConfirming}
          >
            {confirmLabel}
          </NeonButton>
        </div>
      </div>
    </Modal>
  );
}
