// BenitoTools: impostazioni locali (solo su questo dispositivo).
const HISTORY_ENABLED_KEY = 'benito.historyEnabled';

export function isHistoryEnabled(): boolean {
  try {
    return localStorage.getItem(HISTORY_ENABLED_KEY) !== 'false';
  } catch {
    return true;
  }
}

export function setHistoryEnabled(value: boolean) {
  try {
    localStorage.setItem(HISTORY_ENABLED_KEY, String(value));
  } catch {
    /* ignora */
  }
}
