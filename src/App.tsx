import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { CasinoLayout } from '@/components/layout';
import { GameLobby } from '@/components/layout';
import { RouletteTable } from '@/features/roulette';
import { BlackjackTable } from '@/features/blackjack';
import { ToastContainer } from '@/components/ui';

/**
 * Page Stats — statistiques du joueur
 */
function StatsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Statistiques</h1>
      <div className="text-white/60">
        <p>En cours de développement...</p>
      </div>
    </div>
  );
}

/**
 * Page History — historique des rounds
 */
function HistoryPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Historique</h1>
      <div className="text-white/60">
        <p>En cours de développement...</p>
      </div>
    </div>
  );
}

/**
 * Composant principal App — routing et layout
 */
export function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <CasinoLayout>
          <Routes>
            {/* Lobby */}
            <Route path="/" element={<GameLobby />} />

            {/* Roulette */}
            <Route path="/roulette" element={<RouletteTable />} />

            {/* Blackjack */}
            <Route path="/blackjack" element={<BlackjackTable />} />

            {/* Stats & History */}
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/history" element={<HistoryPage />} />

            {/* Redirect inconnues vers lobby */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CasinoLayout>
      </AnimatePresence>

      {/* Toast container global */}
      <ToastContainer />
    </BrowserRouter>
  );
}
