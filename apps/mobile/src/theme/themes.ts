import { palette, spacing, typography, borderRadius, shadows } from './tokens'

export type AppTheme = {
  colors: {
    primary: string
    primaryDark: string
    background: string
    surface: string
    surfaceElevated: string
    navy: string
    navyMuted: string
    border: string
    error: string
    success: string
    white: string
  }
  spacing: typeof spacing
  typography: typeof typography
  borderRadius: typeof borderRadius
  shadows: typeof shadows
}

export const lightTheme: AppTheme = {
  colors: {
    primary: palette.green[500],
    primaryDark: palette.green[700],
    background: palette.white,
    surface: palette.slate[50],
    surfaceElevated: palette.white,
    navy: palette.navy[900],
    navyMuted: palette.navy[400],
    border: palette.slate[200],
    error: palette.red[500],
    success: palette.green[500],
    white: palette.white,
  },
  spacing,
  typography,
  borderRadius,
  shadows,
}

export const darkTheme: AppTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: palette.navy[900],
    surface: palette.navy[800],
    surfaceElevated: palette.navy[700],
    navyMuted: palette.navy[300],
    border: palette.navy[500],
  },
}
