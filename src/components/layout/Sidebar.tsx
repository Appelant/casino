import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useUIStore } from '@/stores';
import { slideLeft } from '@/config/animations.config';

export interface SidebarProps {
  activeGame?: 'roulette' | 'blackjack' | 'dice' | 'lobby';
}

/**
 * Composant Sidebar — navigation latérale
 *
 * Contains:
 * - Navigation vers les jeux (Lobby, Roulette, Blackjack)
 * - Accès rapide aux stats
 * - Accès à l'historique
 */
export function Sidebar({}: SidebarProps) {
  const location = useLocation();
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const closeSidebar = () => useUIStore.getState().toggleSidebar();

  const navItems = [
    {
      label: 'Lobby',
      href: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: 'Roulette',
      href: '/roulette',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    {
      label: 'Blackjack',
      href: '/blackjack',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      label: 'Dés',
      href: '/dice',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      label: 'Classement',
      href: '/leaderboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v18h14V3H5zm4 14H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V7h2v2zm8 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" />
        </svg>
      ),
    },
    {
      label: 'Statistiques',
      href: '/stats',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v13a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      label: 'Historique',
      href: '/history',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        variants={slideLeft}
        initial="hidden"
        animate="visible"
        className={clsx(
          'hidden lg:flex flex-col',
          'w-64 bg-casino-surface border-r border-white/10',
          'overflow-y-auto'
        )}
      >
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg',
                'transition-all duration-200',
                isActive(item.href)
                  ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-white/40 text-center">
            ZéroVirguleChance v0.1
          </div>
        </div>
      </motion.aside>

      {/* Mobile Sidebar (slide-in) */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: isSidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className={clsx(
          'fixed top-0 left-0 z-[150] lg:hidden',
          'w-72 h-full',
          'bg-casino-surface border-r border-white/10',
          'overflow-y-auto'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="font-bold text-white">Menu</span>
          <button
            onClick={() => useUIStore.getState().toggleSidebar()}
            className="p-2 rounded-lg hover:bg-white/10"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={closeSidebar}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg',
                'transition-all duration-200',
                isActive(item.href)
                  ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </motion.div>
    </>
  );
}
