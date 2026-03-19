// ═══════════════════════════════════════════════════════════════
// PWA ESTIMATOR - CONFIGURACIÓN DE FIREBASE
// ═══════════════════════════════════════════════════════════════

console.log('🔥 config-firebase.js cargado');

// ─────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE FIREBASE
// ─────────────────────────────────────────────────────────────
// ⚠️ REEMPLAZA CON TUS CREDENCIALES REALES DE FIREBASE
window.firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// ─────────────────────────────────────────────────────────────
// VERIFICAR QUE FIREBASE ESTÉ DISPONIBLE
// ─────────────────────────────────────────────────────────────
window.firebaseReady = new Promise((resolve) => {
  if (typeof firebase !== 'undefined') {
    console.log('✅ Firebase SDK cargado');
    resolve(firebase);
  } else {
    console.warn('⚠️ Firebase SDK no cargado, usando IndexedDB');
    resolve(null);
  }
});

console.log('✅ config-firebase.js listo');