"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const match = document.cookie.match(/(?:^|; )theme=([^;]*)/);
    let currentTheme: Theme = "dark";
    
    if (match && (match[1] === "dark" || match[1] === "light")) {
      currentTheme = match[1] as Theme;
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      currentTheme = "light";
      document.cookie = `theme=light; max-age=31536000; path=/`;
    } else {
      document.cookie = `theme=dark; max-age=31536000; path=/`;
    }
    
    setTheme(currentTheme);
    document.documentElement.setAttribute("data-theme", currentTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.cookie = `theme=${newTheme}; max-age=31536000; path=/`;
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  // Prevent flash by hiding until hydration is checked (only visible after mounting)
  // We STILL wrap the children in Context provider so child components don't crash when calling useTheme
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div style={{ visibility: mounted ? "visible" : "hidden", display: "contents" }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}


export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
