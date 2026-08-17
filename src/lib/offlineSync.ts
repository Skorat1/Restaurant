// A basic implementation of Offline Billing Sync using IndexedDB
const DB_NAME = 'VeloraPOS';
const STORE_NAME = 'offlineOrders';

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject('Not in browser');
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveOrderOffline = async (orderData: any) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.add({ ...orderData, savedAt: new Date().toISOString() });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("Failed to save offline order", err);
  }
};

export const syncOfflineOrders = async (token: string, apiUrl: string) => {
  if (!navigator.onLine) return; // Only sync if online
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    
    req.onsuccess = async () => {
      const orders = req.result;
      if (orders.length === 0) return;
      
      console.log(`Syncing ${orders.length} offline orders...`);
      for (const order of orders) {
        try {
          const res = await fetch(`${apiUrl}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(order)
          });
          if (res.ok) {
            // Delete from indexedDB
            const delTx = db.transaction(STORE_NAME, 'readwrite');
            delTx.objectStore(STORE_NAME).delete(order.id);
          }
        } catch (e) {
          console.error("Sync failed for order", order, e);
        }
      }
    };
  } catch (err) {
    console.error("Failed to sync offline orders", err);
  }
};
