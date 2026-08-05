/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  // prefix: 'tw-',
  // corePlugins: {
  //   preflight: false,
  // },
  theme: {
    container: {
      screens: {
        sm: "576px",
        md: "728px",
        lg: "992px",
        xl: "1200px",
        "2xl": "1440px",
      },
    },
    screens: {
      "2xl": "1440px",
      xl: { max: "1200px" },
      lg: { max: "992px" },
      md: { max: "728px" },
      sm: { max: "576px" },
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "var(--bg-surface)",
      black: "var(--text-primary)",
      canvas: "var(--bg-canvas)",
      surface: "var(--bg-surface)",
      elevated: "var(--bg-elevated)",
      subtle: "var(--bg-subtle)",
      primary: "var(--text-primary)",
      secondary: "var(--text-secondary)",
      muted: "var(--text-muted)",
      action: "var(--action-primary)",
      border: "var(--border-default)",
    },
    extend: {
      fontFamily: {
        gilroy: ["Gilroy", "sans-serif"],
      },
    },
  },
};
