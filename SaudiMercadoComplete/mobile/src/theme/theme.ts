export const theme = {
  colors: {
    bg: '#f2fbf4',
    surface: '#ffffff',
    text: '#123524',
    textMuted: '#4b6a5a',
    primary: '#2f9e44',
    secondary: '#69db7c',
    accent: '#b2f2bb',
    border: '#d3f9d8',
    danger: '#dc2626',
    warning: '#f59e0b',
  },
  gradients: {
    app: ['#e7f8ec', '#d8f8df', '#f4fcf6'] as const,
    card: ['#2f9e44', '#69db7c'] as const,
    hero: ['#237a3a', '#52b36a'] as const,
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
