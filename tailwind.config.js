/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",],
  theme: {
    extend: {
      colors: {
        primary: "#FF7A00",
        dark: "#0A0A0A",
        background: "#2d2d2d",
      },
    },
  },
  plugins: [],
}

