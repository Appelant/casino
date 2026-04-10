import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { clsx } from 'clsx';
import { useUIStore } from '@/stores';
import { useAuthStore } from '@/stores/auth/authStore';
import { formatCurrency } from '@/utils/currency';
import { CheckoutForm } from './CheckoutForm';

// Stripe instance — initialisée une seule fois
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '');

// ─── Définition des packs ────────────────────────────────────────────────────

interface ShopPack {
  id: string;
  label: string;
  zvcCents: number;       // montant crédité en centimes ZVC
  eurCents: number;       // prix en centimes EUR (pour Stripe)
  priceDisplay: string;
  badge?: string;
  color: string;
  glow: string;
}

const PACKS: ShopPack[] = [
  {
    id: 'starter',
    label: 'Débutant',
    zvcCents: 1_000_000,
    eurCents: 100,
    priceDisplay: '1,00 €',
    color: 'border-neon-cyan/40 bg-neon-cyan/10',
    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.2)]',
  },
  {
    id: 'standard',
    label: 'Standard',
    zvcCents: 5_000_000,
    eurCents: 500,
    priceDisplay: '5,00 €',
    badge: 'Populaire',
    color: 'border-neon-purple/50 bg-neon-purple/10',
    glow: 'shadow-[0_0_20px_rgba(139,92,246,0.25)]',
  },
  {
    id: 'premium',
    label: 'Premium',
    zvcCents: 20_000_000,
    eurCents: 2000,
    priceDisplay: '20,00 €',
    color: 'border-neon-gold/40 bg-neon-gold/10',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]',
  },
  {
    id: 'vip',
    label: 'VIP',
    zvcCents: 50_000_000,
    eurCents: 5000,
    priceDisplay: '50,00 €',
    badge: 'Meilleure valeur',
    color: 'border-neon-red/40 bg-neon-red/10',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.2)]',
  },
];

// ─── Composant principal ──────────────────────────────────────────────────────

type Step = 'packs' | 'checkout' | 'success';

interface CheckoutState {
  pack: ShopPack;
  clientSecret: string;
}

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001/api`;

export function ShopModal() {
  const closeModal = useUIStore((s) => s.closeModal);
  const currentUser = useAuthStore((s) => s.currentUser);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const addToast = useUIStore((s) => s.addToast);

  const [step, setStep] = useState<Step>('packs');
  const [checkout, setCheckout] = useState<CheckoutState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [creditedAmount, setCreditedAmount] = useState(0);

  // Sélectionne un pack → crée le PaymentIntent côté serveur
  const handleSelectPack = useCallback(async (pack: ShopPack) => {
    if (!currentUser) return;
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/shop/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId: pack.id, userId: currentUser.id }),
      });
      const data = await res.json() as { clientSecret?: string; error?: string };

      if (!res.ok || !data.clientSecret) {
        throw new Error(data.error ?? 'Impossible de créer le paiement');
      }

      setCheckout({ pack, clientSecret: data.clientSecret });
      setStep('checkout');
    } catch (err) {
      addToast({ level: 'error', message: String(err instanceof Error ? err.message : err), duration: 4000 });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, addToast]);

  // Paiement confirmé côté Stripe → on crédite la balance
  const handlePaymentSuccess = useCallback(async (paymentIntentId: string) => {
    if (!currentUser || !checkout) return;

    try {
      const res = await fetch(`${API_BASE}/shop/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId, userId: currentUser.id }),
      });
      const data = await res.json() as { newBalance?: number; error?: string };

      if (!res.ok) throw new Error(data.error ?? 'Erreur de confirmation');

      await refreshUser();
      setCreditedAmount(checkout.pack.zvcCents);
      setStep('success');
    } catch (err) {
      addToast({ level: 'error', message: String(err instanceof Error ? err.message : err), duration: 4000 });
    }
  }, [currentUser, checkout, refreshUser, addToast]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg bg-casino-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">Boutique ZVC</h2>
            <p className="text-xs text-white/40 mt-0.5">Rechargez votre solde en ZVC$</p>
          </div>
          <button
            onClick={closeModal}
            className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">

            {/* ── Étape 1 : sélection du pack ── */}
            {step === 'packs' && (
              <motion.div
                key="packs"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-2 gap-3"
              >
                {PACKS.map((pack) => (
                  <button
                    key={pack.id}
                    onClick={() => handleSelectPack(pack)}
                    disabled={isLoading}
                    className={clsx(
                      'relative flex flex-col items-center gap-2 p-4 rounded-xl border',
                      'transition-all duration-200 hover:brightness-125 hover:scale-[1.02]',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      pack.color, pack.glow
                    )}
                  >
                    {pack.badge && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-neon-gold text-casino-dark text-[10px] font-bold uppercase whitespace-nowrap">
                        {pack.badge}
                      </span>
                    )}
                    <div className="text-2xl font-black text-white">{pack.label}</div>
                    <div className="text-neon-gold font-bold text-sm">
                      +{formatCurrency(pack.zvcCents)}
                    </div>
                    <div className="text-white/50 text-xs">{pack.priceDisplay}</div>
                  </button>
                ))}

                <div className="col-span-2 text-center text-xs text-white/25 pt-1">
                  Argent fictif — aucun gain réel possible
                </div>
              </motion.div>
            )}

            {/* ── Étape 2 : paiement Stripe ── */}
            {step === 'checkout' && checkout && (
              <motion.div
                key="checkout"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Elements
                  stripe={stripePromise}
                  options={{ clientSecret: checkout.clientSecret, locale: 'fr' }}
                >
                  <CheckoutForm
                    clientSecret={checkout.clientSecret}
                    packLabel={`Pack ${checkout.pack.label} — +${formatCurrency(checkout.pack.zvcCents)}`}
                    priceDisplay={checkout.pack.priceDisplay}
                    onSuccess={handlePaymentSuccess}
                    onCancel={() => setStep('packs')}
                  />
                </Elements>
              </motion.div>
            )}

            {/* ── Étape 3 : succès ── */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-4"
              >
                <div className="w-16 h-16 rounded-full bg-neon-green/20 border-2 border-neon-green/50 flex items-center justify-center text-3xl">
                  ✓
                </div>
                <div className="text-center">
                  <div className="text-white font-bold text-lg">Paiement réussi !</div>
                  <div className="text-neon-green text-sm mt-1">
                    +{formatCurrency(creditedAmount)} ajoutés à votre solde
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="px-6 py-2.5 rounded-lg bg-neon-green/20 border border-neon-green/50 text-neon-green font-bold uppercase tracking-wider text-sm hover:bg-neon-green/30 transition-all"
                >
                  Jouer maintenant
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
