export const lightTheme = {
  colors: {
    primary: '#00C853',
    primaryDark: '#00963D', // shadow color for 3D buttons
    background: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceElevated: '#FFFFFF',
    navy: '#0F172A',
    navyMuted: '#64748B',
    border: '#E2E8F0',
    error: '#EF4444',
    success: '#00C853',
    white: '#FFFFFF',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    weightNormal: '400' as const,
    weightMedium: '500' as const,
    weightSemiBold: '600' as const,
    weightBold: '700' as const,
    weightExtraBold: '800' as const,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  // 3D button shadow — use sparingly for WOW effect
  shadows: {
    btn3dPrimary: {
      shadowColor: '#00963D',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
    btn3dWhite: {
      shadowColor: '#CBD5E1',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
    card: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
  },
}

export const darkTheme: typeof lightTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: '#0F172A',
    surface: '#1E293B',
    surfaceElevated: '#293548',
    navyMuted: '#94A3B8',
    border: '#334155',
    white: '#FFFFFF',
  },
}

export type AppTheme = typeof lightTheme
