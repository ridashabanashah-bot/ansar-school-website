import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Logo-derived deep navy ink ramp (single-tone Ansar logo).
        brand: {
          50: "#f4f6f9",
          100: "#e6ecf2",
          200: "#c7d3e0",
          300: "#95acc4",
          400: "#5d7a99",
          500: "#335778",
          600: "#234260",
          700: "#173550",
          800: "#102a40",
          900: "#0c2033",
          950: "#061523"
        },
        // Warm gold accent — single-color logo, so accent stays neutral-warm.
        accent: {
          50: "#fdf8eb",
          100: "#faecc4",
          200: "#f3d685",
          300: "#ecbd4b",
          400: "#d8a23a",
          500: "#b8801c",
          600: "#976514",
          700: "#75500f",
          800: "#5a3d0c",
          900: "#3f2a08"
        },
        // Cream / off-white surfaces — alabaster-style warm neutrals.
        cream: {
          50: "#fdf9f1",
          100: "#f7efe1",
          200: "#ecdfc6"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Fraunces", "Georgia", "serif"]
      },
      maxWidth: {
        content: "72rem"
      },
      boxShadow: {
        prominent: "0 10px 30px -10px rgba(15, 32, 51, 0.20), 0 4px 12px -4px rgba(15, 32, 51, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
