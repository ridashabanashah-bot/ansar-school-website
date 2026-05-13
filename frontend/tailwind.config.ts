import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F4F6FA",
          100: "#DDE3ED",
          200: "#BCC8DA",
          300: "#8FA3BD",
          400: "#5C7AA0",
          500: "#335A85",
          600: "#244A75",
          700: "#1B3D6B",
          800: "#14305B",
          900: "#0D1F40",
          950: "#060F1F"
        },
        accent: {
          50: "#EBF0FF",
          100: "#D4E0FF",
          200: "#B3C5FC",
          300: "#82A1FA",
          400: "#4570FA",
          500: "#0437F2",
          600: "#0E37CA",
          700: "#224C98",
          800: "#1A3870",
          900: "#102045"
        },
        cream: {
          50: "#FFFFFF",
          100: "#F8F9FB",
          200: "#EAEEF5"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Fraunces", "Georgia", "serif"]
      },
      maxWidth: {
        content: "80rem"
      },
      boxShadow: {
        prominent: "0 30px 60px -20px rgba(13, 31, 64, 0.18), 0 8px 20px -8px rgba(13, 31, 64, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
