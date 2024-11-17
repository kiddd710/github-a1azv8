/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          maroon: '#7a003a',
          yellow: '#ffcc00',
          navy: '#1b3a5b',
          teal: '#00a4a7',
          purple: '#9a4d9b',
          orange: '#ff6600',
          pink: '#f39ab5',
          dark: '#333333',
          light: '#f4f4f4'
        }
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
};