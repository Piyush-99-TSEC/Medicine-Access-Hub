/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6D28D9',
          hover: '#5B21B6',
          tint: '#F5F3FF'
        },
        secondary: '#0D9488',
        accent: '#4F46E5',
        surface: '#FFFFFF',
        app: '#F8FAFC',
        border: '#E2E8F0',
        ink: {
          DEFAULT: '#0F172A',
          soft: '#64748B'
        },
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
        info: '#4F46E5'
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Lexend"', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
}
