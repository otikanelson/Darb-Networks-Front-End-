/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          500: '#10B981', // You can adjust this to the exact shade you want
          600: '#059669', // Slightly darker shade for hover states
        },
      },
        fontFamily: {
        'inter': ['inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}