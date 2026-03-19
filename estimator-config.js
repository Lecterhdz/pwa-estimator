window.estimadorPWA = {
  
  // ─────────────────────────────────────────────────────────────
  // DISCIPLINAS DE INGENIERÍA (CON PUNTOS Y DESCRIPCIÓN)
  // ─────────────────────────────────────────────────────────────
  disciplinas: {
    electrica: {
      id: 'electrica',
      nombre: 'Eléctrica Industrial',
      icono: '⚡',
      descripcion: 'NOM/NEC, Arc Flash, Tierras, Iluminación, UPS',
      puntos: 15,
      calculos: [
        'Conductores (ampacidad NOM/NEC)',
        'Caída de tensión',
        'Corto circuito',
        'Arc Flash (NFPA 70E)',
        'Selección de interruptores',
        'Balanceo de fases',
        'Factor de potencia',
        'Bancos de capacitores',
        'Sistemas UPS',
        'Demanda máxima',
        'Canalizaciones (conduit/charola)',
        'Sistema de tierras físicas',
        'Malla de tierra IEEE-80',
        'Esfera rodante (pararrayos)',
        'Iluminación industrial (luxes)'
      ]
    },
    mecanica: {
      id: 'mecanica',
      nombre: 'Mecánica / HVAC',
      icono: '⚙️',
      descripcion: 'Carga térmica, Bombas, Flujo de aire, Ventilación',
      puntos: 15,
      calculos: [
        'Cálculo de carga térmica HVAC',
        'Selección de equipos HVAC',
        'Flujo de aire (CFM)',
        'Sistemas de extracción',
        'Ventilación industrial',
        'Balance térmico',
        'Transferencia de calor básica',
        'Dimensionamiento de bombas',
        'Caída de presión',
        'Sistemas hidráulicos',
        'Rendimiento mecánico'
      ]
    },
    civil: {
      id: 'civil',
      nombre: 'Civil / Estructural',
      icono: '🏗️',
      descripcion: 'Cimentaciones, Estructuras, Levantamientos',
      puntos: 15,
      calculos: [
        'Cimentaciones y zapatas',
        'Análisis estructural básico',
        'Volúmenes de concreto',
        'Refuerzo de acero',
        'Levantamientos topográficos',
        'Presupuestos de obra civil'
      ]
    },
    seguridad: {
      id: 'seguridad',
      nombre: 'Seguridad Industrial STPS',
      icono: '🦺',
      descripcion: 'LOTO, IPER, Análisis de riesgo, Auditorías',
      puntos: 12,
      calculos: [
        'Evaluación LOTO',
        'Análisis de riesgo laboral',
        'Matrices IPER',
        'Checklists NOM-STPS',
        'Energía incidente',
        'Permisos de trabajo',
        'Auditorías de seguridad',
        'Evaluaciones de competencia',
        'Índices de seguridad',
        'Control de EPP'
      ]
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // MOTOR DE COTIZACIÓN UNIVERSAL
  // ─────────────────────────────────────────────────────────────
  motorCotizacion: {
    base: {
      id: 'motor_base',
      nombre: 'Motor Universal de Cotización',
      descripcion: 'Cotiza materiales, mano de obra, servicios y estudios',
      puntos: 25
    },
    componentes: {
      materiales: { id: 'materiales', nombre: 'Materiales & Refacciones', puntos: 0 },
      mano_obra: { id: 'mano_obra', nombre: 'Mano de Obra Especializada', puntos: 0 },
      servicios: { id: 'servicios', nombre: 'Servicios Profesionales', puntos: 0 },
      estudios: { id: 'estudios', nombre: 'Estudios Técnicos', puntos: 0 },
      viaticos: { id: 'viaticos', nombre: 'Indirectos y Viáticos', puntos: 0 }
    },
    exportacion: {
      neodata: { id: 'neodata', nombre: 'Exportación a Neodata', puntos: 15 },
      excel: { id: 'excel', nombre: 'Exportación a Excel', puntos: 5 }
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // CAPACIDADES PRO
  // ─────────────────────────────────────────────────────────────
  capacidades: {
    offline: { id: 'offline', nombre: 'Modo Offline Completo', puntos: 30 },
    cloudSync: { id: 'cloudSync', nombre: 'Sincronización en Nube', puntos: 25 },
    erp: { id: 'erp', nombre: 'Integración con ERP', puntos: 40 },
    firmas: { id: 'firmas', nombre: 'Firmas Digitales', puntos: 12 }
  },
  
  // ─────────────────────────────────────────────────────────────
  // RANGOS DE PRECIO (ACTUALIZADOS)
  // ─────────────────────────────────────────────────────────────
  rangosPrecio: [
    { maxPuntos: 50, nivel: 'Starter', precioMin: 25000, precioMax: 45000, semanas: '4–6' },
    { maxPuntos: 90, nivel: 'Professional', precioMin: 45000, precioMax: 95000, semanas: '6–10' },
    { maxPuntos: 140, nivel: 'Enterprise', precioMin: 95000, precioMax: 180000, semanas: '10–16' },
    { maxPuntos: Infinity, nivel: 'Elite', precioMin: 180000, precioMax: null, semanas: '16+' }
  ]
};
