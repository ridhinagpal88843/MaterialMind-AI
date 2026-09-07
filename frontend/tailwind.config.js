/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        deep: '#070A12',
        space: {
          dark: '#070A12',
          card: '#0D1322',
          surface: '#121A2D',
        },
        surface: {
          DEFAULT: '#0B101E',
          card: 'rgba(15, 23, 42, 0.65)',
          hover: 'rgba(30, 41, 59, 0.85)',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        accent: {
          cyan: '#00F0FF',
          violet: '#8B5CF6',
          emerald: '#10B981',
          rose: '#F43F5E',
          amber: '#F59E0B'
        },
        cluster: {
          0: '#00F0FF', // Covalent/Semiconductor
          1: '#F59E0B', // Open-framework / large volume
          2: '#10B981', // Wide-gap ionic insulator
          3: '#EC4899', // Colossal permittivity
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
