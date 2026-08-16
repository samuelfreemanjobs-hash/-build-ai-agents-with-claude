/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0f172a', light: '#1e293b' },
        accent: { DEFAULT: '#3b82f6', dark: '#2563eb' },
        cta: { DEFAULT: '#f59e0b', dark: '#d97706' },
      },
    },
  },
  plugins: [],
}
