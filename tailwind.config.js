/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ghost: {
          bg: "#050816",
          accent: "#22c55e",
          accentPurple: "#a855f7"
        }
      },
      boxShadow: {
        "ghost-glow": "0 0 40px rgba(34,197,94,0.4), 0 0 80px rgba(168,85,247,0.35)"
      },
      backdropBlur: {
        xs: "2px"
      }
    }
  },
  plugins: []
};


