import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#FFFDFC',
        cream: '#FAF7F5',
        'soft-lavender': '#EFE8F6',
        'lavender-deep': '#E6DDF0',
        'soft-pink': '#FCECEF',
        'blush-pink': '#F8E1E6',
        plum: '#6D4C7D',
        'plum-dark': '#573B65',
        'rose-gold': '#B76E79',
        'rose-gold-dark': '#9E5863',
        champagne: '#D4AF7A',
        charcoal: '#3A2E39',
        muted: '#5E525E',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        luxury: '0 10px 40px -10px rgba(109, 76, 125, 0.16)',
        card: '0 4px 24px -4px rgba(58, 46, 57, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
