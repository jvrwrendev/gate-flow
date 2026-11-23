/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        foreground: '#0B2348',
        primary: {
          DEFAULT: '#087FE8',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#003B80',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F8FAFC',
          foreground: '#64748B',
        },
        accent: {
          DEFAULT: '#EBF4FF',
          foreground: '#003B80',
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT: '#16A34A',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#D97706',
          foreground: '#FFFFFF',
        },
        info: {
          DEFAULT: '#0284C7',
          foreground: '#FFFFFF',
        },
        border: '#E2E8F0',
        input: '#E2E8F0',
        ring: '#087FE8',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#0B2348',
        },
        surface: '#F8FAFC',
      },
      borderRadius: {
        DEFAULT: '0.625rem',
        sm: '0.375rem',
        md: '0.625rem',
        lg: '0.875rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      spacing: {
        4.5: '1.125rem',
        18: '4.5rem',
      },
      fontFamily: {
        sans: ['System'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
    },
  },
  presets: [require('nativewind/preset')],
  plugins: [],
}
