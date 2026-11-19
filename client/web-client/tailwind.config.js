/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['DM Sans', 'sans-serif'], display: ['Manrope', 'sans-serif'] },
      colors: {
        border: 'hsl(var(--border))', input: 'hsl(var(--input))', ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))', foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        sidebar: { DEFAULT: '#ffffff', muted: '#64748b', active: '#eff6ff' },
      },
      borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },
      boxShadow: { card: 'none' },
      keyframes: {
        'fade-in': { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'sheet-in-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'sheet-out-right': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(100%)' } },
        'sheet-in-left': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        'sheet-out-left': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-100%)' } },
        'sheet-overlay-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'sheet-overlay-out': { from: { opacity: '1' }, to: { opacity: '0' } },
      },
      animation: {
        'fade-in': 'fade-in .2s ease-out',
        'sheet-in-right': 'sheet-in-right .28s cubic-bezier(0.16, 1, 0.3, 1)',
        'sheet-out-right': 'sheet-out-right .22s cubic-bezier(0.4, 0, 1, 1)',
        'sheet-in-left': 'sheet-in-left .28s cubic-bezier(0.16, 1, 0.3, 1)',
        'sheet-out-left': 'sheet-out-left .22s cubic-bezier(0.4, 0, 1, 1)',
        'sheet-overlay-in': 'sheet-overlay-in .2s ease-out',
        'sheet-overlay-out': 'sheet-overlay-out .2s ease-in',
      },
    },
  },
  plugins: [],
}
