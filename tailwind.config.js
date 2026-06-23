/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#020617',
        panel: '#0f172a',
        card: 'rgba(15,23,42,0.92)',
        border: 'rgba(148,163,184,0.2)',
        muted: '#94a3b8',
        blue: '#2563eb',
        sky: '#38bdf8',
        green: '#22c55e',
        red: '#ef4444',
        orange: '#f97316',
        purple: '#a855f7',
      },
      borderRadius: { xl: '18px' },
      boxShadow: { glow: '0 22px 60px rgba(0,0,0,0.34)' },
    },
  },
  plugins: [],
}
