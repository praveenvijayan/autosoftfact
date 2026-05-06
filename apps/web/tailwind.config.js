/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // ── Design System Color Tokens ──────────────────────────────────────
      colors: {
        bg: {
          primary: "#F5F7FB", // App background
          surface: "#FFFFFF", // Cards / list items
          hover: "#F0F4FF",   // Hover state
        },
        border: {
          default: "#E5EAF3", // Borders
        },
        text: {
          primary: "#1E293B",   // Main text
          secondary: "#64748B", // Secondary text
        },
        accent: {
          primary: "#2563EB", // CTA / active
          soft: "#DBEAFE",    // Active background
        },
        success: "#16A34A", // Completed
        danger: "#DC2626",  // Delete
      },

      // ── Design System Spacing Tokens ────────────────────────────────────
      // xs=4, sm=8, md=12, lg=16, xl=24, 2xl=32, 3xl=48
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
        "3xl": "48px",
      },

      // ── Font Family ─────────────────────────────────────────────────────
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },

      // ── Border Radius ───────────────────────────────────────────────────
      borderRadius: {
        card: "0.75rem", // 12px — cards, inputs
        pill: "9999px",  // filter tabs
        checkbox: "0.375rem", // 6px — checkboxes
      },

      // ── Box Shadow ──────────────────────────────────────────────────────
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};
