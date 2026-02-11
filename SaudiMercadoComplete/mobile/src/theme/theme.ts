export const theme = {
  colors: {
    bg: '#f4fff6',
    surface: '#ffffff',
    text: '#052e16',
    textMuted: '#3f5f4a',
    primary: '#16a34a',
    secondary: '#22c55e',
    accent: '#84cc16',
    border: '#dcfce7',
    danger: '#dc2626',
    warning: '#f59e0b',
  },
  gradients: {
    app: ['#052e16', '#14532d', '#16a34a'] as const,
    card: ['#16a34a', '#22c55e'] as const,
    hero: ['#14532d', '#22c55e'] as const,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 20,
    pill: 999,
  },
  shadow: {
    card: {
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
  },
};
