// src/context/ThemeProvider.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface Colors {
  // Orange Shades (Primary Brand Colors)
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Background Colors
  background: string;
  surface: string;
  
  // Text Colors
  text: string;
  textSecondary: string;
  
  // UI Colors
  border: string;
  success: string;
  error: string;
  warning: string;
  info: string;
}

interface Theme {
  colors: Colors;
  fonts: {
    brand: string;        // StrokeWeight for branding
    heading: string;      // StrokeWeight for headings
    body: string;         // Roboto for body text
    bodyMedium: string;   // Roboto Medium
    bodyBold: string;     // Roboto Bold
  };
}

const lightTheme: Theme = {
  colors: {
    // Orange Brand Colors
    primary: '#FF8C42',        // Main orange from your logo
    primaryLight: '#FFB366',   // Lighter orange
    primaryDark: '#E67429',    // Darker orange
    
    // Backgrounds
    background: '#FFFFFF',
    surface: '#F8F9FA',
    
    // Text
    text: '#1A1A1A',
    textSecondary: '#6B6B6B',
    
    // UI Elements
    border: '#E5E5E5',
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
  },
  fonts: {
    brand: 'strokeWeight-120-rotate-6',     // For main branding
    heading: 'strokeWeight-80-rotate-12',   // For headings
    body: 'Roboto-Regular',
    bodyMedium: 'Roboto-Medium',
    bodyBold: 'Roboto-Bold',
  },
};

const darkTheme: Theme = {
  colors: {
    // Orange Brand Colors (same)
    primary: '#FF8C42',
    primaryLight: '#FFB366',
    primaryDark: '#E67429',
    
    // Dark Backgrounds
    background: '#121212',
    surface: '#1E1E1E',
    
    // Dark Text
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    
    // Dark UI Elements
    border: '#2C2C2C',
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
  },
  fonts: {
    brand: 'strokeWeight-120-rotate-6',
    heading: 'strokeWeight-80-rotate-12',
    body: 'Roboto-Regular',
    bodyMedium: 'Roboto-Medium',
    bodyBold: 'Roboto-Bold',
  },
};

interface ThemeContextType {
  theme: Theme;
  colors: Colors;
  fonts: Theme['fonts'];
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      if (themeMode === 'system') {
        setIsDark(Appearance.getColorScheme() === 'dark');
      } else {
        setIsDark(themeMode === 'dark');
      }
    };

    updateTheme();
    
    if (themeMode === 'system') {
      const subscription = Appearance.addChangeListener(updateTheme);
      return () => subscription?.remove();
    }
  }, [themeMode]);

  const theme = isDark ? darkTheme : lightTheme;

  const value: ThemeContextType = {
    theme,
    colors: theme.colors,
    fonts: theme.fonts,
    themeMode,
    isDark,
    setThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
