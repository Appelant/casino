import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { staggerContainer, staggerItem, bounceIn } from '@/config/animations.config';
import { clsx } from 'clsx';

/**
 * Composant GameLobby — page d'accueil avec sélection des jeux
 */
export function GameLobby() {
  const games = [
    {
      id: 'roulette' as const,
      title: 'Roulette Européenne',
      description: 'La roulette classique avec 37 cases (0-36). Misez sur les numéros, couleurs, ou zones.',
      icon: (
        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      color: 'purple',
      rules: [
        '37 cases (0-36)',
        'Misez avant le spin',
        'Plein: 35:1, Rouge/Noir: 1:1',
      ],
    },
    {
      id: 'blackjack' as const,
      title: 'Blackjack Vegas Rules',
      description: 'Battez le dealer sans dépasser 21. Blackjack naturel paye 3:2.',
      icon: (
        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      color: 'gold',
      rules: [
        '6 decks, dealer H17',
        'Blackjack paye 3:2',
        'Double & Split disponibles',
      ],
    },
    {
      id: 'dice' as const,
      title: 'Jeu du Dé',
      description: 'Choisissez une face de 1 à 6 et lancez le dé. Si vous avez raison, vous gagnez 6× votre mise !',
      icon: (
        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'cyan',
      rules: [
        'Dé à 6 faces',
        'Choisissez votre numéro',
        'Gagnez 6× si bonne face',
      ],
    },
    {
      id: 'mines' as const,
      title: 'Mines',
      description: 'Révélez des cases sûres et encaissez avant d\'exploser. Plus vous risquez, plus vous gagnez !',
      icon: (
        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      ),
      color: 'red',
      rules: [
        'Grille 5×5, choisissez les mines',
        'Cases sûres = multiplicateur',
        'Encaissez quand vous voulez',
      ],
    },
    {
      id: 'slots' as const,
      title: 'Machine à Sous',
      description: 'Alignez 3 symboles identiques pour gagner ! Jackpot avec les 777.',
      icon: (
        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      color: 'purple',
      rules: [
        '3 rouleaux avec 6 symboles',
        '777 = Jackpot 100×',
        '2 ou 3 sevens = gains bonus',
      ],
    },
  ];

  const colorClasses: Record<string, string> = {
    purple: 'from-neon-purple/20 to-neon-purple/5 border-neon-purple/30',
    gold: 'from-neon-gold/20 to-neon-gold/5 border-neon-gold/30',
    cyan: 'from-neon-cyan/20 to-neon-cyan/5 border-neon-cyan/30',
    red: 'from-neon-red/20 to-neon-red/5 border-neon-red/30',
  };

  const textColorClasses: Record<string, string> = {
    purple: 'text-neon-purple',
    gold: 'text-neon-gold',
    cyan: 'text-neon-cyan',
    red: 'text-neon-red',
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="text-center mb-12"
      >
        {/* Logo ZVC */}
        <motion.div
          variants={bounceIn}
          className="flex justify-center mb-6"
        >
          <img
            src="/logo.png"
            alt="ZVC - ZéroVirguleChance"
            className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl"
          />
        </motion.div>

        <motion.h1 variants={bounceIn} className="text-4xl md:text-5xl font-bold mb-4">
          Bienvenue au <span className="text-neon-purple">Casino ZVC</span>
        </motion.h1>
        <motion.p variants={bounceIn} className="text-lg text-white/60 max-w-2xl mx-auto">
          Jeux de casino fictifs avec argent simulé. Amusez-vous sans risque !
        </motion.p>
      </motion.div>

      {/* Games grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {games.map((game) => (
          <motion.div key={game.id} variants={staggerItem}>
            <GlassCard
              glowColor={game.color as 'purple' | 'gold' | 'cyan' | 'none'}
              hover
              className={clsx(
                'h-full p-6',
                'bg-gradient-to-br',
                colorClasses[game.color]
              )}
            >
              <div className="flex flex-col h-full">
                {/* Icon */}
                <div className={clsx(
                  'w-20 h-20 rounded-xl mb-4 flex items-center justify-center',
                  'bg-white/5 border border-white/10',
                  textColorClasses[game.color]
                )}>
                  {game.icon}
                </div>

                {/* Title & Description */}
                <h2 className="text-xl font-bold mb-2">{game.title}</h2>
                <p className="text-white/60 mb-4 flex-1">{game.description}</p>

                {/* Rules */}
                <ul className="space-y-1 mb-6">
                  {game.rules.map((rule, i) => (
                    <li key={i} className="text-sm text-white/50 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-purple/50" />
                      {rule}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link to={`/${game.id}`}>
                  <NeonButton
                    variant={game.color as 'purple' | 'gold' | 'cyan' | 'red'}
                    size="lg"
                    className="w-full"
                  >
                    Jouer
                  </NeonButton>
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <div className="inline-block px-4 py-2 rounded-lg bg-white/5 border border-white/10">
          <p className="text-sm text-white/40">
            ⚠️ <strong>Argent fictif uniquement</strong> — Aucun gain réel possible
          </p>
        </div>
      </motion.div>
    </div>
  );
}
