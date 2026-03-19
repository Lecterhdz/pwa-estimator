// ═══════════════════════════════════════════════════════════════
// SMARTCOT - NÚCLEO DEL ESTIMADOR PWA
// ═══════════════════════════════════════════════════════════════

console.log('🧮 estimador-core.js cargado');

// ─────────────────────────────────────────────────────────────
// CALCULAR PUNTOS Y NIVEL
// ─────────────────────────────────────────────────────────────
window.estimadorPWA.calcular = function(seleccion) {
  let puntos = 20; // Base de Plataforma PWA
  let detalles = {
    disciplinas: [],
    bonoMultidisciplinario: false,
    motorCotizacion: null,
    capacidades: [],
    totalPuntos: 0
  };
  
  try {
    // 1️⃣ DISCIPLINAS DE INGENIERÍA
    if (seleccion.disciplinas && Array.isArray(seleccion.disciplinas)) {
      seleccion.disciplinas.forEach(discId => {
        if (estimadorPWA.disciplinas[discId]) {
          const disc = estimadorPWA.disciplinas[discId];
          puntos += disc.puntos;
          detalles.disciplinas.push(disc);
        }
      });
      
      // ⚠️ BONO MULTIDISCIPLINARIO: +30 pts si ≥3 disciplinas
      if (detalles.disciplinas.length >= 3) {
        puntos += 30;
        detalles.bonoMultidisciplinario = true;
      }
    }
    
    // 2️⃣ MOTOR DE COTIZACIÓN UNIVERSAL
    if (seleccion.motorCotizacion) {
      const motor = estimadorPWA.motorCotizacion.base;
      puntos += motor.puntos;
      detalles.motorCotizacion = { ...motor, componentes: [] };
      
      if (seleccion.componentes && Array.isArray(seleccion.componentes)) {
        seleccion.componentes.forEach(compId => {
          if (estimadorPWA.motorCotizacion.componentes[compId]) {
            detalles.motorCotizacion.componentos.push(
              estimadorPWA.motorCotizacion.componentes[compId]
            );
          }
        });
      }
      
      if (seleccion.exportacionNeodata) {
        puntos += estimadorPWA.motorCotizacion.exportacion.neodata.puntos;
        detalles.motorCotizacion.exportacion = 'Neodata + Excel';
      } else if (seleccion.exportacionExcel) {
        puntos += estimadorPWA.motorCotizacion.exportacion.excel.puntos;
        detalles.motorCotizacion.exportacion = 'Excel';
      }
    }
    
    // 3️⃣ CAPACIDADES PRO
    if (seleccion.capacidades && Array.isArray(seleccion.capacidades)) {
      seleccion.capacidades.forEach(capId => {
        if (estimadorPWA.capacidades[capId]) {
          const cap = estimadorPWA.capacidades[capId];
          puntos += cap.puntos;
          detalles.capacidades.push(cap);
        }
      });
    }
    
    // 4️⃣ ESCALA + PERSONALIZACIÓN
    if (seleccion.escala) puntos += seleccion.escala.puntos || 0;
    if (seleccion.personalizacion) puntos += seleccion.personalizacion.puntos || 0;
    
    // 5️⃣ CALCULAR NIVEL Y RANGO DE PRECIO
    const rango = estimadorPWA.rangosPrecio.find(r => puntos <= r.maxPuntos);
    
    detalles.totalPuntos = puntos;
    detalles.nivel = rango?.nivel || 'Custom';
    detalles.rangoPrecio = rango ? {
      min: rango.precioMin,
      max: rango.precioMax,
      texto: rango.precioMax 
        ? `$${rango.precioMin.toLocaleString('es-MX')} – $${rango.precioMax.toLocaleString('es-MX')} MXN`
        : `Desde $${rango.precioMin.toLocaleString('es-MX')} MXN`
    } : null;
    detalles.semanas = rango?.semanas || 'Por definir';
    
    console.log('✅ Estimación calculada:', detalles);
    return { exito: true, datos: detalles };
    
  } catch (error) {
    console.error('❌ Error calculando estimación:', error);
    return { exito: false, error: error.message };
  }
};

// ─────────────────────────────────────────────────────────────
// GENERAR MENSAJE DE CIERRE AUTOMÁTICO
// ─────────────────────────────────────────────────────────────
window.estimadorPWA.generarMensajeCierre = function(detalles) {
  const discNombres = detalles.disciplinas.map(d => d.nombre.split(' ')[0]);
  const esMultidisciplinario = detalles.bonoMultidisciplinario || detalles.disciplinas.length >= 2;
  
  let mensaje = `Configuración Técnica Detectada: `;
  
  if (esMultidisciplinario) {
    mensaje += `Sistema Multidisciplinario (${discNombres.join('/')}) `;
  } else if (detalles.disciplinas[0]) {
    mensaje += `Sistema Especializado en ${detalles.disciplinas[0].nombre} `;
  }
  
  if (detalles.motorCotizacion) {
    mensaje += `con Motor de Costos Avanzado `;
  }
  
  mensaje += `. Nivel de Complejidad: ${detalles.nivel}. `;
  mensaje += `Tu PWA está lista para gestionar proyectos de alta escala `;
  
  if (detalles.disciplinas.some(d => d.id === 'electrica' || d.id === 'seguridad')) {
    mensaje += `con cumplimiento de NOM y NFPA`;
  } else if (detalles.disciplinas.some(d => d.id === 'mecanica')) {
    mensaje += `con análisis térmico y de flujo`;
  }
  
  mensaje += `.`;
  
  return mensaje;
};

// ─────────────────────────────────────────────────────────────
// CALCULAR LEAD SCORE (PARA PRIORIZAR SEGUIMIENTO)
// ─────────────────────────────────────────────────────────────
window.estimadorPWA.calcularLeadScore = function(resultado) {
  let score = 0;
  
  if (resultado.nivel === 'Enterprise') score += 40;
  else if (resultado.nivel === 'Professional') score += 25;
  else if (resultado.nivel === 'Starter') score += 10;
  
  if (resultado.motorCotizacion) score += 20;
  if (resultado.bonoMultidisciplinario) score += 15;
  if (resultado.capacidades?.some(c => c.id === 'erp')) score += 15;
  if (resultado.capacidades?.some(c => c.id === 'offline')) score += 10;
  if (resultado.rangoPrecio?.min >= 95000) score += 20;
  else if (resultado.rangoPrecio?.min >= 45000) score += 10;
  
  return Math.min(100, score);
};

console.log('✅ estimador-core.js listo');