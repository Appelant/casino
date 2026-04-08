import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { CasinoLayout } from '@/components/layout';
import { GameLobby } from '@/components/layout';
import { RouletteTable } from '@/features/roulette';
import { BlackjackTable } from '@/features/blackjack';
import { DiceTable } from '@/features/dice';
import { ToastContainer } from '@/components/ui';
import { StatsPanel } from '@/components/stats/StatsPanel';
import { HistoryPanel } from '@/components/stats/HistoryPanel';
import { Leaderboard } from '@/components/stats/Leaderboard';
import { AuthGate } from '@/features/auth/components/AuthGate';
import { initDatabase } from '@/db/database';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<GameLobby />} />
        <Route path="/roulette" element={<RouletteTable />} />
        <Route path="/blackjack" element={<BlackjackTable />} />
        <Route path="/dice" element={<DiceTable />} />
        <Route path="/stats" element={<StatsPanel />} />
        <Route path="/history" element={<HistoryPanel />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export function App() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <HashRouter>
      <AuthGate>
        <CasinoLayout>
          <AnimatedRoutes />
        </CasinoLayout>
      </AuthGate>
      <ToastContainer />
    </HashRouter>
  );
}
