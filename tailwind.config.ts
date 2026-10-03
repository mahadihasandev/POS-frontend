import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border, 217.2 32.6% 17.5%))",
        background: "hsl(var(--background, 222.2 84% 4.9%))",
        foreground: "hsl(var(--foreground, 210 40% 98%))",
        card: {
          DEFAULT: "hsl(var(--card, 222.2 84% 4.9%))",
          foreground: "hsl(var(--card-foreground, 210 40% 98%))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary, 243.4 75.4% 58.6%))",
          foreground: "hsl(var(--primary-foreground, 0 0% 100%))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted, 217.2 32.6% 17.5%))",
          foreground: "hsl(var(--muted-foreground, 215 20.2% 65.1%))",
        },
      },
      gridTemplateColumns: {
        pos: "minmax(0, 60fr) minmax(0, 40fr)",
      },
    },
  },
  plugins: [],
};

export default config;
