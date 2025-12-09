/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'davivienda-red': '#ED1C24',
        'davivienda': '#ED1C24',
      },
    },
  },
  plugins: [],
}

