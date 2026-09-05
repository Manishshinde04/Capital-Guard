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
        obsidian: {
          950: '#060911',
          900: '#0a0e1a',
          850: '#0f1526',
          800: '#141c33',
          700: '#1e294b',
          600: '#2c3b6b',
        },
        terminal: {
          emerald: '#10b981',
          emeraldDark: '#064e3b',
          amber: '#f59e0b',
          amberDark: '#78350f',
          crimson: '#ef4444',
          crimsonDark: '#7f1d1d',
          indigo: '#6366f1',
          cyan: '#06b6d4',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
