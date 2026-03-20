// ═══════════════════════════════════════════════════════════════
// PWA ESTIMATOR - AUTENTICACIÓN FIREBASE (COMPAT)
// ═══════════════════════════════════════════════════════════════

console.log('🔐 auth.js cargado');

window.pwaAuth = {
  auth: null,
  db: null,
  
  // ─────────────────────────────────────────────────────────────
  // INICIALIZAR AUTH
  // ─────────────────────────────────────────────────────────────
  init: function() {
    try {
      // Verificar que Firebase esté disponible
      if (typeof firebase === 'undefined') {
        console.error('❌ Firebase no está disponible');
        return false;
      }
      
      // Inicializar Auth y Firestore (versión compat)
      this.auth = firebase.auth();
      this.db = firebase.firestore();
      
      console.log('✅ Firebase Auth inicializado');
      
      // Escuchar cambios de autenticación
      this.auth.onAuthStateChanged((user) => {
        if (user) {
          console.log('✅ Usuario autenticado:', user.email);
          if (this.onAuthSuccess) this.onAuthSuccess(user);
        } else {
          console.log('🚫 Sin sesión activa');
          if (this.onAuthLogout) this.onAuthLogout();
        }
      });
      
      return true;
      
    } catch (error) {
      console.error('❌ Error inicializando Auth:', error);
      return false;
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // LOGIN CON EMAIL/PASSWORD
  // ─────────────────────────────────────────────────────────────
  login: async function(email, password) {
    try {
      if (!this.auth) {
        return { exito: false, error: 'Auth no inicializado' };
      }
      
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      console.log('✅ Login exitoso:', userCredential.user.email);
      
      return { 
        exito: true, 
        user: userCredential.user 
      };
      
    } catch (error) {
      console.error('❌ Error login:', error.code, error.message);
      return { 
        exito: false, 
        error: this.mapearErrorAuth(error.code) 
      };
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // CERRAR SESIÓN
  // ─────────────────────────────────────────────────────────────
  logout: async function() {
    try {
      if (!this.auth) {
        return { exito: false, error: 'Auth no inicializado' };
      }
      
      await this.auth.signOut();
      console.log('🚪 Sesión cerrada');
      
      return { exito: true };
      
    } catch (error) {
      console.error('❌ Error logout:', error);
      return { exito: false, error: error.message };
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // USUARIO ACTUAL
  // ─────────────────────────────────────────────────────────────
  usuarioActual: function() {
    if (!this.auth) return null;
    return this.auth.currentUser;
  },
  
  // ─────────────────────────────────────────────────────────────
  // MAPEAR ERRORES A ESPAÑOL
  // ─────────────────────────────────────────────────────────────
  mapearErrorAuth: function(codigo) {
    const errores = {
      'auth/invalid-email': 'Email inválido',
      'auth/user-disabled': 'Usuario deshabilitado',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-credential': 'Credenciales inválidas',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/network-request-failed': 'Error de conexión'
    };
    return errores[codigo] || 'Error de autenticación';
  },
  
  // ─────────────────────────────────────────────────────────────
  // CALLBACKS (se sobrescriben en app.js)
  // ─────────────────────────────────────────────────────────────
  onAuthSuccess: null,
  onAuthLogout: null
};

// Inicializar cuando el DOM esté listo
if (typeof firebase !== 'undefined') {
  // Esperar un poco para asegurar que Firebase esté listo
  setTimeout(() => {
    window.pwaAuth.init();
  }, 100);
}

console.log('✅ auth.js listo');
