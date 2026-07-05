/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#030712',      // Deep black-gray
          darker: '#090d16',    // Matte black
          card: '#0f172a',      // Slate-900
          border: '#1e293b',    // Slate-800
          text: '#f1f5f9',      // Slate-100
          muted: '#94a3b8',     // Slate-400
          accent: '#6366f1',    // Indigo-500
          teal: '#14b8a6',      // Teal-500
          rose: '#f43f5e',      // Rose-500
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
