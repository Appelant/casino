import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth/authStore';
import { LoginModal } from './LoginModal';

/**
 * AuthGate — bloque l'app derrière le LoginModal tant que l'utilisateur
 * n'est pas authentifié. Hydrate la session au montage.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <>
      {isAuthenticated && children}
      {!isAuthenticated && <LoginModal />}
    </>
  );
}
