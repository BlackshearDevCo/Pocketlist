import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        parchment: '#E8EDEA',
        'parchment-dark': '#DBE5DE',
        brand: {
          DEFAULT: '#6B8F71',
          hover: '#4E7055',
          dark: '#2E4D35',
          light: '#9AB89E',
          tint: '#D4E4D8',
          subtle: '#EBF3EC',
        },
        warm: {
          50: '#F4F8F5',
          100: '#E8F0EA',
          200: '#D4E0D7',
          300: '#B0C4B5',
          400: '#829D87',
          500: '#5C7862',
          600: '#4E6853',
          700: '#354840',
          800: '#1E3025',
          900: '#162219',
        },
        priority: {
          'high-bg': '#F3E0EC',
          'high-text': '#5A2F3D',
          'medium-bg': '#F8EFDD',
          'medium-text': '#7E5B12',
          'low-bg': '#E0EDDF',
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
