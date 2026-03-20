// ═══════════════════════════════════════════════════════════════
// PWA ESTIMATOR - FIREBASE AUTHENTICATION (auth.js)
// ═══════════════════════════════════════════════════════════════

console.log('🔐 auth.js cargado');

window.pwaAuth = {
  
  // ─────────────────────────────────────────────────────────────
  // INICIALIZAR AUTH
  // ─────────────────────────────────────────────────────────────
  init: function() {
    if (!firebase.apps.length) {
      console.error('❌ Firebase no inicializado');
      return false;
    }
    
    this.auth = firebase.auth();
    this.db = firebase.firestore();
    
    // Escuchar cambios de autenticación
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('✅ Usuario autenticado:', user.email);
        this.onAuthSuccess(user);
      } else {
        console.log('🚫 Sin sesión activa');
        this.onAuthLogout();
      }
    });
    
    return true;
  },
  
  // ─────────────────────────────────────────────────────────────
  // REGISTRAR ADMIN (SOLO PRIMERA VEZ)
  // ─────────────────────────────────────────────────────────────
  registrarAdmin: async function(email, password, nombre) {
    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      
      // Guardar datos adicionales en Firestore
      await this.db.collection('admins').doc(userCredential.user.uid).set({
        email: email,
        nombre: nombre || 'Admin',
        rol: 'admin',
        creado: firebase.firestore.FieldValue.serverTimestamp(),
        ultimoAcceso: null
      });
      
      console.log('✅ Admin registrado:', email);
      return { exito: true, user: userCredential.user };
      
    } catch (error) {
      console.error('❌ Error registrando admin:', error.code, error.message);
      return { exito: false, error: this.mapearErrorAuth(error.code) };
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // INICIAR SESIÓN
  // ─────────────────────────────────────────────────────────────
  login: async function(email, password) {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      
      // Actualizar último acceso
      await this.db.collection('admins').doc(userCredential.user.uid).update({
        ultimoAcceso: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Login exitoso:', email);
      return { exito: true, user: userCredential.user };
      
    } catch (error) {
      console.error('❌ Error login:', error.code, error.message);
      return { exito: false, error: this.mapearErrorAuth(error.code) };
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // CERRAR SESIÓN
  // ─────────────────────────────────────────────────────────────
  logout: async function() {
    try {
      await this.auth.signOut();
      console.log('🚪 Sesión cerrada');
      return { exito: true };
    } catch (error) {
      console.error('❌ Error logout:', error);
      return { exito: false, error: error.message };
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // RECUPERAR CONTRASEÑA
  // ─────────────────────────────────────────────────────────────
  recuperarPassword: async function(email) {
    try {
      await this.auth.sendPasswordResetEmail(email);
      console.log('✅ Email de recuperación enviado');
      return { exito: true };
    } catch (error) {
      console.error('❌ Error recuperar password:', error);
      return { exito: false, error: this.mapearErrorAuth(error.code) };
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // VERIFICAR SI ES ADMIN
  // ─────────────────────────────────────────────────────────────
  esAdmin: async function() {
    const user = this.auth.currentUser;
    if (!user) return false;
    
    try {
      const doc = await this.db.collection('admins').doc(user.uid).get();
      return doc.exists && doc.data().rol === 'admin';
    } catch (error) {
      console.error('❌ Error verificando admin:', error);
      return false;
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // OBTENER USUARIO ACTUAL
  // ─────────────────────────────────────────────────────────────
  usuarioActual: function() {
    return this.auth.currentUser;
  },
  
  // ─────────────────────────────────────────────────────────────
  // MAPEAR ERRORES DE AUTH A MENSAJES EN ESPAÑOL
  // ─────────────────────────────────────────────────────────────
  mapearErrorAuth: function(codigo) {
    const errores = {
      'auth/email-already-in-use': 'Este email ya está registrado',
      'auth/invalid-email': 'Email inválido',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/weak-password': 'Contraseña muy débil (mínimo 6 caracteres)',
      'auth/user-disabled': 'Usuario deshabilitado',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-credential': 'Credenciales inválidas',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet'
    };
    return errores[codigo] || 'Error de autenticación';
  },
  
  // ─────────────────────────────────────────────────────────────
  // CALLBACKS (sobrescribir en app.js si es necesario)
  // ─────────────────────────────────────────────────────────────
  onAuthSuccess: function(user) {
    console.log('🔐 Auth success:', user.email);
    // Sobrescribir en app.js para manejar UI
  },
  
  onAuthLogout: function() {
    console.log('🔐 Auth logout');
    // Sobrescribir en app.js para manejar UI
  }
};

// Inicializar cuando Firebase esté listo
if (typeof firebase !== 'undefined') {
  window.pwaAuth.init();
}

console.log('✅ auth.js listo');
