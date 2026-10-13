/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST || []);

const DB_NAME = 'poojaspace_storage';
const DB_VERSION = 1;
const STORE_NAME = 'pending_shares';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function savePendingShare(db: IDBDatabase, item: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Intercept Android PWA Web Share Target POST request
self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);

  if (event.request.method === 'POST' && url.pathname === '/share-target') {
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData();
          const files = formData.getAll('media');

          if (files && files.length > 0) {
            const db = await openDatabase();
            for (const item of files) {
              if (item instanceof File) {
                await savePendingShare(db, {
                  id: `share_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                  file: item,
                  name: item.name,
                  size: item.size,
                  type: item.type || 'application/octet-stream',
                  timestamp: Date.now(),
                });
              }
            }
          }
        } catch (err) {
          // If error parsing form, continue to redirect
        }

        // Redirect to main app with from_share query flag
        return Response.redirect('/?from_share=true', 303);
      })()
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
