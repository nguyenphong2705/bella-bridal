/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#FFFDF8',
        cream: '#F8F3ED',
        'soft-pink': '#F6E5E8',
        'blush-pink': '#EBCFD5',
        'rose-gold': '#C69A91',
        'rose-gold-dark': '#A87C73',
        charcoal: '#4A4141',
        muted: '#7A6F6F',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        luxury: '0 10px 40px -10px rgba(198, 154, 145, 0.18)',
        card: '0 4px 24px -4px rgba(74, 65, 65, 0.06)',
      },
    },
  },
  plugins: [],
};
