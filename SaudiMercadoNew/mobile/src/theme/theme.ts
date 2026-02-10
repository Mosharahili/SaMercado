import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const theme = {
  colors: {
    primary: '#16a34a', // green-600
    primaryLight: '#22c55e', // green-500
    primaryDark: '#15803d', // green-700
    secondary: '#f59e0b', // amber-500
    accent: '#06b6d4', // cyan-500
    background: '#f8fafc', // slate-50
    surface: '#ffffff',
    text: '#1e293b', // slate-800
    textSecondary: '#64748b', // slate-500
    border: '#e2e8f0', // slate-200
    error: '#dc2626', // red-600
    success: '#16a34a',
    warning: '#f59e0b',
    info: '#06b6d4',
  },
  gradients: {
    primary: ['#16a34a', '#22c55e'],
    secondary: ['#f59e0b', '#fbbf24'],
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  dimensions: {
    width,
    height,
  },
  isRTL: true, // Arabic RTL
};