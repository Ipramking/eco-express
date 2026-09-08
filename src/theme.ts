/** Theme control: light / dark / system, persisted to localStorage. */
export type Theme = "light" | "dark" | "system";

const KEY = "eco_theme";

export function getTheme(): Theme {
  const t = localStorage.getItem(KEY);
  return t === "light" || t === "dark" ? t : "system";
}

export function applyTheme(t: Theme): void {
  const root = document.documentElement;
  if (t === "system") {
    root.removeAttribute("data-theme");
    localStorage.removeItem(KEY);
  } else {
    root.setAttribute("data-theme", t);
    localStorage.setItem(KEY, t);
  }
}
