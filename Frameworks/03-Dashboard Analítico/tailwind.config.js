/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        brand: {
          blue: '#2563eb',
          green: '#059669',
          amber: '#d97706',
          purple: '#7c3aed',
          red: '#dc2626',
        },
      },
    },
  },
  plugins: [],
}
