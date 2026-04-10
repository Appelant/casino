import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { clsx } from 'clsx';
import type { StripeCardElementOptions } from '@stripe/stripe-js';

interface CheckoutFormProps {
  clientSecret: string;
  packLabel: string;
  priceDisplay: string;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}

const CARD_ELEMENT_OPTIONS: StripeCardElementOptions = {
  style: {
    base: {
      color: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      fontSize: '15px',
      '::placeholder': { color: 'rgba(255,255,255,0.35)' },
      iconColor: '#8B5CF6',
    },
    invalid: { color: '#EF4444', iconColor: '#EF4444' },
  },
};

export function CheckoutForm({
  clientSecret,
  packLabel,
  priceDisplay,
  onSuccess,
  onCancel,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (error) {
      setErrorMessage(error.message ?? 'Erreur de paiement');
      setIsProcessing(false);
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
        <div className="text-white/70 text-sm mb-1">Vous achetez</div>
        <div className="text-neon-gold font-bold text-lg">{packLabel}</div>
        <div className="text-white/50 text-sm">Prix : {priceDisplay}</div>
      </div>

      <div className="rounded-lg bg-white/5 border border-white/15 px-4 py-3">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      <div className="rounded-lg bg-neon-purple/10 border border-neon-purple/20 px-3 py-2 text-xs text-white/50 text-center">
        Carte test : <span className="font-mono text-neon-purple/80">4242 4242 4242 4242</span> — exp: n'importe quelle date future — CVC: n'importe
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-neon-red/10 border border-neon-red/30 px-3 py-2 text-sm text-neon-red text-center">
          {errorMessage}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white/60 text-sm font-medium hover:bg-white/10 transition-all disabled:opacity-50"
        >
          Retour
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className={clsx(
            'flex-1 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all',
            'bg-neon-gold/20 border border-neon-gold/50 text-neon-gold',
            'hover:bg-neon-gold/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isProcessing ? 'Traitement...' : `Payer ${priceDisplay}`}
        </button>
      </div>
    </form>
  );
}
