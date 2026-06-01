/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // The portfolio's "warm minimal" palette. Use these semantic tokens
      // (bg-paper, text-ink, border-rule, etc.) instead of bare hex values.
      // One-off colors (research blue, practice tan, resume's intentional
      // LaTeX-style link blue) are left as inline hex on purpose.
      colors: {
        // Foreground / background neutrals
        ink: "#2C2C2A",          // primary foreground text + dark surfaces
        "ink-deep": "#1a1a1a",   // button hover + image placeholder
        paper: "#FAF9F7",        // page background
        body: "#5F5E5A",         // body copy
        muted: "#888780",        // secondary text
        faint: "#B4B2A9",        // tertiary text + timestamps

        // Borders & dividers
        rule: {
          DEFAULT: "#E8E6E1",    // card / section borders
          soft: "#F5F4F0",       // divide lines inside cards
        },

        // Brand accent (eudaimonic green)
        accent: {
          DEFAULT: "#1D9E75",    // dots, brand colour
          dark: "#0F6E56",       // links + hover targets
          darker: "#085041",     // link hover
          soft: "#E1F5EE",       // featured-tag background
        },

        // Status
        danger: "#B0443C",       // form error text
      },
    },
  },
  plugins: [],
};
