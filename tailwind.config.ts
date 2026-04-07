import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './index.html',
  ],
  theme: {
    extend: {
      colors: {
        // Fonds
        'casino-dark':    '#0a0a0f',
        'casino-surface': '#12121a',
        'casino-border':  '#1e1e2e',

        // Néon — couleurs primaires du thème
        'neon-purple': '#8B5CF6',
        'neon-cyan':   '#06B6D4',
        'neon-gold':   '#F59E0B',
        'neon-red':    '#EF4444',
        'neon-green':  '#10B981',

        // Spécifiques roulette
        'roulette-red':   '#DC2626',
        'roulette-black': '#1F1F1F',
        'roulette-green': '#16A34A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.4)',
        'glow-cyan':   '0 0 20px rgba(6, 182, 212, 0.4)',
        'glow-gold':   '0 0 20px rgba(245, 158, 11, 0.4)',
        'glow-red':    '0 0 20px rgba(239, 68, 68, 0.4)',
        'glow-green':  '0 0 20px rgba(16, 185, 129, 0.4)',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)',
          },
        },
      },
    },
  },
  plugins: [],
}

export default config
