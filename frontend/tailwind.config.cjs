module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        davivienda: {
          DEFAULT: '#c8102e',
          dark: '#9b0d24',
          light: '#f6d6d9'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Avenir', 'Helvetica', 'Arial'],
      }
    },
  },
  plugins: [],
};
