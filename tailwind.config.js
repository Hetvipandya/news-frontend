// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', '"Newsreader"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        paper: {
          50: '#FDFBF7',
          100: '#FAF8F5',
          200: '#F5F2EB',
          300: '#E8E2D5',
          400: '#D5CDBF',
        },
        editorial: {
          ink: '#14171A',
          'ink-soft': '#292524',
          muted: '#78716C',
          line: '#E8E2D5',
          terracotta: '#C2410C',
          'terracotta-dark': '#9A3412',
          'terracotta-light': '#FFF7ED',
          gold: '#D97706',
          'gold-light': '#FEF3C7',
          sage: '#047857',
          'sage-light': '#ECFDF5',
          navy: '#1E3A8A',
          'navy-light': '#EFF6FF',
        },
        brand: {
          navy: '#14171A',
          'navy-soft': '#292524',
          blue: '#1E3A8A',
          'blue-pale': '#EFF6FF',
          coral: '#C2410C',
          'coral-dark': '#9A3412',
          ink: '#14171A',
          muted: '#78716C',
          line: '#E8E2D5',
        },
      },
      boxShadow: {
        'soft-card': '0 1px 3px rgba(44, 38, 34, 0.04), 0 6px 20px -3px rgba(44, 38, 34, 0.06)',
        'card-hover': '0 12px 30px -4px rgba(44, 38, 34, 0.1), 0 4px 10px -2px rgba(44, 38, 34, 0.04)',
        'editorial-lift': '0 16px 36px -6px rgba(194, 65, 12, 0.12), 0 4px 12px -2px rgba(44, 38, 34, 0.05)',
      },
    },
  },
  plugins: [],
};
