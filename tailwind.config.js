/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: '#0c1628',
        surface: 'rgba(255, 255, 255, 0.04)',
        textPrimary: '#e9eef7',
        textSecondary: '#9fb1d3',
        accentStart: '#4a7fff',
        accentEnd: '#8a63ff',
        blueStep: '#0f3f90',
        greenStep: '#0f3e2d',
        telegramBlue: '#61a5ff'
      },
      boxShadow: {
        card: '0 18px 60px rgba(0, 0, 0, 0.35)',
        soft: '0 10px 40px rgba(0, 0, 0, 0.25)'
      },
      borderRadius: {
        xl: '20px'
      },
      fontSize: {
        hero: '72px'
      }
    }
  },
  plugins: []
};
