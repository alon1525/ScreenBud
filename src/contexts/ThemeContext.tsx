import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { MMKV } from 'react-native-mmkv';
import { Colors } from '../constants/colors';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  colors: typeof Colors;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const storage = new MMKV({ id: 'theme-storage' });
const THEME_KEY = 'app-theme';

const lightColors = Colors;

const darkColors = {
  ...Colors,
  background: Colors.backgroundDark,
  cardBackground: Colors.cardBackgroundDark,
  text: Colors.textLight,
  textSecondary: Colors.gray,
  white: Colors.dark,
  lightGray: '#4A4A4A',
  border: '#4A4A4A',
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = storage.getString(THEME_KEY);
    return (savedTheme as Theme) || 'auto';
  });
  
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    storage.set(THEME_KEY, newTheme);
  };
  
  const isDark = theme === 'dark' || (theme === 'auto' && systemColorScheme === 'dark');
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, isDark, colors, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

