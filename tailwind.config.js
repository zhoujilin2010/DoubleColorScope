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
        bg: {
          primary: '#0B1020',
          card: '#111827',
          hover: '#1a2332',
        },
        brand: {
          blue: '#3B82F6',
          red: '#EF4444',
          purple: '#8B5CF6',
          yellow: '#FACC15',
          'blue-ball': '#2563EB',
        },
      },
    },
  },
  plugins: [],
}
