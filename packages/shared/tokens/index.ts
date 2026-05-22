export const COLOR_TOKENS = {
  light: {
    background: "0 0% 100%",          // #FFFFFF
    surface: "220 14% 98%",           // #F8FAFC card / panel bg
    surface2: "220 13% 95%",          // #F1F5F9 nested panels
    border: "220 13% 91%",            // #E2E8F0
    textPrimary: "222 47% 11%",       // #0F172A
    textSecondary: "215 20% 35%",     // #475569
    textMuted: "215 16% 47%",         // #64748B
  },
  dark: {
    background: "222 47% 11%",        // #0F172A
    surface: "217 28% 17%",           // #1E293B
    surface2: "220 13% 95%",          // fallback or nested
    border: "215 27.9% 16.9%",        // border color
    textPrimary: "210 20% 98%",
    textSecondary: "217.9 10.6% 64.9%",
    textMuted: "215 16% 47%",
  },
  brand: {
    primary: "234 89% 60%",           // #4F46E5 indigo - main brand
    primaryForeground: "0 0% 100%",
    accent: "14 100% 60%",            // #FF6B35 coral - kudos, celebrations
    success: "142 71% 45%",           // #22C55E - wins, milestones
    warning: "38 92% 50%",            // #F59E0B
    info: "199 89% 48%",              // #0EA5E9 - announcements
    danger: "0 84% 60%",              // #EF4444
  },
  departments: {
    engineering: "217 91% 60%",      // blue
    product: "271 76% 53%",          // purple
    design: "322 81% 56%",           // pink
    hr: "16 100% 60%",               // orange
    sales: "142 71% 45%",            // green
    marketing: "38 92% 50%",         // amber
    finance: "199 89% 48%",          // cyan
    operations: "215 28% 35%",       // slate
  }
} as const;

export const TYPOGRAPHY_TOKENS = {
  fonts: {
    sans: "Inter, sans-serif",
    display: "Plus Jakarta Sans, Inter, sans-serif",
  },
  sizes: {
    xs: "12px",
    sm: "14px",
    base: "16px",
    lg: "18px",
    xl: "20px",
    xxl: "24px",
    xxxl: "30px",
    xxxxl: "36px",
  }
} as const;
