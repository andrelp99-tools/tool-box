// BenitoTools: file arrivati da "Condividi con BenitoTools" (salvati dal service worker)
// e "passaggio" del file allo strumento scelto.
import { SHARED_STORE, tx } from './db';

export interface SharedEntry {
  id: string;
  files: File[];
  text?: string;
  date: number;
}

export async function getSharedEntry(id: string): Promise<SharedEntry | undefined> {
  return (await tx<SharedEntry>(SHARED_STORE, 'readonly', (s) => s.get(id))) as
    | SharedEntry
    | undefined;
}

export async function deleteSharedEntry(id: string) {
  await tx(SHARED_STORE, 'readwrite', (s) => s.delete(id));
}

/** Pulisce le condivisioni più vecchie di un giorno. */
export async function cleanupShared() {
  const all = ((await tx<SharedEntry[]>(SHARED_STORE, 'readonly', (s) => s.getAll())) ??
    []) as SharedEntry[];
  for (const e of all) {
    if (Date.now() - e.date > 24 * 3600 * 1000) await deleteSharedEntry(e.id);
  }
}

// File in attesa di essere caricati nello strumento aperto dopo la condivisione
// (o da "Apri con..." dalla cronologia).
let pending: File[] = [];
export function setPendingFiles(files: File[]) {
  pending = files;
}

/** Prende (e consuma) i file in attesa che corrispondono ai tipi accettati. */
export function takePendingFiles(accept: string[]): File[] {
  if (pending.length === 0) return [];
  const ok = pending.filter((f) => matchesAccept(f, accept));
  if (ok.length > 0) pending = [];
  return ok;
}

export function matchesAccept(file: File, accept: string[]): boolean {
  if (!accept || accept.length === 0) return true;
  const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
  return accept.some((a) => {
    const t = a.trim().toLowerCase();
    if (t === '*' || t === '*/*') return true;
    if (t.startsWith('.')) return t === ext;
    if (t.endsWith('/*')) return file.type.startsWith(t.slice(0, -1));
    return t === file.type;
  });
}

let pendingText: string | null = null;
export function setPendingText(text: string | null) {
  pendingText = text;
}
/** Prende (e consuma) il testo in attesa. */
export function takePendingText(): string | null {
  const t = pendingText;
  pendingText = null;
  return t;
}
