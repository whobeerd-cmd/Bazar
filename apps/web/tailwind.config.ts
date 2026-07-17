import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Паттерн "hsl(var(--x) / <alpha-value>)" — чтобы модификаторы прозрачности
        // (bg-primary/10 и т.п.) работали корректно поверх CSS-переменных.
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: "hsl(var(--primary) / <alpha-value>)",
        "primary-foreground": "hsl(var(--primary-foreground) / <alpha-value>)",
        "primary-hover": "hsl(var(--primary-hover) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
        "muted-foreground": "hsl(var(--muted-foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        "border-strong": "hsl(var(--border-strong) / <alpha-value>)",
        accent: "hsl(var(--accent) / <alpha-value>)",
        "accent-foreground": "hsl(var(--accent-foreground) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-golos)", "-apple-system", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
      },
      boxShadow: {
        card: "0 1px 2px hsl(var(--foreground) / 0.04), 0 1px 12px hsl(var(--foreground) / 0.05)",
        "card-hover": "0 4px 10px hsl(var(--foreground) / 0.05), 0 10px 28px hsl(var(--foreground) / 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
