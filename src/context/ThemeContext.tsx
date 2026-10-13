import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'dark' | 'light' | 'auto';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'dark' | 'light';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('poojaspace_theme') as ThemeMode | null;
    return saved === 'light' || saved === 'dark' || saved === 'auto' ? saved : 'dark';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let active: 'dark' | 'light';
      if (theme === 'auto') {
        active = media.matches ? 'dark' : 'light';
      } else {
        active = theme;
      }

      setResolvedTheme(active);

      const root = document.documentElement;
      if (active === 'light') {
        root.classList.remove('dark');
        root.classList.add('light', 'theme-light');
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#FAF8F5');
      } else {
        root.classList.remove('light', 'theme-light');
        root.classList.add('dark');
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#09090B');
      }
    };

    applyTheme();

    const listener = () => {
      if (theme === 'auto') applyTheme();
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('poojaspace_theme', newTheme);
  };

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('auto');
    else setTheme('dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};
