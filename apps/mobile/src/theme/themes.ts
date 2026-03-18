import { palette, spacing, typography, borderRadius, shadows } from './tokens'

export const lightTheme = {
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
} as const

export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: palette.navy[900],
    surface: palette.navy[800],
    surfaceElevated: palette.navy[700],
    navyMuted: palette.navy[300],
    border: palette.navy[500],
  },
} as const

export type AppTheme = typeof lightTheme
