import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { usePlayerStore } from '@/stores';
import { useUIStore } from '@/stores';
import { CurrencyDisplay } from '@/components/ui/CurrencyDisplay';
import { NeonButton } from '@/components/ui/NeonButton';
import { slideDown } from '@/config/animations.config';

/**
 * Composant Header — barre de navigation supérieure
 *
 * Contains:
 * - Logo ZVC
 * - Solde du joueur (animé)
 * - Bouton son
 * - Bouton menu mobile
 */
export function Header() {
  const balance = usePlayerStore((state) => state.balance);
  const soundEnabled = useUIStore((state) => state.soundEnabled);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const toggleSound = useUIStore((state) => state.toggleSound);

  return (
    <motion.header
      variants={slideDown}
      initial="hidden"
      animate="visible"
      className={clsx(
        'sticky top-0 z-[100]',
        'backdrop-blur-md bg-casino-dark/80 border-b border-white/10',
        'shadow-lg'
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Mobile menu + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo */}
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center">
              <span className="text-white font-bold text-sm">ZVC</span>
            </div>
            <span className="hidden sm:block text-lg font-bold text-white">
              ZéroVirguleChance
            </span>
          </motion.div>
        </div>

        {/* Right: Balance + Sound + Reset */}
        <div className="flex items-center gap-3">
          {/* Balance */}
          <div className={clsx(
            'px-4 py-2 rounded-lg',
            'bg-white/5 border border-white/10',
            'backdrop-blur-sm'
          )}>
            <CurrencyDisplay amount={balance} size="md" />
          </div>

          {/* Reset balance button */}
          <NeonButton
            variant="cyan"
            size="sm"
            onClick={() => usePlayerStore.getState().resetBalance()}
            aria-label="Réinitialiser le solde à 10 000 ZVC$"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </NeonButton>

          {/* Sound toggle */}
          <NeonButton
            variant="ghost"
            size="sm"
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Couper le son' : 'Activer le son'}
          >
            {soundEnabled ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </NeonButton>
        </div>
      </div>
    </motion.header>
  );
}
