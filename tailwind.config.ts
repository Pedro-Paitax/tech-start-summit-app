import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF7A00",
        dark: "#0A0A0A",
      },
    },
  },
  plugins: [],
} satisfies Config;
