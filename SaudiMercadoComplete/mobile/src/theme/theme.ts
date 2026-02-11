export const theme = {
  colors: {
    bg: '#f5fffb',
    surface: '#ffffff',
    text: '#0f2f3d',
    textMuted: '#4a6572',
    primary: '#14b8a6',
    secondary: '#22d3ee',
    accent: '#7dd3fc',
    border: '#cffafe',
    danger: '#dc2626',
    warning: '#f59e0b',
  },
  gradients: {
    app: ['#ecfeff', '#d1fae5', '#f0fdfa'] as const,
    card: ['#14b8a6', '#22d3ee'] as const,
    hero: ['#14b8a6', '#2dd4bf'] as const,
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
