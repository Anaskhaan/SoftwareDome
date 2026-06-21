/**
 * Source-of-truth design tokens for SoftwareDome.
 * Mirrors the CSS variables in app/globals.css — use this file when you need
 * token values in TS/JS logic (charts, inline styles, status maps), and use
 * the Tailwind utilities (bg-brand-green, text-status-danger, etc.) in JSX.
 * Keep both in sync if either changes.
 */

export const colors = {
  brand: {
    green: "#5fc24a",
    greenLight: "#7cd45e",
    greenDark: "#48a637",
  },
  green: {
    50: "#f1fbed",
    100: "#ddf5d3",
    200: "#bdeaab",
    300: "#97e07f",
    400: "#7cd45e",
    500: "#5fc24a",
    600: "#48a637",
    700: "#3a872c",
    800: "#2f6c25",
    900: "#245420",
  },
  navy: {
    50: "#eef2f7",
    100: "#d7e0ea",
    200: "#aebdd0",
    300: "#7e93b1",
    400: "#4d6790",
    500: "#2a4570",
    600: "#16304f",
    700: "#0e2238",
    800: "#0a192f",
    900: "#050d1a",
  },
  surface: {
    base: "#ffffff",
    muted: "#f7faf6",
    sunken: "#f1f5f1",
  },
  border: {
    subtle: "#e7ede6",
  },
  text: {
    primary: "#0a192f",
    muted: "#5b6b63",
  },
  status: {
    success: "#48a637",
    successBg: "#f1fbed",
    warning: "#b45309",
    warningBg: "#fef3e2",
    danger: "#c0341f",
    dangerBg: "#fdeeec",
    info: "#2a4570",
    infoBg: "#eef2f7",
  },
} as const;

export const fonts = {
  brand: "var(--font-sora)", // headings, KPI numbers, nav labels
  sans: "var(--font-geist-sans)", // body text
  mono: "var(--font-geist-mono)", // metadata, timestamps, codes
} as const;

export const radius = {
  sm: "0.5rem", // 8px  — inputs, small chips
  md: "0.75rem", // 12px — buttons, badges
  lg: "1rem", // 16px — cards, modals
  xl: "1.5rem", // 24px — page-level surfaces, hero cards
  full: "9999px", // pills, avatars
} as const;

export const spacingScale = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64] as const;

export const shadow = {
  sm: "0 1px 2px 0 rgba(10,25,47,0.05)",
  md: "0 4px 12px -2px rgba(10,25,47,0.08)",
  lg: "0 16px 36px -18px rgba(95,194,74,0.35)", // brand-tinted, for hover states
  focus: "0 0 0 3px rgba(95,194,74,0.25)",
} as const;

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

/** Maps a status tone to its fg/bg token pair — used by StatusPill/Badge. */
export const statusTone: Record<StatusTone, { fg: string; bg: string }> = {
  success: { fg: colors.status.success, bg: colors.status.successBg },
  warning: { fg: colors.status.warning, bg: colors.status.warningBg },
  danger: { fg: colors.status.danger, bg: colors.status.dangerBg },
  info: { fg: colors.status.info, bg: colors.status.infoBg },
  neutral: { fg: colors.text.muted, bg: colors.surface.sunken },
};
