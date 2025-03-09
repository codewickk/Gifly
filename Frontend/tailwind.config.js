/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // Ensures Tailwind scans your files
  theme: {
    extend: {
      fontFamily: {
        giphly: ["Bungee", "cursive"],
        body: ["Inter", "sans-serif"], // Custom font
      },
      animation: {
        glow: "glow 1.5s infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { textShadow: "0 0 10px #ff00ff, 0 0 20px #ff00ff" },
          "100%": { textShadow: "0 0 20px #ff00ff, 0 0 40px #ff00ff" },
        },
      },
      colors: {
        neonPink: "#ff00ff",
        neonBlue: "#00ffff",
      },
    },
  },
  plugins: [],
};
