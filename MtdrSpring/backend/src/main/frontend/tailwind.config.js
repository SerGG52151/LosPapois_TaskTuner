/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#009B77',
          dark:    '#004D40',
          light:   '#B2DFDB',
          lighter: '#E0F7FA',
          muted:   '#AEEEEE',
          accent:  '#00BFFF',
        },
        secondary: {
          DEFAULT: '#00796B',
        },
        success: {
          DEFAULT: '#1B5E20',
          light:   '#A5D6A7',
        },
      },
    },
  },
  plugins: [],
}
