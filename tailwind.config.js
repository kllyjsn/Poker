/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        felt: {
          900: "#0a1f14",
          800: "#0e2a1b",
          700: "#123a25",
          600: "#185030",
        },
        chip: {
          red: "#c0392b",
          gold: "#d4a017",
          navy: "#0e2740",
          ivory: "#f5efe0",
        },
        card: {
          bg: "#fbf8f1",
          red: "#b3251c",
          black: "#0c0f12",
        },
      },
      fontFamily: {
        display: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        felt: "inset 0 0 80px rgba(0,0,0,0.45)",
        chip: "0 2px 6px rgba(0,0,0,0.4), inset 0 -2px 0 rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
};
