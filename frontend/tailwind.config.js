/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6C5CE7",
          dark: "#5A4BD1",
          light: "#8B5CF6",
          bg: "#F0EEFF",
        },
        success: { DEFAULT: "#22C55E", bg: "#ECFDF5" },
        warning: { DEFAULT: "#F59E0B", bg: "#FFFBEB" },
        danger: { DEFAULT: "#EF4444", bg: "#FEF2F2" },
        surface: "#FFFFFF",
        appbg: "#F8FAFC",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: {
        sm: "10px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.04)",
        md: "0 4px 16px rgba(0,0,0,0.06)",
        lg: "0 12px 40px rgba(0,0,0,0.08)",
        xl: "0 20px 60px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};
