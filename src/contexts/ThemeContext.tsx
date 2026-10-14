import { createContext, useContext, useState, type ReactNode } from "react";
export type Theme = "dark" | "light";
const key = "odyssey:theme:v1";
export function initializeTheme(): Theme {
  let theme: Theme = "dark";
  try {
    const saved = localStorage.getItem(key);
    theme =
      saved === "light" || saved === "dark"
        ? saved
        : window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark";
  } catch {
    /* Keep the default when storage is unavailable. */
  }
  applyTheme(theme);
  return theme;
}
function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#191a18" : "#f4f0e8");
}
const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
} | null>(null);
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === "light" ? "light" : "dark",
  );
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme-transition", "");
    applyTheme(next);
    setTheme(next);
    try {
      localStorage.setItem(key, next);
    } catch {
      /* Theme still works for this session. */
    }
  };
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("ThemeProvider is required");
  return context;
}
