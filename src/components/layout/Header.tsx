import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { usePlayerStore } from '@/stores';
import { useUIStore } from '@/stores';
import { useAuthStore } from '@/stores/auth/authStore';
import { CurrencyDisplay } from '@/components/ui/CurrencyDisplay';
import { NeonButton } from '@/components/ui/NeonButton';
import { RankBadge } from '@/features/auth/components/RankBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { slideDown } from '@/config/animations.config';

/**
 * Header — barre supérieure : logo, rank, solde, son, déconnexion.
 *
 * NOTE : le bouton de reset solde a été supprimé. La progression est permanente.
 */
export function Header() {
  const balance = usePlayerStore((state) => state.balance);
  const username = usePlayerStore((state) => state.username);
  const elo = useAuthStore((s) => s.currentUser?.elo ?? 0);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const soundEnabled = useUIStore((state) => state.soundEnabled);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const toggleSound = useUIStore((state) => state.toggleSound);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        {/* Left: Mobile menu + Logo */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <motion.div className="flex items-center gap-2 min-w-0" whileHover={{ scale: 1.02 }}>
            <img
              src="/logo.png"
              alt="ZVC - ZéroVirguleChance"
              className="h-10 w-10 object-contain shrink-0"
            />
            <span className="hidden sm:block text-lg font-bold text-white truncate">
              ZéroVirguleChance
            </span>
          </motion.div>
        </div>

        {/* Right: Rank + Username + Balance + Sound + Logout */}
        {isAuthenticated && (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Rank badge */}
            <div className="hidden md:block">
              <RankBadge elo={elo} size="sm" />
            </div>

            {/* Username (lecture seule — définitif) */}
            <div className="hidden sm:flex items-center px-3 py-2 rounded-lg bg-neon-purple/10 border border-neon-purple/30">
              <span className="text-sm text-neon-purple font-semibold">@{username}</span>
            </div>

            {/* Balance */}
            <div className={clsx(
              'px-3 py-2 rounded-lg',
              'bg-white/5 border border-white/10',
              'backdrop-blur-sm'
            )}>
              <CurrencyDisplay amount={balance} size="md" />
            </div>

            {/* Sound */}
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

            {/* Logout */}
            <NeonButton
              variant="ghost"
              size="sm"
              onClick={() => setShowLogoutConfirm(true)}
              aria-label="Se déconnecter"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </NeonButton>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={logout}
        title="Se déconnecter ?"
        message="Votre progression est sauvegardée. Vous pourrez vous reconnecter à tout moment."
        confirmLabel="Déconnexion"
        variant="warning"
      />
    </motion.header>
  );
}
