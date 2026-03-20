// ═══════════════════════════════════════════════════════════════
// PWA ESTIMATOR - BASE DE DATOS (Firebase + IndexedDB) - ACTUALIZADO
// ═══════════════════════════════════════════════════════════════

console.log('💾 db.js cargado');

window.db = null;

// ─────────────────────────────────────────────────────────────
// UTILIDAD: LIMPIAR UNDEFINED DE UN OBJETO
// ─────────────────────────────────────────────────────────────
function limpiarUndefined(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    // Convertir undefined a null (Firebase acepta null, no undefined)
    return value === undefined ? null : value;
  }));
}

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
        // ✅ CORREGIDO: Limpia undefined + usa SET para update, ADD para create
        add: async (doc) => {
          try {
            // Limpiar undefined antes de enviar a Firebase
            const docLimpio = limpiarUndefined(doc);
            
            if (docLimpio.id) {
              // ✅ ACTUALIZAR documento existente (usar set con merge)
              await db.collection('diagnosticos').doc(docLimpio.id).set(docLimpio, { merge: true });
              console.log('✅ Diagnóstico actualizado:', docLimpio.id);
              return docLimpio.id;
            } else {
              // ✅ CREAR nuevo documento (Firebase genera ID automático)
              const newDoc = await db.collection('diagnosticos').add(docLimpio);
              console.log('✅ Diagnóstico creado:', newDoc.id);
              return newDoc.id;
            }
          } catch (error) {
            console.error('❌ Error en add():', error.code, error.message);
            throw error;
          }
        },
        
        // ✅ CORREGIDO: Eliminar campo específico si es necesario
        update: async (id, campos) => {
          try {
            const camposLimpios = limpiarUndefined(campos);
            await db.collection('diagnosticos').doc(id).update(camposLimpios);
            console.log('✅ Diagnóstico actualizado (partial):', id);
            return id;
          } catch (error) {
            console.error('❌ Error en update():', error);
            throw error;
          }
        },
        
        // ✅ CORREGIDO: Eliminar campo específico del documento
        eliminarCampo: async (id, campo) => {
          try {
            await db.collection('diagnosticos').doc(id).update({
              [campo]: firebase.firestore.FieldValue.delete()
            });
            console.log('✅ Campo eliminado:', campo, 'de', id);
            return id;
          } catch (error) {
            console.error('❌ Error eliminando campo:', error);
            throw error;
          }
        },
        
        count: async () => {
          try {
            const snapshot = await db.collection('diagnosticos').get();
            return snapshot.size;
          } catch (error) {
            console.error('❌ Error en count():', error);
            return 0;
          }
        },
        
        get: async (id) => {
          try {
            const doc = await db.collection('diagnosticos').doc(id).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
          } catch (error) {
            console.error('❌ Error en get():', error);
            return null;
          }
        },
        
        toArray: async () => {
          try {
            const snapshot = await db.collection('diagnosticos')
              .orderBy('timestamp', 'desc')
              .limit(100)
              .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          } catch (error) {
            console.error('❌ Error en toArray():', error);
            return [];
          }
        },
        
        clear: async () => {
          try {
            const snapshot = await db.collection('diagnosticos').get();
            const batch = db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            console.log('✅ Todos los diagnósticos eliminados');
          } catch (error) {
            console.error('❌ Error en clear():', error);
            throw error;
          }
        },
        
        orderBy: function(field, direction) {
          return {
            limit: (count) => ({
              toArray: async () => {
                try {
                  const query = db.collection('diagnosticos')
                    .orderBy(field, direction)
                    .limit(count);
                  const snapshot = await query.get();
                  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                } catch (error) {
                  console.error('❌ Error en orderBy().toArray():', error);
                  return [];
                }
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
// CREATE DIAGNOSTICOS STORE HELPER (IndexedDB)
// ─────────────────────────────────────────────────────────────
function createDiagnosticosStore(db) {
  return {
    // ✅ CORREGIDO: Limpia undefined + usa put() para update, add() para create
    add: async (doc) => {
      return new Promise((resolve, reject) => {
        try {
          // Limpiar undefined para IndexedDB también
          const docLimpio = limpiarUndefined(doc);
          
          const tx = db.transaction('diagnosticos', 'readwrite');
          const store = tx.objectStore('diagnosticos');
          
          // Si tiene id, usar put() (update), si no, add() (create)
          const request = docLimpio.id ? store.put(docLimpio) : store.add(docLimpio);
          
          request.onsuccess = () => {
            console.log('✅ IndexedDB:', docLimpio.id ? 'actualizado' : 'creado', request.result);
            resolve(request.result);
          };
          request.onerror = () => {
            console.error('❌ Error en IndexedDB add/put:', request.error);
            reject(request.error);
          };
        } catch (error) {
          console.error('❌ Error procesando documento:', error);
          reject(error);
        }
      });
    },
    
    // ✅ NUEVO: Actualizar campos específicos en IndexedDB
    update: async (id, campos) => {
      return new Promise(async (resolve, reject) => {
        try {
          // Primero obtener el documento existente
          const existente = await this.get(id);
          if (!existente) {
            reject(new Error('Documento no encontrado: ' + id));
            return;
          }
          
          // Fusionar campos
          const actualizado = { ...existente, ...limpiarUndefined(campos), id };
          
          const tx = db.transaction('diagnosticos', 'readwrite');
          const store = tx.objectStore('diagnosticos');
          const request = store.put(actualizado);
          
          request.onsuccess = () => resolve(id);
          request.onerror = () => reject(request.error);
        } catch (error) {
          reject(error);
        }
      });
    },
    
    // ✅ NUEVO: Eliminar campo específico en IndexedDB
    eliminarCampo: async (id, campo) => {
      return new Promise(async (resolve, reject) => {
        try {
          const existente = await this.get(id);
          if (!existente) {
            reject(new Error('Documento no encontrado: ' + id));
            return;
          }
          
          // Eliminar el campo
          delete existente[campo];
          
          const tx = db.transaction('diagnosticos', 'readwrite');
          const store = tx.objectStore('diagnosticos');
          const request = store.put(existente);
          
          request.onsuccess = () => {
            console.log('✅ Campo eliminado:', campo, 'de', id);
            resolve(id);
          };
          request.onerror = () => reject(request.error);
        } catch (error) {
          reject(error);
        }
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
        request.onsuccess = () => {
          console.log('✅ IndexedDB: todos los diagnósticos eliminados');
          resolve();
        };
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
