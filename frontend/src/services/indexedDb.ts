import type { Ticket } from '../types';

const DB_NAME    = 'tickefar-db';
const STORE_NAME = 'tickets';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: '_id' });
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

export async function saveTickets(tickets: Ticket[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.clear();
  for (const ticket of tickets) {
    store.put(ticket);
  }
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });
}

export async function readTickets(): Promise<Ticket[]> {
  const db = await openDB();
  const tx    = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const req   = store.getAll();
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result as Ticket[]);
    req.onerror   = () => reject(req.error);
  });
}
