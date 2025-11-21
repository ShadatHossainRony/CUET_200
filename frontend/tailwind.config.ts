import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
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
          foreground: "hsl(var(--primary_foreground))",
          glow: "hsl(var(--primary_glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary_foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive_foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted_foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent_foreground))",
          glow: "hsl(var(--accent_glow))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover_foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card_foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success_foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning_foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar_background))",
          foreground: "hsl(var(--sidebar_foreground))",
          primary: "hsl(var(--sidebar_primary))",
          "primary_foreground": "hsl(var(--sidebar_primary_foreground))",
          accent: "hsl(var(--sidebar_accent))",
          "accent_foreground": "hsl(var(--sidebar_accent_foreground))",
          border: "hsl(var(--sidebar_border))",
          ring: "hsl(var(--sidebar_ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion_down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion_up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion_down": "accordion_down 0.2s ease-out",
        "accordion_up": "accordion_up 0.2s ease-out",
        "fade_in": "fade_in 0.5s ease-out",
        "slide_up": "slide_up 0.5s ease-out",
        "pulse_glow": "pulse_glow 2s ease-in-out infinite",
        "progress": "progress 1.5s ease-out",
      },
      keyframes: {
        ...{
          "accordion_down": {
            from: { height: "0" },
            to: { height: "var(--radix-accordion-content-height)" },
          },
          "accordion_up": {
            from: { height: "var(--radix-accordion-content-height)" },
            to: { height: "0" },
          },
          "fade_in": {
            from: { opacity: "0" },
            to: { opacity: "1" },
          },
          "slide_up": {
            from: { transform: "translateY(20px)", opacity: "0" },
            to: { transform: "translateY(0)", opacity: "1" },
          },
          "pulse_glow": {
            "0%, 100%": { boxShadow: "0 0 20px hsl(var(--primary_glow) / 0.3)" },
            "50%": { boxShadow: "0 0 40px hsl(var(--primary_glow) / 0.6)" },
          },
          "progress": {
            from: { width: "0%" },
            to: { width: "var(--progress_width)" },
          },
        },
      },
      boxShadow: {
        'glow': 'var(--shadow_glow)',
        'sm': 'var(--shadow_sm)',
        'md': 'var(--shadow_md)',
        'lg': 'var(--shadow_lg)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
