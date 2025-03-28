'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  
  try {
    // First check localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme === 'dark') return 'dark';
    if (savedTheme === 'light') return 'light';
    
    // Then check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch (e) {
    console.warn('Failed to get theme preference:', e);
  }
  
  return 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize state but don't render until mounted
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>('light'); // Start with light theme for SSR

  useEffect(() => {
    // Set the actual theme once mounted
    setTheme(getInitialTheme());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    try {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.warn('Failed to update theme:', e);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Provide the context with a stable value
  const value = React.useMemo(() => ({
    theme,
    toggleTheme
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 