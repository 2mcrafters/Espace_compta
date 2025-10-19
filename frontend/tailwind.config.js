/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f0ff',
          100: '#b3d1ff',
          200: '#80b3ff',
          300: '#4d94ff',
          400: '#1a75ff',
          500: '#004493',
          600: '#003a7a',
          700: '#002f61',
          800: '#002549',
          900: '#001a30',
        }
      }
    }
  },
  plugins: [],
}
