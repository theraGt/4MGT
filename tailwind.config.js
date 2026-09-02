/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Archivo', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          red: '#CD171E',
          'red-dark': '#8F0F14',
          ember: '#E8402F',
          flame: '#F5821E',
          charcoal: '#262626',
          'charcoal-900': '#121212',
          'charcoal-700': '#333333',
          gray: '#EEEEEE',
          muted: '#9C9C9C',
          line: '#3A3A3A',
        },
      },
    },
  },
  plugins: [],
}
