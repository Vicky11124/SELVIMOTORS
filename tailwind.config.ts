import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Semantic design tokens
        background: '#F7F2E8',
        surface: '#FFFFFF',
        'surface-muted': '#EFECE6',
        border: '#E2DCD0',
        primary: { DEFAULT: '#0E3B2E', dark: '#08261E' },
        accent: '#A67C52',
        text: '#263238',
        'text-strong': '#111816',
        'light-green': '#DDE8DF',
        earth: '#A67C52',
        slate: '#263238',
        dark: '#111816',
        'selvi-red': { DEFAULT: '#E10600', dark: '#b80500' },

        // Compatibility & conversion tokens
        ink: '#F7F2E8',
        card: '#FFFFFF',
        raised: '#EFECE6',
        line: '#E2DCD0',
        brand: { DEFAULT: '#0E3B2E', dark: '#08261E' },
        muted: '#526066',
      },
      fontFamily: {
        display: ['var(--font-kanit)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        rise: { '0%': { opacity: '0', transform: 'translateY(18px)' }, '100%': { opacity: '1', transform: 'none' } },
        navProgress: {
          '0%': { transform: 'translateX(-100%)' },
          '60%': { transform: 'translateX(-10%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
      animation: {
        rise: 'rise .7s cubic-bezier(.2,.7,.2,1) both',
        navProgress: 'navProgress .35s cubic-bezier(.16,1,.3,1) forwards',
      },
    },
  },
  plugins: [],
};
export default config;
