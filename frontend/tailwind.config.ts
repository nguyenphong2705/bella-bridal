import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#FAF8F7',
        cream: '#FAF8F7',
        'soft-lavender': '#F7F0EE',
        'lavender-deep': '#EAE2DF',
        'soft-pink': '#F7F0EE',
        'blush-pink': '#EADBD7',
        plum: '#6E2C3E',
        'plum-dark': '#572130',
        'rose-gold': '#B76E79',
        'rose-gold-dark': '#9E5863',
        champagne: '#D4AF7A',
        charcoal: '#2B2426',
        muted: '#5E5356',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        luxury: '0 10px 40px -10px rgba(110, 44, 62, 0.22)',
        card: '0 4px 24px -4px rgba(43, 36, 38, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
