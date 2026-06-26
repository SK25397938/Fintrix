/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintrix: {
          dark: "#052F5F",
          accent: "#C0FDFB",
          bg: "#C0FDFB",
          panel: "#C0FDFB",
          ink: "#052F5F",
          muted: "#052F5F",
        },
      },
      boxShadow: {
        soft: "0 12px 35px rgba(5, 47, 95, 0.12)",
        float: "0 20px 45px rgba(5, 47, 95, 0.18)",
      },
      backgroundImage: {
        "fintrix-radial":
          "radial-gradient(circle at top left, rgba(192, 253, 251, 0.35), transparent 38%), radial-gradient(circle at bottom right, rgba(5, 47, 95, 0.22), transparent 34%)",
      },
      animation: {
        pulseRing: "pulseRing 2.6s ease-in-out infinite",
        bob: "bob 4s ease-in-out infinite",
      },
      keyframes: {
        pulseRing: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.85" },
          "50%": { transform: "scale(1.08)", opacity: "1" },
        },
        bob: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};
