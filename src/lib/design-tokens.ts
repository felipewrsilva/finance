/**
 * Programmatic design tokens for charts, SVG, and non-CSS consumers.
 * Hex fallbacks match light-theme values in globals.css (:root).
 */
export const tokens = {
  color: {
    background: "#f3eee4",
    foreground: "#1c1915",
    surface: "#faf6ee",
    surfaceMuted: "#ebe4d6",
    surfaceElevated: "#fffdf8",
    text: "#1c1915",
    textSecondary: "#5c5348",
    textMuted: "#8a8073",
    textInverse: "#faf6ee",
    border: "#ddd4c4",
    borderStrong: "#c4b8a4",
    primary: "#b5441f",
    primaryHover: "#933616",
    primarySubtle: "#f3ddd3",
    success: "#3d5a3c",
    successHover: "#2f462e",
    successSubtle: "#dfe8dc",
    warning: "#c48a2a",
    warningHover: "#a06e1c",
    warningSubtle: "#f5e6c8",
    danger: "#b5441f",
    dangerHover: "#933616",
    dangerSubtle: "#f3ddd3",
    investment: "#3d5a3c",
    investmentHover: "#2f462e",
    investmentSubtle: "#dfe8dc",
  },
  shadow: {
    sm: "0 1px 0 rgb(28 25 21 / 0.06)",
    md: "0 12px 40px rgb(28 25 21 / 0.06)",
    lg: "0 20px 50px rgb(28 25 21 / 0.08)",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1.0625rem",
    lg: "1.125rem",
    xl: "1.35rem",
    "2xl": "1.75rem",
    numeric: "1.125rem",
  },
  cssVar: {
    primary: "var(--primary)",
    success: "var(--success)",
    warning: "var(--warning)",
    danger: "var(--danger)",
    investment: "var(--investment)",
    text: "var(--text)",
    textMuted: "var(--text-muted)",
    border: "var(--border)",
    surface: "var(--surface)",
  },
} as const;

export type DesignTokens = typeof tokens;
