const path = require('node:path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    path.join(__dirname, 'frontend/index.html'),
    path.join(__dirname, 'frontend/src/**/*.{ts,tsx,js,jsx}')
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg)',
        foreground: 'var(--color-fg)',
        canvas: 'var(--color-canvas)'
      }
    }
  },
  plugins: []
};
