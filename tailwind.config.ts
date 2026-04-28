import type { Config } from "tailwindcss";

const config: Config = {
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
        navy: {
          900: "#0B0F1A",
          800: "#1A1F2C",
          700: "#2A3042"
        },
        babyblue: {
          500: "#AFCBFF",
          400: "#C4DAFF"
        }
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
