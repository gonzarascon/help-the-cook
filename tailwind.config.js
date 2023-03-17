const { fontFamily } = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-chivo)", ...fontFamily.sans],
        lato: ["var(--font-lato)", ...fontFamily.sans],
      },
      backgroundImage: {
        "mesh-dark": "url('/mesh.svg')",
        "mesh-light": "url('/mesh-light.svg')",
      },
      keyframes: {
        ring: {
          "0%, 100%": { boxShadow: `rgba(0,0,0,0) 0px 0px 0px 0px` },
          "50%": { boxShadow: `${colors.purple[500]} 0px 0px 6px 4px` },
        },
      },
      animation: {
        ring: "ring 3s linear infinite",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"),
  ],
};
