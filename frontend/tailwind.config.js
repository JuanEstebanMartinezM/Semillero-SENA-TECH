/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores corporativos de Davivienda
        'davivienda-red': '#ED1C24',
        'davivienda-dark': '#1A1A1A',
        'davivienda-gray': '#F5F5F5',
      },
    },
  },
  plugins: [],
}
