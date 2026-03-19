// ═══════════════════════════════════════════════════════════════
// PWA ESTIMATOR - CONFIGURACIÓN PARA COTIZAR PWAs
// ═══════════════════════════════════════════════════════════════

window.estimadorPWA = {
  
  // ─────────────────────────────────────────────────────────────
  // TIPOS DE PWA / INDUSTRIAS (PASO 1)
  // ─────────────────────────────────────────────────────────────
  tiposPWA: {
    electrica: {
      id: 'electrica',
      nombre: 'Eléctrica Industrial',
      icono: '⚡',
      descripcion: 'SmartCot, SmartEvaluation, cálculos técnicos',
      puntos: 15
    },
    mecanica: {
      id: 'mecanica',
      nombre: 'Mecánica / HVAC',
      icono: '⚙️',
      descripcion: 'Mantenimiento, monitoreo, control de equipos',
      puntos: 15
    },
    civil: {
      id: 'civil',
      nombre: 'Civil / Construcción',
      icono: '🏗️',
      descripcion: 'Seguimiento de obra, bitácora, curva S',
      puntos: 15
    },
    seguridad: {
      id: 'seguridad',
      nombre: 'Seguridad Industrial',
      icono: '🦺',
      descripcion: 'Checklists, auditorías, certificaciones STPS',
      puntos: 12
    },
    salud: {
      id: 'salud',
      nombre: 'Salud / Servicios',
      icono: '🏥',
      descripcion: 'Agendamiento, historial clínico, recordatorios',
      puntos: 15
    },
    comercio: {
      id: 'comercio',
      nombre: 'Comercio / Retail',
      icono: '🛒',
      descripcion: 'Catálogo, pedidos, inventario en tiempo real',
      puntos: 15
    },
    educacion: {
      id: 'educacion',
      nombre: 'Educación / Capacitación',
      icono: '🎓',
      descripcion: 'Cursos, evaluaciones, certificados con QR',
      puntos: 15
    },
    servicios: {
      id: 'servicios',
      nombre: 'Servicios Técnicos',
      icono: '🔧',
      descripcion: 'Cotización de servicios, agenda, seguimiento',
      puntos: 12
    },
    otro: {
      id: 'otro',
      nombre: 'Otro / Personalizado',
      icono: '🌐',
      descripcion: 'Especifica tus requerimientos únicos',
      puntos: 10
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // FUNCIONALIDADES BASE (PASO 2)
  // ─────────────────────────────────────────────────────────────
  bases: {
    cotizador: {
      id: 'cotizador',
      nombre: 'Cotizador de Servicios/Proyectos',
      descripcion: 'Catálogo de servicios, cálculo automático, PDF/Excel',
      puntos: 25
    },
    seguimiento: {
      id: 'seguimiento',
      nombre: 'Seguimiento de Obra / Proyectos',
      descripcion: 'Curva S, bitácora con fotos, alertas de hitos',
      puntos: 30
    },
    evaluaciones: {
      id: 'evaluaciones',
      nombre: 'Evaluaciones y Certificaciones',
      descripcion: 'Exámenes con scoring, certificados con QR, historial',
      puntos: 28
    },
    catalogo: {
      id: 'catalogo',
      nombre: 'Catálogo / Inventario Inteligente',
      descripcion: 'Búsqueda avanzada, control de stock, proveedores',
      puntos: 22
    },
    agenda: {
      id: 'agenda',
      nombre: 'Agenda / Gestión de Citas',
      descripcion: 'Calendario interactivo, recordatorios, WhatsApp',
      puntos: 20
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // MÓDULOS ADICIONALES (PASO 3)
  // ─────────────────────────────────────────────────────────────
  modulos: {
    // Reportes y análisis
    dashboard: { id: 'dashboard', nombre: 'Dashboard ejecutivo con KPIs', puntos: 18, categoria: 'reportes' },
    exportacion: { id: 'exportacion', nombre: 'Exportación a Excel/Neodata', puntos: 15, categoria: 'reportes' },
    graficas: { id: 'graficas', nombre: 'Gráficas personalizables', puntos: 12, categoria: 'reportes' },
    alertas: { id: 'alertas', nombre: 'Alertas automáticas por email', puntos: 10, categoria: 'reportes' },
    
    // Evidencias y multimedia
    fotos_geo: { id: 'fotos_geo', nombre: 'Fotos con geolocalización', puntos: 15, categoria: 'evidencias' },
    anotaciones: { id: 'anotaciones', nombre: 'Anotaciones sobre imágenes', puntos: 10, categoria: 'evidencias' },
    firmas: { id: 'firmas', nombre: 'Firmas digitales en pantalla', puntos: 12, categoria: 'evidencias' },
    archivos: { id: 'archivos', nombre: 'Adjuntar archivos (PDF, DOC, XLS)', puntos: 8, categoria: 'evidencias' },
    
    // Seguridad y acceso
    login: { id: 'login', nombre: 'Login con email/contraseña', puntos: 10, categoria: 'seguridad' },
    roles: { id: 'roles', nombre: 'Roles y permisos (Admin, Operador, Cliente)', puntos: 15, categoria: 'seguridad' },
    auditoria: { id: 'auditoria', nombre: 'Auditoría de acciones', puntos: 12, categoria: 'seguridad' },
    encriptacion: { id: 'encriptacion', nombre: 'Encriptación de datos sensibles', puntos: 18, categoria: 'seguridad' },
    
    // Integraciones
    nube: { id: 'nube', nombre: 'Backup automático + Multi-dispositivo', puntos: 25, categoria: 'integraciones' },
    api: { id: 'api', nombre: 'API personalizada + Webhooks', puntos: 40, categoria: 'integraciones' },
    whatsapp: { id: 'whatsapp', nombre: 'Integración con WhatsApp Business', puntos: 20, categoria: 'integraciones' },
    
    // Personalización
    branding: { id: 'branding', nombre: 'Logo y colores de tu marca', puntos: 10, categoria: 'personalizacion' },
    flujos: { id: 'flujos', nombre: 'Flujos de trabajo personalizados', puntos: 30, categoria: 'personalizacion' },
    campos: { id: 'campos', nombre: 'Campos adicionales en formularios', puntos: 15, categoria: 'personalizacion' },
    white: { id: 'white', nombre: 'White Label (sin marca del desarrollador)', puntos: 50, categoria: 'personalizacion' },
    
    // Nuevos
    push: { id: 'push', nombre: 'Notificaciones Push en tiempo real', puntos: 18, categoria: 'nuevos' },
    reportes: { id: 'reportes', nombre: 'Generador de Reportes PDF personalizados', puntos: 22, categoria: 'nuevos' }
  },
  
  // ─────────────────────────────────────────────────────────────
  // ESCALA DE USUARIOS (PASO 4)
  // ─────────────────────────────────────────────────────────────
  escalas: [
    { min: 1, max: 5, puntos: 0, etiqueta: '1–5 usuarios', precio: 0 },
    { min: 6, max: 20, puntos: 12, etiqueta: '6–20 usuarios', precio: 2500 },
    { min: 21, max: 50, puntos: 22, etiqueta: '21–50 usuarios', precio: 6000 },
    { min: 51, max: 100, puntos: 35, etiqueta: '51–100 usuarios', precio: 12000 },
    { min: 101, max: 999999, puntos: 50, etiqueta: '100+ usuarios', precio: null }
  ],
  
  // ─────────────────────────────────────────────────────────────
  // RANGOS DE PRECIO (MXN) - PARA PWAs
  // ─────────────────────────────────────────────────────────────
  rangosPrecio: [
    { maxPuntos: 60, nivel: 'Básico', precioMin: 15000, precioMax: 35000, semanas: '3–5', descripcion: 'PWA funcional con características esenciales' },
    { maxPuntos: 100, nivel: 'Profesional', precioMin: 35000, precioMax: 85000, semanas: '6–10', descripcion: 'PWA completa con módulos avanzados' },
    { maxPuntos: 150, nivel: 'Enterprise', precioMin: 85000, precioMax: 180000, semanas: '10–16', descripcion: 'PWA empresarial con integraciones y personalización' },
    { maxPuntos: Infinity, nivel: 'A Medida', precioMin: 180000, precioMax: null, semanas: '16+', descripcion: 'Solución 100% personalizada con código fuente opcional' }
  ]
};
