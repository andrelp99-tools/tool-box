// BenitoTools: permette alle impostazioni di cambiare il tema dell'app.
export type ThemeMode = 'dark' | 'light' | 'system';
export const THEME_EVENT = 'benito-theme';

export function getThemeMode(): ThemeMode {
  try {
    return (localStorage.getItem('theme') as ThemeMode) || 'system';
  } catch {
    return 'system';
  }
}

export function setThemeMode(mode: ThemeMode) {
  try {
    localStorage.setItem('theme', mode);
  } catch {
    /* ignora */
  }
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: mode }));
}
