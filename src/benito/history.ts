// BenitoTools: cronologia dei file prodotti (scaricati o condivisi).
// Tiene gli ultimi 30 file e al massimo ~500 MB, tutto sul dispositivo.
import { HISTORY_STORE, tx } from './db';
import { isHistoryEnabled } from './settings';
import { getCurrentTool } from './currentTool';

export const MAX_HISTORY_ITEMS = 30;
export const MAX_HISTORY_BYTES = 500 * 1024 * 1024;

export interface HistoryItem {
  id: string;
  name: string;
  type: string;
  size: number;
  date: number;
  toolPath?: string;
  toolName?: string;
  blob: Blob;
}

type Listener = () => void;
const listeners = new Set<Listener>();
export function onHistoryChange(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}
const notify = () => listeners.forEach((l) => l());

export async function listHistory(): Promise<HistoryItem[]> {
  const all = ((await tx<HistoryItem[]>(HISTORY_STORE, 'readonly', (s) =>
    s.getAll()
  )) ?? []) as HistoryItem[];
  return all.sort((a, b) => b.date - a.date);
}

export async function addToHistory(file: File | Blob, name?: string) {
  if (!isHistoryEnabled()) return;
  try {
    const fileName = name ?? (file instanceof File ? file.name : 'file');
    const tool = getCurrentTool();
    const existing = await listHistory();
    // Stesso file appena salvato (doppio tocco): non duplicare.
    if (
      existing[0] &&
      existing[0].name === fileName &&
      existing[0].size === file.size &&
      Date.now() - existing[0].date < 10000
    )
      return;
    if (file.size > MAX_HISTORY_BYTES) return;
    const item: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: fileName,
      type: file.type || 'application/octet-stream',
      size: file.size,
      date: Date.now(),
      toolPath: tool?.path,
      toolName: tool?.name,
      blob: file
    };
    await tx(HISTORY_STORE, 'readwrite', (s) => s.put(item));
    await prune();
    notify();
  } catch (e) {
    console.warn('BenitoTools: cronologia non salvata', e);
  }
}

async function prune() {
  const items = await listHistory();
  let total = 0;
  const remove: string[] = [];
  items.forEach((it, i) => {
    total += it.size;
    if (i >= MAX_HISTORY_ITEMS || total > MAX_HISTORY_BYTES) remove.push(it.id);
  });
  for (const id of remove) {
    await tx(HISTORY_STORE, 'readwrite', (s) => s.delete(id));
  }
}

export async function deleteHistoryItem(id: string) {
  await tx(HISTORY_STORE, 'readwrite', (s) => s.delete(id));
  notify();
}

export async function clearHistory() {
  await tx(HISTORY_STORE, 'readwrite', (s) => s.clear());
  notify();
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
