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
      },
    },
  },
  plugins: [],
}

export default config
