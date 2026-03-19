// ═══════════════════════════════════════════════════════════════
// PWA ESTIMATOR - BASE DE DATOS (Firebase + IndexedDB)
// ═══════════════════════════════════════════════════════════════

console.log('💾 db.js cargado');

window.db = null;

// ─────────────────────────────────────────────────────────────
// INICIALIZAR FIREBASE + INDEXEDDB
// ─────────────────────────────────────────────────────────────
async function inicializarDB() {
  try {
    // Verificar que Firebase esté configurado
    if (!window.firebaseConfig || !window.firebaseConfig.apiKey) {
      console.warn('⚠️ Firebase no configurado, usando solo IndexedDB');
      await inicializarIndexedDB();
      return;
    }
    
    // Inicializar Firebase
    firebase.initializeApp(window.firebaseConfig);
    const db = firebase.firestore();
    
    // Crear objeto db con métodos para diagnosticos
    window.db = {
      diagnosticos: {
        add: async (doc) => {
          const id = await db.collection('diagnosticos').add(doc);
          return id.id;
        },
        count: async () => {
          const snapshot = await db.collection('diagnosticos').get();
          return snapshot.size;
        },
        get: async (id) => {
          const doc = await db.collection('diagnosticos').doc(id).get();
          return doc.exists ? { id: doc.id, ...doc.data() } : null;
        },
        toArray: async () => {
          const snapshot = await db.collection('diagnosticos').orderBy('timestamp', 'desc').limit(100).get();
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        clear: async () => {
          const snapshot = await db.collection('diagnosticos').get();
          const batch = db.batch();
          snapshot.docs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
        },
        orderBy: function(field, direction) {
          return {
            limit: (count) => ({
              toArray: async () => {
                const query = db.collection('diagnosticos')
                  .orderBy(field, direction)
                  .limit(count);
                const snapshot = await query.get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              }
            })
          };
        }
      }
    };
    
    console.log('✅ DB inicializada (Firebase)');
    
  } catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
    await inicializarIndexedDB();
  }
}

// ─────────────────────────────────────────────────────────────
// INDEXEDDB PURA (FALLBACK)
// ─────────────────────────────────────────────────────────────
async function inicializarIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PWAEstimatorDB', 1);
    
    request.onerror = () => {
      console.error('❌ Error abriendo IndexedDB');
      reject(request.error);
    };
    
    request.onsuccess = () => {
      const db = request.result;
      
      window.db = {
        diagnosticos: createDiagnosticosStore(db)
      };
      
      console.log('✅ DB inicializada (IndexedDB)');
      resolve();
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('diagnosticos')) {
        const store = db.createObjectStore('diagnosticos', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('cliente.email', 'cliente.email', { unique: false });
        store.createIndex('resultado.nivel', 'resultado.nivel', { unique: false });
        store.createIndex('meta.leadScore', 'meta.leadScore', { unique: false });
      }
    };
  });
}

// ─────────────────────────────────────────────────────────────
// CREATE DIAGNOSTICOS STORE HELPER
// ─────────────────────────────────────────────────────────────
function createDiagnosticosStore(db) {
  return {
    add: async (doc) => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('diagnosticos', 'readwrite');
        const store = tx.objectStore('diagnosticos');
        const request = store.add(doc);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },
    count: async () => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('diagnosticos', 'readonly');
        const store = tx.objectStore('diagnosticos');
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },
    get: async (id) => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('diagnosticos', 'readonly');
        const store = tx.objectStore('diagnosticos');
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },
    toArray: async () => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('diagnosticos', 'readonly');
        const store = tx.objectStore('diagnosticos');
        const request = store.getAll();
        request.onsuccess = () => {
          const resultados = request.result.sort((a, b) => b.timestamp - a.timestamp);
          resolve(resultados.slice(0, 100));
        };
        request.onerror = () => reject(request.error);
      });
    },
    clear: async () => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('diagnosticos', 'readwrite');
        const store = tx.objectStore('diagnosticos');
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    },
    orderBy: function(field, direction) {
      return {
        limit: (count) => ({
          toArray: async () => {
            const tx = db.transaction('diagnosticos', 'readonly');
            const store = tx.objectStore('diagnosticos');
            const index = store.index(field);
            const request = index.getAll();
            return new Promise((resolve, reject) => {
              request.onsuccess = () => {
                let resultados = request.result;
                if (direction === 'desc') {
                  resultados.sort((a, b) => b[field] - a[field]);
                } else {
                  resultados.sort((a, b) => a[field] - b[field]);
                }
                resolve(resultados.slice(0, count));
              };
              request.onerror = () => reject(request.error);
            });
          }
        })
      };
    }
  };
}

// Inicializar DB cuando el script carga
inicializarDB();

console.log('✅ db.js listo');