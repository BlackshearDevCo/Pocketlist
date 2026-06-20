import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        parchment: '#ECE4D9',
        'parchment-dark': '#E7DCD5',
        brand: {
          DEFAULT: '#C8553D',
          hover: '#A8412F',
          dark: '#7E2E20',
          light: '#E2917F',
          tint: '#F4D9D0',
          subtle: '#FBEEE7',
        },
        warm: {
          50: '#FBF6EF',
          100: '#F4EEE4',
          200: '#E7DCD5',
          300: '#D1C4BA',
          400: '#AB9E91',
          500: '#807466',
          600: '#6F6259',
          700: '#4A413B',
          800: '#2C2521',
          900: '#211C18',
        },
        priority: {
          'high-bg': '#F3E0EC',
          'high-text': '#5A2F3D',
          'medium-bg': '#F8EFDD',
          'medium-text': '#7E5B12',
          'low-bg': '#E8F0EA',
          'low-text': '#2E5C3E',
        },
      },
      fontFamily: {
        sans: ['var(--font-hanken)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-instrument)', 'Georgia', 'serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
export default config
