// BenitoTools: LibreOffice WASM usa la memoria condivisa (SharedArrayBuffer), disponibile solo se la
// pagina è "isolata". Le intestazioni necessarie le aggiunge il service worker; se la pagina è stata
// aperta prima che il service worker fosse attivo, basta ricaricarla una volta.
import { useEffect } from 'react';

const KEY = 'bt-coi-reload';

export function isIsolated() {
  return typeof self !== 'undefined' && self.crossOriginIsolated === true;
}

/** Ricarica la pagina una sola volta se il service worker è attivo ma la pagina non è ancora isolata. */
export function useIsolation(enabled = true) {
  useEffect(() => {
    if (!enabled || isIsolated() || !('serviceWorker' in navigator)) return;
    const tryReload = () => {
      let done = false;
      try {
        done = sessionStorage.getItem(KEY) === '1';
        if (!done) sessionStorage.setItem(KEY, '1');
      } catch {
        done = true;
      }
      if (!done) location.reload();
    };
    if (navigator.serviceWorker.controller) tryReload();
    else
      navigator.serviceWorker.addEventListener('controllerchange', tryReload, {
        once: true
      });
  }, [enabled]);
}
