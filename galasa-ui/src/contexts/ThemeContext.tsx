/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeType = 'white' | 'g100';

interface ThemeContextValue {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children, initialTheme }: { children: React.ReactNode; initialTheme?: ThemeType }) {
  const [theme, setThemeState] = useState<ThemeType>(initialTheme || 'g100');

  useEffect(() => {
    if (!initialTheme) {
      document.body.setAttribute('data-carbon-theme', theme);
    }
  }, [initialTheme]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    document.body.setAttribute('data-carbon-theme', newTheme);
    document.cookie = `theme=${newTheme};path=/;max-age=${60 * 60 * 24 * 365}`;
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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
