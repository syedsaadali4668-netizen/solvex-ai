/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyan: {
          50: '#CFFAFE',
          500: '#06B6D4',
          400: '#22D3EE',
        },
        purple: {
          50: '#EDE9FE',
          500: '#8B5CF6',
          700: '#7C3AED',
        },
        magenta: {
          50: '#FAE8FF',
          400: '#E879F9',
          500: '#D946EF',
        },
        background: '#F8FAFC',
        surface: '#FFFFFF',
        text: '#172033',
        textMuted: '#64748B',
        border: '#E9EAF2'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
