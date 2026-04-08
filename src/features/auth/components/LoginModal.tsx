import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useAuthStore } from '@/stores/auth/authStore';

type Mode = 'login' | 'register';

/**
 * LoginModal — popup néon violet (DA ZVC) pour login + inscription.
 *
 * Affiché en plein écran tant que l'utilisateur n'est pas connecté.
 * Pas de bouton de fermeture : il faut s'authentifier pour entrer.
 */
export function LoginModal() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const clearError = useAuthStore((s) => s.clearError);

  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Reset les champs quand on bascule
  useEffect(() => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setLocalError(null);
    clearError();
  }, [mode, clearError]);

  if (isAuthenticated) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (mode === 'register' && password !== confirmPassword) {
      setLocalError('Les mots de passe ne correspondent pas');
      return;
    }

    const ok =
      mode === 'login'
        ? await login(username, password)
        : await register(username, password);

    if (!ok) return;
  };

  const displayError = localError ?? error;

  return (
    <AnimatePresence>
      <motion.div
        key="login-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[500] flex items-center justify-center bg-casino-dark/95 backdrop-blur-md p-4"
      >
        {/* Halos décoratifs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-neon-purple/20 blur-[120px]" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-neon-purple/15 blur-[120px]" />
        </div>

        <motion.div
          key="login-card"
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className={clsx(
            'relative w-full max-w-md rounded-2xl overflow-hidden',
            'bg-casino-surface/80 backdrop-blur-xl',
            'border border-neon-purple/40',
            'shadow-[0_0_60px_-10px_rgba(139,92,246,0.6)]'
          )}
        >
          {/* Bordure néon animée */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none">
            <div className="absolute inset-0 rounded-2xl border border-neon-purple/30" />
            <div className="absolute -inset-px rounded-2xl border border-neon-purple/20 blur-sm" />
          </div>

          <div className="relative p-8">
            {/* Logo + titre */}
            <div className="text-center mb-6">
              <motion.img
                src="/logo.png"
                alt="ZVC"
                className="w-20 h-20 mx-auto mb-3 drop-shadow-[0_0_20px_rgba(139,92,246,0.6)]"
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
              />
              <h1 className="text-2xl font-bold text-white">
                <span className="text-neon-purple">Zéro</span>VirguleChance
              </h1>
              <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">
                Casino • Argent fictif
              </p>
            </div>

            {/* Tabs */}
            <div className="flex bg-white/5 rounded-lg p-1 mb-6 border border-white/10">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={clsx(
                    'flex-1 py-2 rounded-md text-sm font-semibold transition-all',
                    mode === m
                      ? 'bg-neon-purple/20 text-neon-purple shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                      : 'text-white/50 hover:text-white/80'
                  )}
                >
                  {m === 'login' ? 'Connexion' : 'Inscription'}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-white/60 mb-1 uppercase tracking-wider">
                  Pseudo
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="Votre pseudo"
                  className={clsx(
                    'w-full px-4 py-3 rounded-lg',
                    'bg-white/5 border border-white/10',
                    'text-white placeholder-white/30',
                    'focus:outline-none focus:border-neon-purple/60',
                    'focus:shadow-[0_0_16px_rgba(139,92,246,0.3)]',
                    'transition-all'
                  )}
                />
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-1 uppercase tracking-wider">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  className={clsx(
                    'w-full px-4 py-3 rounded-lg',
                    'bg-white/5 border border-white/10',
                    'text-white placeholder-white/30',
                    'focus:outline-none focus:border-neon-purple/60',
                    'focus:shadow-[0_0_16px_rgba(139,92,246,0.3)]',
                    'transition-all'
                  )}
                />
              </div>

              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-xs text-white/60 mb-1 uppercase tracking-wider">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={clsx(
                      'w-full px-4 py-3 rounded-lg',
                      'bg-white/5 border border-white/10',
                      'text-white placeholder-white/30',
                      'focus:outline-none focus:border-neon-purple/60',
                      'focus:shadow-[0_0_16px_rgba(139,92,246,0.3)]',
                      'transition-all'
                    )}
                  />
                </motion.div>
              )}

              {/* Erreur */}
              <AnimatePresence>
                {displayError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="px-3 py-2 rounded-lg bg-neon-red/10 border border-neon-red/30 text-sm text-neon-red"
                  >
                    {displayError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className={clsx(
                  'w-full py-3 rounded-lg font-bold uppercase tracking-wider text-sm',
                  'bg-gradient-to-r from-neon-purple to-purple-600',
                  'text-white shadow-[0_0_24px_rgba(139,92,246,0.5)]',
                  'hover:shadow-[0_0_32px_rgba(139,92,246,0.7)]',
                  'transition-all duration-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isLoading
                  ? 'Chargement...'
                  : mode === 'login'
                  ? 'Se connecter'
                  : 'Créer un compte'}
              </button>
            </form>

            {/* Info */}
            <p className="text-xs text-center text-white/30 mt-6">
              {mode === 'login' ? (
                <>
                  Pas de compte ?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-neon-purple hover:underline"
                  >
                    Inscription
                  </button>
                </>
              ) : (
                <>
                  Déjà un compte ?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-neon-purple hover:underline"
                  >
                    Connexion
                  </button>
                </>
              )}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
