/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Ecobank-derived brand tokens. These map to CSS variables in index.css
        // so the team can drop in the official Ecobank/Blaze brand kit by editing
        // one place. Values below are a close, deployable approximation.
        eco: {
          blue: "rgb(var(--eco-blue) / <alpha-value>)",
          "blue-deep": "rgb(var(--eco-blue-deep) / <alpha-value>)",
          "blue-bright": "rgb(var(--eco-blue-bright) / <alpha-value>)",
          gold: "rgb(var(--eco-gold) / <alpha-value>)",
          "gold-hi": "rgb(var(--eco-gold-hi) / <alpha-value>)",
          green: "rgb(var(--eco-green) / <alpha-value>)",
          cyan: "rgb(var(--eco-cyan) / <alpha-value>)",
          accent: "rgb(var(--eco-accent) / <alpha-value>)",
        },
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        surface2: "rgb(var(--surface2) / <alpha-value>)",
        hairline: "rgb(var(--hairline) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        "ink-soft": "rgb(var(--ink-soft) / <alpha-value>)",
        "ink-faint": "rgb(var(--ink-faint) / <alpha-value>)",
        positive: "rgb(var(--positive) / <alpha-value>)",
        warn: "rgb(var(--warn) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
      },
      borderRadius: {
        card: "18px",
        ctrl: "12px",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
