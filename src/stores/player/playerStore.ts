/**
 * playerStore — vue minimale du joueur connecté.
 *
 * Source de vérité = authStore.currentUser (synchronisé en DB).
 * Ce store expose une API stable (placeBet/receiveWin/balance/username)
 * pour que les engines de jeu n'aient pas à connaître le système d'auth.
 */

import { create } from 'zustand';
import type { PlayerStore } from '@/types';
import { useAuthStore } from '@/stores/auth/authStore';
import { usersRepo } from '@/db/users.repo';

export const usePlayerStore = create<PlayerStore>(() => ({
  // Ces valeurs sont des stubs — elles sont sourced via useAuthStore via subscribe.
  balance: 0,
  username: 'Invité',
  avatar: 'default',
  hasPendingBet: false,

  placeBet: (amount: number) => {
    const user = useAuthStore.getState().currentUser;
    if (!user) return false;
    if (user.balance < amount) return false;
    // Mise à jour locale instantanée — recordRound synce avec le serveur en fin de round
    useAuthStore.setState((s) => ({
      currentUser: s.currentUser ? { ...s.currentUser, balance: s.currentUser.balance - amount } : null,
    }));
    usePlayerStore.setState({ hasPendingBet: true });
    return true;
  },

  receiveWin: (amount: number) => {
    const user = useAuthStore.getState().currentUser;
    if (!user) return;
    // Mise à jour locale instantanée — recordRound synce avec le serveur en fin de round
    useAuthStore.setState((s) => ({
      currentUser: s.currentUser ? { ...s.currentUser, balance: s.currentUser.balance + amount } : null,
    }));
  },

  lose: (amount: number) => {
    const user = useAuthStore.getState().currentUser;
    if (!user) return;
    useAuthStore.setState((s) => ({
      currentUser: s.currentUser
        ? { ...s.currentUser, balance: Math.max(0, s.currentUser.balance - amount) }
        : null,
    }));
  },

  setUsername: (username: string) => {
    const user = useAuthStore.getState().currentUser;
    if (!user) return;
    const updated = usersRepo.update(user.id, { username });
    if (updated) {
      // refresh authStore
      useAuthStore.setState({ currentUser: updated });
    }
  },

  setAvatar: (_avatar: string) => {
    // Avatars non implémentés en DB — no-op pour compat.
  },

  /**
   * @deprecated Le reset est désactivé : la progression est permanente.
   * Conservé pour compat avec le type PlayerStore.
   */
  resetBalance: () => {
    // Intentionnellement vide — la progression ELO/argent est permanente.
  },
}));

// ============================================
// Sync : authStore.currentUser → playerStore
// ============================================

// Suit le totalGames vu en dernier pour détecter la fin d'un round
let _lastSeenTotalGames = 0;

const syncFromAuth = (): void => {
  const user = useAuthStore.getState().currentUser;
  if (user) {
    const roundJustSettled = user.totalGames > _lastSeenTotalGames;
    _lastSeenTotalGames = user.totalGames;
    usePlayerStore.setState({
      balance: user.balance,
      username: user.username,
      avatar: 'default',
      ...(roundJustSettled ? { hasPendingBet: false } : {}),
    });
  } else {
    _lastSeenTotalGames = 0;
    usePlayerStore.setState({ balance: 0, username: 'Invité', avatar: 'default', hasPendingBet: false });
  }
};

// Sync initial + à chaque changement de currentUser
syncFromAuth();
useAuthStore.subscribe(syncFromAuth);
