import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        forest: {
          900: "#0f1a0c",
          800: "#162212",
          700: "#1c2e16",
        },
        lime: {
          500: "#b0e455",
          400: "#c9f070",
        },
        /* Legacy aliases — kept so in-app pages still compile */
        navy: {
          900: "#0f1a0c",
          800: "#162212",
          700: "#1c2e16",
        },
        babyblue: {
          500: "#b0e455",
          400: "#c9f070",
        },
      },
      fontFamily: {
        sans: ['Satoshi', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.04em',
        widest: '0.1em',
      }
    },
  },
  plugins: [],
};
export default config;
