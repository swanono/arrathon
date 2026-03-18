import { createContext, useContext } from 'react'
import { useColorScheme } from 'react-native'
import { lightTheme, darkTheme, AppTheme } from './themes'

const ThemeContext = createContext<AppTheme>(lightTheme)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme()
  const theme = scheme === 'dark' ? darkTheme : lightTheme

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export function useTheme(): AppTheme {
  return useContext(ThemeContext)
}
