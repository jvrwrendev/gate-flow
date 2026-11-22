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
        background: '#ffffff',
        foreground: '#102a2d',
        primary: {
          DEFAULT: '#0f766e',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f0fdfa',
          foreground: '#134e4a',
        },
        muted: {
          DEFAULT: '#f4f7f7',
          foreground: '#5f7a7a',
        },
        accent: {
          DEFAULT: '#ccfbf1',
          foreground: '#134e4a',
        },
        destructive: {
          DEFAULT: '#dc2626',
          foreground: '#ffffff',
        },
        success: {
          DEFAULT: '#16a34a',
          foreground: '#ffffff',
        },
        warning: {
          DEFAULT: '#d97706',
          foreground: '#ffffff',
        },
        info: {
          DEFAULT: '#0284c7',
          foreground: '#ffffff',
        },
        border: '#e6ecec',
        input: '#d9e3e3',
        ring: '#0f766e',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#102a2d',
        },
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
