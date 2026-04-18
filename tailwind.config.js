/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0c10',
        surface: '#111418',
        border: '#1e2530',
        green: '#00ff88',
        yellow: '#ffcc00',
        red: '#ff3355',
        blue: '#00aaff',
        dim: '#4a5568',
        textMain: '#c8d0dc',
      },
      fontFamily: {
        sans: ['Barlow Condensed', 'sans-serif'],
        mono: ['Share Tech Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
