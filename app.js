// ═══════════════════════════════════════════════════════════════
// PWA ESTIMATOR - APLICACIÓN PRINCIPAL (OPTIMIZADO)
// ═══════════════════════════════════════════════════════════════

console.log('🔧 PWA Estimator app.js cargado');
// AGREGAR ESTO DESPUÉS DEL console.log inicial:
// Cargar módulo de autenticación
if (typeof auth !== 'undefined') {
  console.log('🔐 auth.js disponible');
}
window.app = {
  pantallaActual: 'estimador-screen',
  esAdmin: false,
  ADMIN_PASSWORD: 'TU_CONTRASEÑA_AQUI', // ⚠️ CAMBIA ESTO EN PRODUCCIÓN
  
  // ─────────────────────────────────────────────────────────────
  // INICIALIZAR APP (OPTIMIZADO)
  // ─────────────────────────────────────────────────────────────
  init: async function() {
    try {
      console.log('🔧 PWA Estimator iniciando...');
      
      // 1. Cargar tema guardado
      this.cargarTemaGuardado();
      
      // 2. Verificar sesión admin
      this.verificarSesionAdmin();
      
      // 3. Esperar a que DB esté lista
      await this.esperarDB();
      
      // 4. Configurar sidebars según modo y pantalla
      this.configurarSidebars();
      
      // 5. Cargar diagnósticos si es admin
      if (this.esAdmin) {
        await this.cargarDiagnosticos();
      }
      
      // 6. Mostrar login si no es admin
      if (!this.esAdmin) {
        this.mostrarLogin();
      }
      
      // 7. Configurar navegación
      this.configurarNavegacion();
      
      // 8. ✅ Revelar app (eliminar flash de carga)
      document.body.classList.remove('app-loading');
      
      console.log('✅ PWA Estimator listo');
      console.log('🔐 Modo:', this.esAdmin ? 'ADMIN' : 'CLIENTE');
      console.log('📱 Pantalla:', window.innerWidth <= 768 ? 'MÓVIL' : 'DESKTOP');
      
    } catch (error) {
      console.error('❌ Error en inicialización:', error);
      // ✅ Revelar app incluso con error
      document.body.classList.remove('app-loading');
      this.mostrarToast('❌ Error al iniciar: ' + error.message, 'error');
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // CONFIGURAR SIDEBARS (NUEVA FUNCIÓN - RESPONSIVE)
  // ─────────────────────────────────────────────────────────────
  configurarSidebars: function() {
    const esMovil = window.innerWidth <= 768;
    const sidebarAdmin = document.getElementById('sidebar-admin');
    const sidebarCliente = document.getElementById('sidebar-cliente');
    
    if (this.esAdmin) {
      // Modo admin
      if (sidebarAdmin) {
        if (esMovil) {
          sidebarAdmin.classList.remove('visible'); // En móvil: oculto hasta que se abra
        } else {
          sidebarAdmin.classList.add('visible'); // En desktop: visible siempre
        }
      }
      if (sidebarCliente) sidebarCliente.classList.remove('visible');
    } else {
      // Modo cliente
      if (sidebarCliente) {
        if (esMovil) {
          sidebarCliente.classList.remove('visible');
        } else {
          sidebarCliente.classList.add('visible');
        }
      }
      if (sidebarAdmin) sidebarAdmin.classList.remove('visible');
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // ESPERAR BASE DE DATOS
  // ─────────────────────────────────────────────────────────────
  esperarDB: async function() {
    return new Promise((resolve) => {
      const checkDB = () => {
        if (window.db) {
          resolve();
        } else {
          setTimeout(checkDB, 100);
        }
      };
      checkDB();
    });
  },
  
  // ─────────────────────────────────────────────────────────────
  // MOSTRAR LOGIN
  // ─────────────────────────────────────────────────────────────
  mostrarLogin: function() {
    const modal = document.getElementById('login-modal');
    if (modal) {
      modal.classList.add('active');
      modal.style.display = 'flex';
    }
    
    // Ocultar ambos sidebars
    document.getElementById('sidebar-admin')?.classList.remove('visible');
    document.getElementById('sidebar-cliente')?.classList.remove('visible');
    
    window.scrollTo(0, 0);
    console.log('🔐 Login mostrado');
  },
  
  // ─────────────────────────────────────────────────────────────
  // VERIFICAR ADMIN
  // ─────────────────────────────────────────────────────────────
  verificarAdmin: function() {
    const passwordInput = document.getElementById('admin-password');
    const password = passwordInput?.value || '';
    
    if (password === this.ADMIN_PASSWORD) {
      // Guardar sesión
      localStorage.setItem('pwa_estimator_admin', 'true');
      localStorage.setItem('pwa_estimator_admin_time', Date.now().toString());
      
      this.esAdmin = true;
      
      // Ocultar login
      const modal = document.getElementById('login-modal');
      if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
      }
      
      // Mostrar sidebar correcto
      this.configurarSidebars();
      
      // Scroll al inicio
      window.scrollTo(0, 0);
      
      // Cargar diagnósticos
      this.cargarDiagnosticos();
      
      // Feedback
      this.mostrarToast('✅ Bienvenido Admin', 'success');
      if (passwordInput) passwordInput.value = '';
      
      console.log('✅ Admin autenticado');
      
    } else {
      // Error de contraseña
      if (passwordInput) {
        passwordInput.classList.add('error');
        passwordInput.style.borderColor = 'var(--rose)';
        setTimeout(() => {
          passwordInput.classList.remove('error');
          passwordInput.style.borderColor = '';
        }, 2000);
      }
      this.mostrarToast('❌ Contraseña incorrecta', 'error');
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // ENTRAR COMO CLIENTE
  // ─────────────────────────────────────────────────────────────
  entrarComoCliente: function() {
    this.esAdmin = false;
    
    // Ocultar login
    const modal = document.getElementById('login-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
    
    // Mostrar sidebar cliente
    this.configurarSidebars();
    
    // Scroll al inicio
    window.scrollTo(0, 0);
    
    // Mostrar pantalla estimador
    this.mostrarPantalla('estimador-screen');
    
    this.mostrarToast('👤 Modo Cliente Activado', 'info');
    console.log('✅ Modo cliente activado');
  },
  
  // ─────────────────────────────────────────────────────────────
  // VERIFICAR SESIÓN ADMIN (CORREGIDO - SIN FLICKER)
  // ─────────────────────────────────────────────────────────────
  verificarSesionAdmin: function() {
    const adminSession = localStorage.getItem('pwa_estimator_admin');
    const adminTime = localStorage.getItem('pwa_estimator_admin_time');
    const EXPIRATION = 24 * 60 * 60 * 1000; // 24 horas
    
    // 1️⃣ Primero verificar si la sesión es válida
    let sesionValida = false;
    if (adminSession === 'true' && adminTime) {
      const timeDiff = Date.now() - parseInt(adminTime);
      if (timeDiff < EXPIRATION) {
        sesionValida = true;
        this.esAdmin = true; // ← Establecer ANTES de cualquier UI
        console.log('✅ Sesión admin válida');
      }
    }
    
    if (!sesionValida) {
      // Sesión inválida o expirada
      this.esAdmin = false;
      localStorage.removeItem('pwa_estimator_admin');
      localStorage.removeItem('pwa_estimator_admin_time');
      return false;
    }
    
    // 2️⃣ AHORA que sabemos el modo, configurar sidebars
    this.configurarSidebars();
    
    // 3️⃣ Ocultar login modal si es admin
    const modal = document.getElementById('login-modal');
    if (modal && this.esAdmin) {
      modal.style.display = 'none';
    }
    
    return true;
  },
  
  // ─────────────────────────────────────────────────────────────
  // CERRAR SESIÓN ADMIN
  // ─────────────────────────────────────────────────────────────
  cerrarSesionAdmin: function() {
    if (confirm('¿Cerrar sesión de admin?')) {
      localStorage.removeItem('pwa_estimator_admin');
      localStorage.removeItem('pwa_estimator_admin_time');
      this.esAdmin = false;
      
      this.configurarSidebars();
      this.mostrarLogin();
      this.mostrarPantalla('estimador-screen');
      this.mostrarToast('🚪 Sesión cerrada', 'info');
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // MOSTRAR PANTALLA (OPTIMIZADO)
  // ─────────────────────────────────────────────────────────────
  mostrarPantalla: function(pantallaId) {
    // Seguridad: validar acceso a admin
    if (pantallaId === 'admin-diagnosticos-screen' && !this.esAdmin) {
      this.mostrarToast('🔐 Acceso restringido a admin', 'error');
      return;
    }
    
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
      screen.style.display = 'none';
    });
    
    // Mostrar pantalla seleccionada
    const pantalla = document.getElementById(pantallaId);
    if (pantalla) {
      pantalla.style.display = 'block';
      pantalla.classList.add('active');
      this.pantallaActual = pantallaId;
      
      // Actualizar topbar
      this.actualizarTopbar(pantallaId);
      
      // Actualizar menú activo
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
      });
      const navItem = document.querySelector(`.nav-item[onclick*="${pantallaId}"]`);
      if (navItem) navItem.classList.add('active');
      
      // Inicializaciones específicas por pantalla
      switch(pantallaId) {
        case 'estimador-screen':
          if (window.estimatorUI?.init) window.estimatorUI.init();
          break;
        case 'admin-diagnosticos-screen':
          if (this.esAdmin) this.cargarDiagnosticos();
          break;
      }
    }
    
    // En móvil: cerrar sidebar después de navegar
    if (window.innerWidth <= 768) {
      const sidebar = document.getElementById(this.esAdmin ? 'sidebar-admin' : 'sidebar-cliente');
      const overlay = document.getElementById('sidebar-overlay');
      sidebar?.classList.remove('visible');
      overlay?.classList.remove('active');
      document.body.style.overflow = '';
    }
    
    console.log('📍 Pantalla:', pantallaId);
  },
  
  // ─────────────────────────────────────────────────────────────
  // ACTUALIZAR TOPBAR
  // ─────────────────────────────────────────────────────────────
  actualizarTopbar: function(pantallaId) {
    const titulos = {
      'estimador-screen': ['Estimador PWA', 'Cotiza tu proyecto en minutos'],
      'admin-diagnosticos-screen': ['Diagnósticos', 'Revisa las solicitudes recibidas']
    };
    
    const [titulo, subtitulo] = titulos[pantallaId] || ['PWA Estimator', 'Cotizador Modular'];
    
    const elTitulo = document.getElementById('topbar-title');
    const elSubtitulo = document.getElementById('topbar-sub');
    
    if (elTitulo) elTitulo.textContent = titulo;
    if (elSubtitulo) elSubtitulo.textContent = subtitulo;
  },
  
  // ─────────────────────────────────────────────────────────────
  // CARGAR DIAGNÓSTICOS
  // ─────────────────────────────────────────────────────────────
  cargarDiagnosticos: async function() {
    try {
      if (!window.db?.diagnosticos) {
        console.warn('⚠️ DB no disponible');
        return;
      }
      
      if (window.adminDiagnosticos?.cargar) {
        await window.adminDiagnosticos.cargar();
      }
      
      // Actualizar badge del menú
      const count = await window.db.diagnosticos.count();
      const badge = document.getElementById('menu-badge-diagnosticos');
      if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
      }
      
    } catch (error) {
      console.error('❌ Error cargando diagnósticos:', error);
      if (error.code === 'permission-denied') {
        this.mostrarToast('🔐 Error de permisos en Firebase', 'error');
      }
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // CONFIGURAR NAVEGACIÓN (CORREGIDO - SIN FLICKER EN RESIZE)
  // ─────────────────────────────────────────────────────────────
  configurarNavegacion: function() {
    // Escape para cerrar modals/sidebar
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (window.innerWidth <= 768) {
          const sidebar = document.getElementById(this.esAdmin ? 'sidebar-admin' : 'sidebar-cliente');
          const overlay = document.getElementById('sidebar-overlay');
          sidebar?.classList.remove('visible');
          overlay?.classList.remove('active');
          document.body.style.overflow = '';
        }
        this.mostrarPantalla('estimador-screen');
      }
    });
    
    // Resize con debounce para evitar flicker
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Solo ajustar si cambió de móvil a desktop o viceversa
        const esMovilAhora = window.innerWidth <= 768;
        const sidebarAdmin = document.getElementById('sidebar-admin');
        const sidebarCliente = document.getElementById('sidebar-cliente');
        
        if (this.esAdmin && sidebarAdmin) {
          if (esMovilAhora) {
            sidebarAdmin.classList.remove('visible'); // En móvil: oculto hasta toggle
          } else {
            sidebarAdmin.classList.add('visible'); // En desktop: visible
          }
        }
        if (!this.esAdmin && sidebarCliente) {
          if (esMovilAhora) {
            sidebarCliente.classList.remove('visible');
          } else {
            sidebarCliente.classList.add('visible');
          }
        }
      }, 150); // Esperar 150ms después del último resize
    });
  },
  
  // ─────────────────────────────────────────────────────────────
  // TOGGLE SIDEBAR (MÓVIL)
  // ─────────────────────────────────────────────────────────────
  toggleSidebar: function() {
    const sidebarId = this.esAdmin ? 'sidebar-admin' : 'sidebar-cliente';
    const sidebar = document.getElementById(sidebarId);
    const overlay = document.getElementById('sidebar-overlay');
    
    if (!sidebar) {
      console.error('❌ Sidebar no encontrado:', sidebarId);
      return;
    }
    
    // Toggle visibilidad
    sidebar.classList.toggle('visible');
    overlay?.classList.toggle('active');
    
    // Prevenir scroll del body
    document.body.style.overflow = sidebar.classList.contains('visible') ? 'hidden' : '';
    
    console.log('🔍 Sidebar:', sidebarId, sidebar.classList.contains('visible') ? '🟢 ABIERTO' : '🔴 CERRADO');
  },
  
  // ─────────────────────────────────────────────────────────────
  // TOGGLE TEMA
  // ─────────────────────────────────────────────────────────────
  toggleTema: function() {
    const body = document.body;
    const esClaro = body.classList.toggle('tema-claro');
    
    localStorage.setItem('pwa_estimator_tema', esClaro ? 'claro' : 'oscuro');
    
    const btn = document.querySelector('.topbar-btn[onclick*="toggleTema"]');
    if (btn) btn.textContent = esClaro ? '🌙' : '🌓';
    
    console.log(`🎨 Tema: ${esClaro ? 'claro' : 'oscuro'}`);
  },
  
  // ─────────────────────────────────────────────────────────────
  // CARGAR TEMA GUARDADO
  // ─────────────────────────────────────────────────────────────
  cargarTemaGuardado: function() {
    if (localStorage.getItem('pwa_estimator_tema') === 'claro') {
      document.body.classList.add('tema-claro');
      const btn = document.querySelector('.topbar-btn[onclick*="toggleTema"]');
      if (btn) btn.textContent = '🌙';
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // MOSTRAR TOAST
  // ─────────────────────────────────────────────────────────────
  mostrarToast: function(mensaje, tipo = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    const colores = {
      success: 'var(--green)',
      error: 'var(--rose)',
      info: 'var(--blue)'
    };
    
    toast.style.background = colores[tipo] || colores.info;
    toast.textContent = mensaje;
    toast.style.display = 'block';
    
    // Auto-ocultar
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }
};

// ─────────────────────────────────────────────────────────────
// INICIALIZAR CUANDO EL DOM ESTÉ LISTO
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (window.app) window.app.init();
});

console.log('✅ app.js listo');
