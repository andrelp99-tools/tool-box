// BenitoTools: ricorda lo strumento aperto (per la cronologia) e i più usati di recente.
let current: { path: string; name: string } | null = null;
const RECENT_KEY = 'benito.recentTools';
const MAX_RECENT = 8;

export function setCurrentTool(path: string, name: string) {
  current = { path, name };
  try {
    const list = getRecentToolPaths().filter((p) => p !== path);
    localStorage.setItem(RECENT_KEY, [path, ...list].slice(0, MAX_RECENT).join(','));
  } catch {
    /* ignora */
  }
}

export function getCurrentTool() {
  return current;
}

export function getRecentToolPaths(): string[] {
  try {
    return (localStorage.getItem(RECENT_KEY) ?? '').split(',').filter(Boolean);
  } catch {
    return [];
  }
}
