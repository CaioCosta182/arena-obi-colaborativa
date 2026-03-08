// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores gamificadas para o projeto
        obi: {
          blue: '#2563EB',
          yellow: '#FBBF24',
          green: '#10B981',
          red: '#EF4444'
        }
      }
    },
  },
  plugins: [],
}