import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { CasinoLayout } from '@/components/layout';
import { GameLobby } from '@/components/layout';
import { RouletteTable } from '@/features/roulette';
import { BlackjackTable } from '@/features/blackjack';
import { ToastContainer } from '@/components/ui';
import { StatsPanel } from '@/components/stats/StatsPanel';
import { HistoryPanel } from '@/components/stats/HistoryPanel';

/**
 * Routes wrappées dans AnimatePresence keyé sur location.
 * Doit être un enfant de BrowserRouter pour accéder à useLocation().
 */
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<GameLobby />} />
        <Route path="/roulette" element={<RouletteTable />} />
        <Route path="/blackjack" element={<BlackjackTable />} />
        <Route path="/stats" element={<StatsPanel />} />
        <Route path="/history" element={<HistoryPanel />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

/**
 * Composant principal App — routing et layout
 */
export function App() {
  return (
    <BrowserRouter>
      <CasinoLayout>
        <AnimatedRoutes />
      </CasinoLayout>
      <ToastContainer />
    </BrowserRouter>
  );
}
