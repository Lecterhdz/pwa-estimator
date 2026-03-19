// ═══════════════════════════════════════════════════════════════
// PWA ESTIMATOR - CONFIGURACIÓN DE FIREBASE
// ═══════════════════════════════════════════════════════════════

console.log('🔥 config-firebase.js cargado');

// ─────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE FIREBASE
// ─────────────────────────────────────────────────────────────
// ⚠️ REEMPLAZA CON TUS CREDENCIALES REALES DE FIREBASE
window.firebaseConfig = {
// Your web app's Firebase configuration
  apiKey: "AIzaSyDVBXgkIF4oELj5bCoQZppT_5ZRUo2tDBw",
  authDomain: "pwa-estimator.firebaseapp.com",
  projectId: "pwa-estimator",
  storageBucket: "pwa-estimator.firebasestorage.app",
  messagingSenderId: "345159725920",
  appId: "1:345159725920:web:004fb9a057774454b82405"
};

// ─────────────────────────────────────────────────────────────
// VERIFICAR QUE FIREBASE ESTÉ DISPONIBLE
// ─────────────────────────────────────────────────────────────
window.firebaseReady = new Promise((resolve) => {
  if (typeof firebase !== 'undefined') {
    console.log('✅ Firebase SDK cargado');
    resolve(firebase);
  } else {
    console.warn('⚠️ Firebase SDK no cargado, usando IndexedDB como fallback');
    resolve(null);
  }
});

console.log('✅ config-firebase.js listo');
