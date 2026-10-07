import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#E2001A",
          pressed: "#B00014",
          tint: "#FCE6E9",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          muted: "#6B6B6B",
          faint: "#9A9A9A",
        },
        canvas: "#F4F4F5",
        line: "#E7E7E7",
        hairline: "#ECECEC",
        success: { DEFAULT: "#0F7A3D", bg: "#E4F5EA" },
        info: { DEFAULT: "#1457B8", bg: "#E6EFFB" },
        warn: { DEFAULT: "#9A5B00", bg: "#FBEFD9", border: "#F3DCAE" },
        danger: { DEFAULT: "#C2121F", bg: "#FBE7E9" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,.04)",
        phone: "0 12px 34px rgba(0,0,0,.16)",
      },
      borderRadius: {
        phone: "30px",
      },
    },
  },
  plugins: [],
};

export default config;
