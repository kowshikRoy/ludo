import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#1349ec",
        "primary-dark": "#0b32a8",
        "on-primary": "#ffffff",
        "background-light": "#f6f6f8",
        "background-dark": "#101522",
        "surface-dark": "#192033",
        "surface-variant": "#232c48",
        "secondary": "#92a0c9",
      },
      fontFamily: {
        "display": ["Spline Sans", "sans-serif"],
        "body": ["Spline Sans", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "full": "9999px",
      },
    },
  },
  plugins: [],
} satisfies Config;
