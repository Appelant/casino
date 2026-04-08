import { useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Modal } from '@/components/ui/Modal';
import { NeonButton } from '@/components/ui/NeonButton';
import { usePlayerStore } from '@/stores/player/playerStore';
import { fadeIn } from '@/config/animations.config';

export interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modale pour changer le pseudo utilisateur
 */
export function UsernameModal({ isOpen, onClose }: UsernameModalProps) {
  const currentUsername = usePlayerStore((s) => s.username);
  const setUsername = usePlayerStore((s) => s.setUsername);
  const [newUsername, setNewUsername] = useState(currentUsername);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmed = newUsername.trim();

    if (!trimmed) {
      setError('Le pseudo ne peut pas être vide');
      return;
    }

    if (trimmed.length < 3) {
      setError('Le pseudo doit contenir au moins 3 caractères');
      return;
    }

    if (trimmed.length > 20) {
      setError('Le pseudo ne peut pas dépasser 20 caractères');
      return;
    }

    // Validé
    setUsername(trimmed);
    setError('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Changer de pseudo">
      <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-4">
        <div>
          <label className="block text-sm text-white/70 mb-2">
            Nouveau pseudo
          </label>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => {
              setNewUsername(e.target.value);
              setError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="Entrez votre pseudo"
            className={clsx(
              'w-full px-4 py-3 rounded-lg',
              'bg-white/5 border-2',
              error ? 'border-neon-red/50' : 'border-white/10',
              'text-white placeholder-white/30',
              'focus:outline-none focus:border-neon-purple/50',
              'transition-colors'
            )}
            autoFocus
          />
          {error && (
            <p className="mt-2 text-sm text-neon-red">{error}</p>
          )}
          <p className="mt-2 text-xs text-white/40">
            3-20 caractères. Votre pseudo est stocké localement et ne sert qu'à filtrer vos statistiques.
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <NeonButton
            variant="ghost"
            size="md"
            onClick={onClose}
            className="flex-1"
          >
            Annuler
          </NeonButton>
          <NeonButton
            variant="purple"
            size="md"
            onClick={handleSubmit}
            className="flex-1"
          >
            Valider
          </NeonButton>
        </div>
      </motion.div>
    </Modal>
  );
}
