import React, { createContext, useContext, useEffect } from 'react';

export type ThemeMode = 'dark';

interface ThemeContextType {
  theme: 'dark';
  resolvedTheme: 'dark';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Pure Dark Mode only: Remove any legacy light mode classes and localStorage overrides
    try {
      localStorage.removeItem('poojaspace_theme');
    } catch {
      // Ignore in restricted iframe / storage environments
    }

    const root = document.documentElement;
    root.classList.remove('light', 'theme-light');
    root.classList.add('dark');

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', '#09090E');
    }
  }, []);

  const value: ThemeContextType = {
    theme: 'dark',
    resolvedTheme: 'dark',
    setTheme: () => {},
    toggleTheme: () => {},
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};

