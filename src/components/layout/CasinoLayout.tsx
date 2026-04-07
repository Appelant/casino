import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useUIStore } from '@/stores';
import { fadeIn } from '@/config/animations.config';

export interface CasinoLayoutProps {
  children: ReactNode;
  activeGame?: 'roulette' | 'blackjack' | 'lobby';
}

/**
 * Layout principal du casino
 *
 * Structure:
 * - Header (logo, solde, navigation)
 * - Sidebar (navigation jeux, stats)
 * - Content (page actuelle)
 * - Disclaimer watermark (argent fictif)
 */
export function CasinoLayout({ children, activeGame }: CasinoLayoutProps) {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);

  return (
    <div className="min-h-screen bg-casino-dark flex flex-col">
      {/* Header */}
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar activeGame={activeGame} />

        {/* Mobile sidebar overlay */}
        {isSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-20"
            onClick={() => useUIStore.getState().toggleSidebar()}
          />
        )}

        {/* Main Content */}
        <motion.main
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className={clsx(
            'flex-1 overflow-auto',
            'transition-all duration-300',
            isSidebarOpen && 'lg:ml-0'
          )}
        >
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </motion.main>
      </div>

      {/* Disclaimer watermark — ARGENT FICTIF */}
      <div className="fictif-watermark">
        Argent fictif — Aucun gain réel
      </div>
    </div>
  );
}
