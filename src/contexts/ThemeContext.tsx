import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type ThemeType = 'dark' | 'light' | 'dracula';

interface ThemeColors {
  bg: string;
  bgSecondary: string;
  bgTertiary: string;
  border: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentHover: string;
  error: string;
  success: string;
  warning: string;
}

const themes: Record<ThemeType, ThemeColors> = {
  dark: {
    bg: '#1e1e1e',
    bgSecondary: '#252526',
    bgTertiary: '#2a2d2e',
    border: '#3e3e42',
    text: '#d4d4d4',
    textSecondary: '#858585',
    accent: '#007acc',
    accentHover: '#1a8cd8',
    error: '#f48771',
    success: '#89d185',
    warning: '#e5c07b',
  },
  light: {
    bg: '#ffffff',
    bgSecondary: '#f3f3f3',
    bgTertiary: '#e8e8e8',
    border: '#d4d4d4',
    text: '#000000',
    textSecondary: '#6e6e6e',
    accent: '#0066cc',
    accentHover: '#005bb5',
    error: '#e51400',
    success: '#388a34',
    warning: '#bf8803',
  },
  dracula: {
    bg: '#282a36',
    bgSecondary: '#21222c',
    bgTertiary: '#191a21',
    border: '#44475a',
    text: '#f8f8f2',
    textSecondary: '#6272a4',
    accent: '#bd93f9',
    accentHover: '#d4b5ff',
    error: '#ff5555',
    success: '#50fa7b',
    warning: '#f1fa8c',
  },
};

interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('vyzer-theme');
    return (saved as ThemeType) || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('vyzer-theme', theme);
    
    // Aplica CSS variables globalmente
    const root = document.documentElement;
    const colors = themes[theme];
    
    root.style.setProperty('--bg', colors.bg);
    root.style.setProperty('--bg-secondary', colors.bgSecondary);
    root.style.setProperty('--bg-tertiary', colors.bgTertiary);
    root.style.setProperty('--border', colors.border);
    root.style.setProperty('--text', colors.text);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--accent-hover', colors.accentHover);
    root.style.setProperty('--error', colors.error);
    root.style.setProperty('--success', colors.success);
    root.style.setProperty('--warning', colors.warning);
  }, [theme]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, colors: themes[theme], setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
