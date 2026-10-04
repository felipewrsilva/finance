/**
 * Programmatic design tokens for charts, SVG, and non-CSS consumers.
 * Hex fallbacks match light-theme values in globals.css (:root).
 */
export const tokens = {
  color: {
    background: "#ffffff",
    foreground: "#171717",
    surface: "#ffffff",
    surfaceMuted: "#f9fafb",
    surfaceElevated: "#ffffff",
    text: "#171717",
    textSecondary: "#4b5563",
    textMuted: "#9ca3af",
    textInverse: "#ffffff",
    border: "#e5e7eb",
    borderStrong: "#d1d5db",
    primary: "#4f46e5",
    primaryHover: "#4338ca",
    primarySubtle: "#eef2ff",
    success: "#059669",
    successHover: "#047857",
    successSubtle: "#ecfdf5",
    warning: "#d97706",
    warningHover: "#b45309",
    warningSubtle: "#fffbeb",
    danger: "#ef4444",
    dangerHover: "#dc2626",
    dangerSubtle: "#fef2f2",
    investment: "#7c3aed",
    investmentHover: "#6d28d9",
    investmentSubtle: "#f5f3ff",
  },
  shadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    numeric: "0.875rem",
  },
  /** CSS custom property names for runtime `var(...)` usage when available. */
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
