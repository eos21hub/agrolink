/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        earth: {
          50: '#fdf8f0',
          100: '#f9eedb',
          200: '#f1d9b0',
          300: '#e8be7e',
          400: '#dd9e4d',
          500: '#d4842a',
          600: '#c46b1f',
          700: '#a3531b',
          800: '#83421d',
          900: '#6b371a',
        },
        forest: {
          50: '#f0faf0',
          100: '#dcf5dc',
          200: '#b9eab9',
          300: '#86d986',
          400: '#52c152',
          500: '#2da82d',
          600: '#1e8c1e',
          700: '#1a701a',
          800: '#185918',
          900: '#154a15',
        },
        savanna: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        soil: {
          50: '#faf5f0',
          100: '#f3e8dc',
          200: '#e6cfb8',
          300: '#d5af8d',
          400: '#c28a61',
          500: '#b37044',
          600: '#9a5b37',
          700: '#7f482e',
          800: '#693c29',
          900: '#573225',
        },
        night: {
          800: '#0f1a0f',
          850: '#0c1510',
          900: '#08110a',
          950: '#050d07',
        }
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
