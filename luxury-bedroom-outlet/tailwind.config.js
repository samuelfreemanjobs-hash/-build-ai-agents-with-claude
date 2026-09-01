/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        gold: { DEFAULT: '#c9a962', light: '#e8d5a3', dark: '#a88b4a' },
        charcoal: { DEFAULT: '#1a1a1a', light: '#2d2d2d' },
      },
    },
  },
  plugins: [],
}
