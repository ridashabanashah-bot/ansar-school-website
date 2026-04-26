import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9f4",
          100: "#dbf0e3",
          200: "#b8e1c9",
          300: "#8acca7",
          400: "#56b083",
          500: "#2f9466",
          600: "#1f7651",
          700: "#1a5f43",
          800: "#174c37",
          900: "#143f2f",
          950: "#0a2419"
        },
        accent: {
          50: "#eef6ff",
          100: "#d9eaff",
          400: "#5b9eff",
          500: "#2b7fff",
          600: "#1c63d6",
          700: "#194fa6"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "Inter", "system-ui", "sans-serif"]
      },
      maxWidth: {
        content: "72rem"
      }
    }
  },
  plugins: []
};

export default config;
