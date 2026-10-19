/// <reference lib="webworker" />
// BenitoTools: service worker.
// - funziona offline (precache dei file dell'app, cache dei motori WASM al primo uso)
// - riceve i file da "Condividi con BenitoTools" (Web Share Target) e li passa alla pagina /condividi
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  addPlugins
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import {
  CacheFirst,
  NetworkOnly,
  StaleWhileRevalidate
} from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { clientsClaim } from 'workbox-core';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

const BASE = new URL(self.registration.scope).pathname; // es. /tool-box/

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();

// ---- Pagina "isolata" (serve a LibreOffice WASM per la memoria condivisa) ----
// GitHub Pages non permette di impostare le intestazioni COOP/COEP: le aggiunge il service worker
// a tutte le risposte dell'app. "credentialless" lascia funzionare icone e librerie da altri siti.
function withIsolation(response: Response): Response {
  if (
    !response ||
    response.type === 'opaque' ||
    response.status === 0 ||
    response.type === 'opaqueredirect'
  ) {
    return response;
  }
  const headers = new Headers(response.headers);
  headers.set('Cross-Origin-Embedder-Policy', 'credentialless');
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

const sameOrigin = (url: string) =>
  new URL(url).origin === self.location.origin;

const isolationPlugin = {
  fetchDidSucceed: async ({
    request,
    response
  }: {
    request: Request;
    response: Response;
  }) => (sameOrigin(request.url) ? withIsolation(response) : response),
  cachedResponseWillBeUsed: async ({
    request,
    cachedResponse
  }: {
    request: Request;
    cachedResponse?: Response;
  }) =>
    cachedResponse && sameOrigin(request.url)
      ? withIsolation(cachedResponse)
      : cachedResponse
};

addPlugins([isolationPlugin]);
precacheAndRoute(self.__WB_MANIFEST);

// Navigazione SPA: ogni pagina dell'app usa index.html (anche offline).
const appShell = createHandlerBoundToURL(`${BASE}index.html`);
registerRoute(
  new NavigationRoute(
    async (options) => withIsolation(await appShell(options)),
    {
      denylist: [/condividi-ricevi/]
    }
  )
);

// Pezzi grandi dell'app non precaricati: in cache al primo uso (i nomi cambiano a ogni versione).
registerRoute(
  ({ url }) =>
    url.pathname.startsWith(`${BASE}assets/`) &&
    /\.(js|css)$/.test(url.pathname),
  new CacheFirst({
    cacheName: 'benito-chunks',
    plugins: [
      isolationPlugin,
      new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 60 })
    ]
  })
);

// Traduzioni: aggiornate in background.
registerRoute(
  ({ url }) => url.pathname.startsWith(`${BASE}locales/`),
  new StaleWhileRevalidate({
    cacheName: 'benito-locales',
    plugins: [isolationPlugin]
  })
);

// Motori per i documenti (LibreOffice, PyMuPDF, pandoc): scaricati al primo uso e tenuti.
// La versione è nel percorso, quindi un aggiornamento del motore usa nuovi indirizzi.
registerRoute(
  ({ url }) => url.pathname.startsWith(`${BASE}engines/`),
  new CacheFirst({
    cacheName: 'benito-motori',
    plugins: [
      isolationPlugin,
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 365
      })
    ]
  })
);

// File pesanti (WASM, modelli, font, librerie da CDN): in cache al primo uso.
registerRoute(
  ({ url, request }) =>
    /\.(wasm|onnx|data|traineddata|gz|woff2?|ttf)$/.test(url.pathname) ||
    url.hostname === 'unpkg.com' ||
    url.hostname === 'api.iconify.design' ||
    url.hostname === 'api.simplesvg.com' ||
    url.hostname === 'api.unisvg.com' ||
    url.hostname === 'cdn.jsdelivr.net' ||
    request.destination === 'font',
  new CacheFirst({
    cacheName: 'benito-engines',
    plugins: [
      isolationPlugin,
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 90 })
    ]
  })
);

// Tutto il resto dell'app (stesso sito): dalla rete, con le intestazioni di isolamento.
registerRoute(
  ({ url, request }) =>
    url.origin === self.location.origin && request.method === 'GET',
  new NetworkOnly({ plugins: [isolationPlugin] })
);

// ---- Condividi con BenitoTools (Web Share Target) ----

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('benitotools', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('history')) {
        const s = db.createObjectStore('history', { keyPath: 'id' });
        s.createIndex('date', 'date');
      }
      if (!db.objectStoreNames.contains('shared')) {
        db.createObjectStore('shared', { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveShared(entry: {
  id: string;
  files: File[];
  text?: string;
  date: number;
}) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const t = db.transaction('shared', 'readwrite');
    t.objectStore('shared').put(entry);
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
  });
}

self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);
  if (
    event.request.method !== 'POST' ||
    !url.pathname.endsWith('/condividi-ricevi')
  )
    return;
  event.respondWith(
    (async () => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      try {
        const form = await event.request.formData();
        const files = form
          .getAll('files')
          .filter((f): f is File => f instanceof File && f.size > 0);
        const text = [form.get('title'), form.get('text'), form.get('url')]
          .filter((v) => typeof v === 'string' && v.trim())
          .join('\n');
        await saveShared({
          id,
          files,
          text: text || undefined,
          date: Date.now()
        });
      } catch (e) {
        console.warn('BenitoTools: condivisione non letta', e);
      }
      return Response.redirect(`${BASE}condividi?id=${id}`, 303);
    })()
  );
});
