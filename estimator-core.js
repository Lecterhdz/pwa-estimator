// ═══════════════════════════════════════════════════════════════
// SMARTCOT - NÚCLEO DEL ESTIMADOR PWA
// ═══════════════════════════════════════════════════════════════

console.log('🧮 estimador-core.js cargado');

window.estimadorPWA.calcular = function(seleccion) {
  let puntos = 0;
  let detalles = {
    tipoPWA: null,
    base: null,
    modulos: [],
    escalas: null,
    totalPuntos: 0
  };
  
  // 1️⃣ Tipo de PWA
  if (seleccion.tipoPWA && estimadorPWA.tiposPWA[seleccion.tipoPWA]) {
    const tipo = estimadorPWA.tiposPWA[seleccion.tipoPWA];
    puntos += tipo.puntos;
    detalles.tipoPWA = tipo;
  }
  
  // 2️⃣ Base funcional
  if (seleccion.base && estimadorPWA.bases[seleccion.base]) {
    const base = estimadorPWA.bases[seleccion.base];
    puntos += base.puntos;
    detalles.base = base;
  }
  
  // 3️⃣ Módulos adicionales
  if (seleccion.modulos && Array.isArray(seleccion.modulos)) {
    seleccion.modulos.forEach(modId => {
      if (estimadorPWA.modulos[modId]) {
        const mod = estimadorPWA.modulos[modId];
        puntos += mod.puntos;
        detalles.modulos.push(mod);
      }
    });
  }
  
    // 4️⃣ Escala de usuarios
    if (seleccion.escala) {
      const escala = estimadorPWA.escalas.find(e => 
        seleccion.escala.includes(e.etiqueta.split(' ')[0]) || 
        e.etiqueta.includes(seleccion.escala)
      );
    if (escala) {
      puntos += escala.puntos;
      detalles.escala = escala;
    }
  }
  
  // 5️⃣ Calcular nivel y precio
  const rango = estimadorPWA.rangosPrecio.find(r => puntos <= r.maxPuntos);
  
  detalles.totalPuntos = puntos;
  detalles.nivel = rango?.nivel || 'Custom';
  detalles.rangoPrecio = rango ? {
    min: rango.precioMin,
    max: rango.precioMax,
    texto: rango.precioMax 
      ? `$${rango.precioMin.toLocaleString('es-MX')} – $${rango.precioMax.toLocaleString('es-MX')} MXN`
      : `Desde $${rango.precioMin.toLocaleString('es-MX')} MXN`,
    descripcion: rango.descripcion
  } : null;
  detalles.semanas = rango?.semanas || 'Por definir';
  
  return { exito: true, datos: detalles };
};

// ─────────────────────────────────────────────────────────────
// GENERAR MENSAJE DE CIERRE (CORREGIDO PARA PWAs)
// ─────────────────────────────────────────────────────────────
window.estimadorPWA.generarMensajeCierre = function(detalles) {
  try {
    const tipo = detalles.tipoPWA?.nombre || 'PWA';
    const base = detalles.base?.nombre || 'funcionalidad base';
    
    let mensaje = `✅ Configuración detectada: `;
    mensaje += `PWA para ${tipo} con ${base}. `;
    
    if (detalles.modulos && detalles.modulos.length > 0) {
      mensaje += `Incluye ${detalles.modulos.length} módulos adicionales. `;
    }
    
    mensaje += `Nivel: ${detalles.nivel || 'Custom'}. `;
    mensaje += `Tiempo estimado: ${detalles.semanas || 'Por definir'}.`;
    
    return mensaje;
    
  } catch (error) {
    console.error('❌ Error generando mensaje de cierre:', error);
    return `✅ Diagnóstico completado. Te contactaremos pronto con tu cotización formal.`;
  }
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
