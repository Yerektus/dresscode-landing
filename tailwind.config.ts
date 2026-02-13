import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#050505", // Deep Black
        surface: {
          DEFAULT: "#121212", // Dark Grey
          highlight: "#1E1E1E", // Lighter Grey
        },
        primary: {
          DEFAULT: "#FFFFFF",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#A1A1AA", // Zinc 400
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#8A6CD9", // Soft Violet
          glow: "#AE97EA", // Soft Violet Glow
        },
        brand: {
          ink: "#0b0f1a",
          neon: "#18f1ff",
          coral: "#ff5f7a",
          sky: "#6ca9ff",
          mist: "#dbe6ff"
        },
        higgs: {
          bg: "#0F1113",
          primary: "#8A6CD9",
          "text-muted": "#A1A1AA"
        }
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 20px rgba(138, 108, 217, 0.38)",
        "glass-inset": "inset 0 0 20px rgba(255, 255, 255, 0.05)",
        panel: "0 24px 48px rgba(0,0,0,0.5)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        reveal: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 20px rgba(138, 108, 217, 0.38)" },
          "50%": { opacity: "0.85", boxShadow: "0 0 28px rgba(138, 108, 217, 0.52)" }
        }
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        reveal: "reveal 700ms ease-out both",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
