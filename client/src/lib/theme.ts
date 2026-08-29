// Theme (dark mode) helpers. The chosen theme is stored in localStorage and
// applied by toggling the `dark` class on <html> (see index.css `:root.dark`).

const THEME_KEY = 'theme';

export const getTheme = (): 'light' | 'dark' =>
  localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';

export function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function setTheme(theme: 'light' | 'dark') {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}

// Call once on app startup so the saved theme survives reloads.
export function initTheme() {
  applyTheme(getTheme());
}
