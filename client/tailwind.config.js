/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css}",
    "../shared/**/*.{js,ts,jsx,tsx,css}", // include shared folder for tailwind scanning
  ],
  theme: {
    extend: {
      colors: {
        foreground: "#111827",
        background: "#f9fafb", // Light gray
        border: "#D1D5DB", // example light gray for border-border class
        primary: {
          50: '#f5faff',
          100: '#e6f0ff',
          200: '#b3d1ff',
          300: '#80b2ff',
          400: '#4d92ff',
          500: '#1a73ff',
          600: '#005fe6',
          700: '#0049b4',
          800: '#003182',
          900: '#001951',
        },
      },
    },
  },
  plugins: [],
}



