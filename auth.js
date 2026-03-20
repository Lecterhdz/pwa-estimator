// ═══════════════════════════════════════════════════════════════
// PWA ESTIMATOR - MÓDULO DE AUTENTICACIÓN (auth.js)
// ═══════════════════════════════════════════════════════════════

console.log('🔐 auth.js cargado');

window.auth = {
  // ⚠️ NUNCA exponer contraseña real en frontend
  // En producción, usar Firebase Auth o backend para validación
  ADMIN_HASH: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', // SHA256 de '123456' (ejemplo)
  
  // Verificar contraseña con hash (más seguro que texto plano)
  verificarPassword: function(password) {
    // En producción: enviar password al backend para validación
    // Aquí usamos hash simple como ejemplo educativo
    const hash = this.simpleHash(password);
    return hash === this.ADMIN_HASH;
  },
  
  // Hash simple (NO es criptográficamente seguro, solo para ejemplo)
  // En producción usar: Web Crypto API o backend
  simpleHash: function(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  },
  
  // Guardar sesión de admin
  iniciarSesionAdmin: function() {
    const sessionData = {
      admin: true,
      timestamp: Date.now(),
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
    };
    localStorage.setItem('pwa_estimator_session', JSON.stringify(sessionData));
    console.log('✅ Sesión admin iniciada');
  },
  
  // Verificar si hay sesión válida
  tieneSesionValida: function() {
    try {
      const session = JSON.parse(localStorage.getItem('pwa_estimator_session'));
      if (!session || !session.admin) return false;
      if (Date.now() > session.expires) {
        this.cerrarSesion();
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  },
  
  // Cerrar sesión
  cerrarSesion: function() {
    localStorage.removeItem('pwa_estimator_session');
    console.log('🚪 Sesión cerrada');
  },
  
  // Obtener datos de sesión
  getSesion: function() {
    try {
      return JSON.parse(localStorage.getItem('pwa_estimator_session'));
    } catch (e) {
      return null;
    }
  }
};

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.auth;
}
