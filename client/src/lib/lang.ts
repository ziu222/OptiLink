// Language preference. Stored in localStorage and reflected on <html lang>.
// No translation layer yet — this only persists the choice and tags the
// document so a future i18n setup can read it. Mirrors lib/theme.ts.

const LANG_KEY = 'lang';

export type Lang = 'en' | 'vi';

export const getLang = (): Lang =>
  localStorage.getItem(LANG_KEY) === 'vi' ? 'vi' : 'en';

export function applyLang(lang: Lang) {
  document.documentElement.lang = lang;
}

export function setLang(lang: Lang) {
  localStorage.setItem(LANG_KEY, lang);
  applyLang(lang);
}

// Call once on app startup so the saved language survives reloads.
export function initLang() {
  applyLang(getLang());
}
