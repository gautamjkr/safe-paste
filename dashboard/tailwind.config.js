/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ghost: {
          bg: "#050816",
          accent: "#22c55e",
          accentPurple: "#a855f7",
          dark: "#0a0e1a",
        },
      },
      boxShadow: {
        "ghost-glow": "0 0 40px rgba(34,197,94,0.4), 0 0 80px rgba(168,85,247,0.35)",
        "ghost-glow-sm": "0 0 20px rgba(34,197,94,0.3), 0 0 40px rgba(168,85,247,0.25)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(34,197,94,0.4)" },
          "100%": { boxShadow: "0 0 40px rgba(34,197,94,0.6), 0 0 60px rgba(168,85,247,0.4)" },
        },
      },
    },
  },
  plugins: [],
};

