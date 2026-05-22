/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Dynamic Apple-color tints used across pages (e.g. bg-apple-blue/12, text-apple-blue)
    ...[
      "blue",
      "indigo",
      "purple",
      "pink",
      "red",
      "orange",
      "yellow",
      "green",
      "mint",
      "teal",
      "cyan",
      "gray",
    ].flatMap((c) => [
      `bg-apple-${c}`,
      `bg-apple-${c}/8`,
      `bg-apple-${c}/10`,
      `bg-apple-${c}/12`,
      `bg-apple-${c}/15`,
      `bg-apple-${c}/20`,
      `text-apple-${c}`,
      `border-apple-${c}`,
      `border-apple-${c}/20`,
      `border-apple-${c}/30`,
      `border-apple-${c}/40`,
      `ring-apple-${c}`,
      `from-apple-${c}`,
      `to-apple-${c}`,
      `via-apple-${c}`,
    ]),
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Apple-style brand tokens
        apple: {
          blue: "hsl(var(--apple-blue))",
          indigo: "hsl(var(--apple-indigo))",
          purple: "hsl(var(--apple-purple))",
          pink: "hsl(var(--apple-pink))",
          red: "hsl(var(--apple-red))",
          orange: "hsl(var(--apple-orange))",
          yellow: "hsl(var(--apple-yellow))",
          green: "hsl(var(--apple-green))",
          mint: "hsl(var(--apple-mint))",
          teal: "hsl(var(--apple-teal))",
          cyan: "hsl(var(--apple-cyan))",
          gray: "hsl(var(--apple-gray))",
        },
        brand: {
          primary: "hsl(var(--apple-blue))",
          accent: "hsl(var(--apple-orange))",
          success: "hsl(var(--apple-green))",
          warning: "hsl(var(--apple-yellow))",
          info: "hsl(var(--apple-cyan))",
          danger: "hsl(var(--apple-red))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        // SF Pro stack — falls back to Inter then system
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "SF Pro Display",
          "Inter",
          "system-ui",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Inter",
          "system-ui",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SF Mono",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      boxShadow: {
        // Apple-style elevation
        "apple-xs": "0 0 0 0.5px hsl(0 0% 0% / 0.04), 0 1px 2px hsl(0 0% 0% / 0.05)",
        "apple-sm": "0 0 0 0.5px hsl(0 0% 0% / 0.05), 0 1px 2px hsl(0 0% 0% / 0.04), 0 4px 8px -4px hsl(0 0% 0% / 0.06)",
        "apple": "0 0 0 0.5px hsl(0 0% 0% / 0.05), 0 1px 2px hsl(0 0% 0% / 0.04), 0 8px 24px -12px hsl(0 0% 0% / 0.08)",
        "apple-md": "0 0 0 0.5px hsl(0 0% 0% / 0.06), 0 2px 4px hsl(0 0% 0% / 0.04), 0 12px 32px -12px hsl(0 0% 0% / 0.12)",
        "apple-lg": "0 0 0 0.5px hsl(0 0% 0% / 0.07), 0 4px 8px hsl(0 0% 0% / 0.05), 0 24px 56px -24px hsl(0 0% 0% / 0.18)",
        "apple-xl": "0 0 0 0.5px hsl(0 0% 0% / 0.08), 0 8px 16px hsl(0 0% 0% / 0.06), 0 48px 96px -32px hsl(0 0% 0% / 0.24)",
        glass: "0 8px 32px -12px rgba(0, 0, 0, 0.08)",
        "glass-dark": "0 8px 32px -12px rgba(0, 0, 0, 0.4)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-subtle": "pulse-subtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      transitionTimingFunction: {
        "apple": "cubic-bezier(0.16, 1, 0.3, 1)",
        "apple-spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
}
