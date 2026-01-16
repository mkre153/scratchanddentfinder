import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary accent (CTAs)
        accent: {
          DEFAULT: '#FFD700',
          hover: '#E6C200',
        },
        // Phase 1: Trust-first color system
        warm: {
          50: '#FAFAF8',   // Hero backgrounds, page backgrounds
          100: '#F3F3F1',  // Alternate sections
        },
        sage: {
          50: '#F0F4F1',   // Light badge backgrounds
          100: '#E1EBE5',  // Subtle backgrounds
          300: '#A8C0B2',  // Soft accents
          500: '#7F9C8B',  // Primary emotional accent
          700: '#5A7366',  // Text, hover states
        },
        taupe: {
          400: '#B7AEA4',  // Secondary accent, borders
        },
        brand: {
          blue: '#4F6FA8', // Softened blue for links/nav
        },
        charcoal: '#2E2E2E', // Primary text (not pure black)
      },
    },
  },
  plugins: [],
}

export default config
