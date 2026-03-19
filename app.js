// ═══════════════════════════════════════════════════════════════
// PWA ESTIMATOR - APLICACIÓN PRINCIPAL (CORREGIDO)
// ═══════════════════════════════════════════════════════════════

console.log('🔧 PWA Estimator app.js cargado');

window.app = {
  pantallaActual: 'estimador-screen',
  esAdmin: false,
  ADMIN_PASSWORD: 'TU_CONTRASEÑA_AQUI', // ⚠️ CAMBIA ESTO
  
  // ─────────────────────────────────────────────────────────────
  // INICIALIZAR APP
  // ─────────────────────────────────────────────────────────────
  init: async function() {
    try {
      console.log('🔧 PWA Estimator iniciando...');
      
      // Forzar scroll al inicio
      window.scrollTo(0, 0);
      
      // Cargar tema guardado
      this.cargarTemaGuardado();
      
      // Verificar sesión admin
      this.verificarSesionAdmin();
      
      // Esperar a que DB esté lista
      await this.esperarDB();
      
      // Si es admin, cargar diagnósticos
      if (this.esAdmin) {
        await this.cargarDiagnosticos();
      }
      
      // Mostrar login si no es admin
      if (!this.esAdmin) {
        this.mostrarLogin();
      }
      
      // Configurar navegación
      this.configurarNavegacion();
      
      console.log('✅ PWA Estimator listo');
      console.log('🔐 Modo:', this.esAdmin ? 'ADMIN' : 'CLIENTE');
      
    } catch (error) {
      console.error('❌ Error en inicialización:', error);
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
  // MOSTRAR LOGIN (CORREGIDO)
  // ─────────────────────────────────────────────────────────────
  mostrarLogin: function() {
    const modal = document.getElementById('login-modal');
    if (modal) {
      modal.style.display = 'flex';
      modal.style.visibility = 'visible';
      modal.style.opacity = '1';
      modal.classList.add('active');
    }
    
    // Ocultar AMBOS sidebars
    const sidebarAdmin = document.getElementById('sidebar-admin');
    const sidebarCliente = document.getElementById('sidebar-cliente');
    
    if (sidebarAdmin) {
      sidebarAdmin.style.setProperty('display', 'none', 'important');
      sidebarAdmin.classList.remove('visible');
    }
    if (sidebarCliente) {
      sidebarCliente.style.setProperty('display', 'none', 'important');
      sidebarCliente.classList.remove('visible');
    }
    
    // Forzar scroll al inicio
    window.scrollTo(0, 0);
    
    console.log('🔐 Login mostrado');
  },
  
  // ─────────────────────────────────────────────────────────────
  // VERIFICAR ADMIN (CORREGIDO - MODAL SÍ SE OCULTA)
  // ─────────────────────────────────────────────────────────────
  verificarAdmin: function() {
    const passwordInput = document.getElementById('admin-password');
    const password = passwordInput?.value || '';
    
    if (password === this.ADMIN_PASSWORD) {
      // Guardar sesión
      localStorage.setItem('pwa_estimator_admin', 'true');
      localStorage.setItem('pwa_estimator_admin_time', Date.now().toString());
      
      this.esAdmin = true;
      
      // ⚠️ OCULTAR LOGIN COMPLETAMENTE
      const modal = document.getElementById('login-modal');
      if (modal) {
        modal.style.setProperty('display', 'none', 'important');
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
        modal.classList.remove('active');
      }
      
      // ⚠️ MOSTRAR SIDEBAR ADMIN
      const sidebarAdmin = document.getElementById('sidebar-admin');
      const sidebarCliente = document.getElementById('sidebar-cliente');
      
      if (sidebarAdmin) {
        sidebarAdmin.style.setProperty('display', 'flex', 'important');
        sidebarAdmin.classList.add('visible');
      }
      if (sidebarCliente) {
        sidebarCliente.style.setProperty('display', 'none', 'important');
        sidebarCliente.classList.remove('visible');
      }
      
      // ⚠️ FORZAR SCROLL AL INICIO
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Cargar diagnósticos
      this.cargarDiagnosticos();
      
      // Mostrar toast
      this.mostrarToast('✅ Bienvenido Admin', 'success');
      
      // Limpiar input
      if (passwordInput) passwordInput.value = '';
      
      console.log('✅ Admin autenticado');
      
    } else {
      // Contraseña incorrecta
      if (passwordInput) {
        passwordInput.classList.add('error');
        passwordInput.style.borderColor = 'var(--rose)';
      }
      this.mostrarToast('❌ Contraseña incorrecta', 'error');
      
      setTimeout(() => {
        if (passwordInput) {
          passwordInput.classList.remove('error');
          passwordInput.style.borderColor = '';
        }
      }, 2000);
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // ENTRAR COMO CLIENTE (CORREGIDO - LAYOUT)
  // ─────────────────────────────────────────────────────────────
  entrarComoCliente: function() {
    this.esAdmin = false;
    
    // ⚠️ OCULTAR LOGIN COMPLETAMENTE
    const modal = document.getElementById('login-modal');
    if (modal) {
      modal.style.setProperty('display', 'none', 'important');
      modal.style.visibility = 'hidden';
      modal.style.opacity = '0';
      modal.classList.remove('active');
    }
    
    // ⚠️ MOSTRAR SIDEBAR CLIENTE
    const sidebarAdmin = document.getElementById('sidebar-admin');
    const sidebarCliente = document.getElementById('sidebar-cliente');
    
    if (sidebarAdmin) {
      sidebarAdmin.style.setProperty('display', 'none', 'important');
      sidebarAdmin.classList.remove('visible');
    }
    if (sidebarCliente) {
      sidebarCliente.style.setProperty('display', 'flex', 'important');
      sidebarCliente.classList.add('visible');
    }
    
    // ⚠️ FORZAR SCROLL AL INICIO
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // ⚠️ ESPERAR QUE EL LAYOUT SE ACTUALICE
    setTimeout(() => {
      // Forzar reflow
      document.body.offsetHeight;
      
      // Mostrar pantalla estimador
      this.mostrarPantalla('estimador-screen');
      
      // Verificar que el contenido esté en su lugar
      const content = document.querySelector('.content');
      const estimadorScreen = document.getElementById('estimador-screen');
      
      if (content && estimadorScreen) {
        content.scrollLeft = 0;
        estimadorScreen.scrollIntoView({ top: 0, behavior: 'auto' });
      }
    }, 100);
    
    this.mostrarToast('👤 Modo Cliente Activado', 'info');
    
    console.log('✅ Modo cliente activado');
  },
  
  // ─────────────────────────────────────────────────────────────
  // VERIFICAR SESIÓN ADMIN (AL CARGAR)
  // ─────────────────────────────────────────────────────────────
  verificarSesionAdmin: function() {
    const adminSession = localStorage.getItem('pwa_estimator_admin');
    const adminTime = localStorage.getItem('pwa_estimator_admin_time');
    
    // Sesión válida por 24 horas (86400000 ms)
    const EXPIRATION = 24 * 60 * 60 * 1000;
    
    if (adminSession === 'true' && adminTime) {
      const timeDiff = Date.now() - parseInt(adminTime);
      if (timeDiff < EXPIRATION) {
        this.esAdmin = true;
        
        // Mostrar sidebar admin
        const sidebarAdmin = document.getElementById('sidebar-admin');
        const sidebarCliente = document.getElementById('sidebar-cliente');
        
        if (sidebarAdmin) {
          sidebarAdmin.style.setProperty('display', 'flex', 'important');
          sidebarAdmin.classList.add('visible');
        }
        if (sidebarCliente) {
          sidebarCliente.style.setProperty('display', 'none', 'important');
          sidebarCliente.classList.remove('visible');
        }
        
        // NO mostrar login
        const modal = document.getElementById('login-modal');
        if (modal) {
          modal.style.setProperty('display', 'none', 'important');
        }
        
        console.log('✅ Sesión admin válida');
        return;
      }
    }
    
    // Sesión inválida o expirada
    this.esAdmin = false;
  },
  
  // ─────────────────────────────────────────────────────────────
  // CERRAR SESIÓN ADMIN
  // ─────────────────────────────────────────────────────────────
  cerrarSesionAdmin: function() {
    if (confirm('¿Cerrar sesión de admin?')) {
      localStorage.removeItem('pwa_estimator_admin');
      localStorage.removeItem('pwa_estimator_admin_time');
      this.esAdmin = false;
      
      // Mostrar login
      this.mostrarLogin();
      
      // Ir al estimador
      this.mostrarPantalla('estimador-screen');
      
      this.mostrarToast('🚪 Sesión cerrada', 'info');
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // MOSTRAR PANTALLA
  // ─────────────────────────────────────────────────────────────
  mostrarPantalla: function(pantallaId) {
    // Seguridad: Si no es admin, no puede ver admin-diagnosticos
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
      
      // Casos especiales por pantalla
      switch(pantallaId) {
        case 'estimador-screen':
          if (window.estimatorUI && typeof window.estimatorUI.init === 'function') {
            window.estimatorUI.init();
          }
          break;
        case 'admin-diagnosticos-screen':
          if (this.esAdmin) {
            this.cargarDiagnosticos();
          }
          break;
      }
      
      console.log('📍 Pantalla:', pantallaId);
    }
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
  // CARGAR DIAGNÓSTICOS (CON MANEJO DE ERRORES)
  // ─────────────────────────────────────────────────────────────
  cargarDiagnosticos: async function() {
    try {
      if (!window.db?.diagnosticos) {
        console.warn('⚠️ DB no disponible');
        return;
      }
      
      if (window.adminDiagnosticos && typeof window.adminDiagnosticos.cargar === 'function') {
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
      
      // Si es error de permisos, mostrar mensaje útil
      if (error.code === 'permission-denied') {
        this.mostrarToast('🔐 Error de permisos en Firebase. Revisa las reglas de Firestore.', 'error');
      }
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // CONFIGURAR NAVEGACIÓN
  // ─────────────────────────────────────────────────────────────
  configurarNavegacion: function() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.mostrarPantalla('estimador-screen');
      }
    });
  },
  // ─────────────────────────────────────────────────────────────
  // TOGGLE SIDEBAR (MÓVIL)
  // ─────────────────────────────────────────────────────────────
  toggleSidebar: function() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (sidebar) sidebar.classList.toggle('visible');
    if (overlay) overlay.classList.toggle('active');
    
    // Prevenir scroll del body cuando sidebar está abierto
    document.body.style.overflow = sidebar?.classList.contains('visible') ? 'hidden' : '';
  }, 
  // ─────────────────────────────────────────────────────────────
  // TOGGLE TEMA (CLARO/OSCURO)
  // ─────────────────────────────────────────────────────────────
  toggleTema: function() {
    const body = document.body;
    const temaActual = body.classList.contains('tema-claro') ? 'oscuro' : 'claro';
    
    if (temaActual === 'claro') {
      body.classList.add('tema-claro');
      localStorage.setItem('pwa_estimator_tema', 'claro');
      console.log('🌞 Tema claro activado');
    } else {
      body.classList.remove('tema-claro');
      localStorage.setItem('pwa_estimator_tema', 'oscuro');
      console.log('🌙 Tema oscuro activado');
    }
    
    const btn = document.querySelector('.topbar-btn[onclick*="toggleTema"]');
    if (btn) {
      btn.textContent = temaActual === 'claro' ? '🌙' : '🌓';
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // CARGAR TEMA GUARDADO
  // ─────────────────────────────────────────────────────────────
  cargarTemaGuardado: function() {
    const temaGuardado = localStorage.getItem('pwa_estimator_tema');
    if (temaGuardado === 'claro') {
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
    
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  if (window.app) {
    window.app.init();
  }
});

console.log('✅ app.js listo');
