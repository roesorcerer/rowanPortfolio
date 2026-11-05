/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // The values live in index.css (the admin's palette) and site/site.css
      // (the public site's light and dark themes).
      //
      // The portfolio's "warm minimal" palette. Use these semantic tokens
      // (bg-paper, text-ink, border-rule, etc.) instead of bare hex values.
      // One-off colors (research blue, practice tan, resume's intentional
      // LaTeX-style link blue) are left as inline hex on purpose.
      colors: {
        // Foreground / background neutrals
        surface: "rgb(var(--c-surface) / <alpha-value>)", // a card on the page
        ink: "rgb(var(--c-ink) / <alpha-value>)",          // primary foreground text + dark surfaces
        "ink-deep": "rgb(var(--c-ink-deep) / <alpha-value>)",   // button hover + image placeholder
        paper: "rgb(var(--c-paper) / <alpha-value>)",        // page background
        body: "rgb(var(--c-body) / <alpha-value>)",         // body copy
        muted: "rgb(var(--c-muted) / <alpha-value>)",        // secondary text
        faint: "rgb(var(--c-faint) / <alpha-value>)",        // tertiary text + timestamps

        // Borders & dividers
        rule: {
          DEFAULT: "rgb(var(--c-rule) / <alpha-value>)",    // card / section borders
          soft: "rgb(var(--c-rule-soft) / <alpha-value>)",       // divide lines inside cards
        },

        // Brand accent (eudaimonic green)
        accent: {
          DEFAULT: "rgb(var(--c-accent) / <alpha-value>)",    // dots, brand colour
          dark: "rgb(var(--c-accent-dark) / <alpha-value>)",       // links + hover targets
          darker: "rgb(var(--c-accent-darker) / <alpha-value>)",     // link hover
          soft: "rgb(var(--c-accent-soft) / <alpha-value>)",       // featured-tag background
        },

        // Status
        danger: "rgb(var(--c-danger) / <alpha-value>)",       // form error text
      },
    },
  },
  plugins: [],
};
