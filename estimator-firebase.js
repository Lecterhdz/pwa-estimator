// ═══════════════════════════════════════════════════════════════
// SMARTCOT - GUARDADO DE DIAGNÓSTICOS EN FIREBASE
// ═══════════════════════════════════════════════════════════════

console.log('🔥 estimador-firebase.js cargado');

// ─────────────────────────────────────────────────────────────
// GUARDAR DIAGNÓSTICO EN FIREBASE
// ─────────────────────────────────────────────────────────────
window.estimadorPWA.guardarDiagnostico = async function(datosCliente, seleccion, resultado) {
  try {
    // Verificar que Firebase esté disponible
    if (!window.db || !window.db.diagnosticos) {
      console.warn('⚠️ Firebase no está listo para guardar diagnósticos');
      
      // Fallback: guardar en localStorage
      const backups = JSON.parse(localStorage.getItem('diagnosticos-backup') || '[]');
      backups.push({ 
        fecha: new Date().toISOString(), 
        datos: { datosCliente, seleccion, resultado } 
      });
      localStorage.setItem('diagnosticos-backup', JSON.stringify(backups));
      
      return { exito: false, razon: 'Firebase no disponible', fallback: true };
    }
    
    // Preparar registro para guardar
    const diagnostico = {
      id: 'DIAG-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      fecha: new Date().toISOString(),
      timestamp: Date.now(),
      
      // Datos del cliente
      cliente: {
        empresa: datosCliente.empresa || 'No especificada',
        industria: datosCliente.industria || 'No especificada',
        email: datosCliente.email || null,
        telefono: datosCliente.telefono || null,
        pais: datosCliente.pais || 'México'
      },
      
      // Selección técnica del configurador
      seleccion: {
        disciplinas: seleccion.disciplinas || [],
        bonoMultidisciplinario: seleccion.disciplinas?.length >= 3 || false,
        motorCotizacion: seleccion.motorCotizacion || false,
        componentes: seleccion.componentes || [],
        exportacion: seleccion.exportacionNeodata ? 'Neodata' : (seleccion.exportacionExcel ? 'Excel' : null),
        capacidades: seleccion.capacidades || []
      },
      
      // Resultado del cálculo
      resultado: {
        puntos: resultado.totalPuntos,
        nivel: resultado.nivel,
        rangoPrecio: resultado.rangoPrecio,
        semanas: resultado.semanas,
        mensajeCierre: estimadorPWA.generarMensajeCierre(resultado)
      },
      
      // Metadatos para filtrado y análisis
      meta: {
        origen: 'configurador-web',
        userAgent: navigator.userAgent,
        url: window.location.href,
        leadScore: estimadorPWA.calcularLeadScore(resultado)
      }
    };
    
    // Guardar en Firestore (IndexedDB local + sync a nube)
    await window.db.diagnosticos.add(diagnostico);
    
    console.log('✅ Diagnóstico guardado:', diagnostico.id);
    return { exito: true, id: diagnostico.id, datos: diagnostico };
    
  } catch (error) {
    console.error('❌ Error guardando diagnóstico:', error);
    
    // Fallback: guardar en localStorage
    const backups = JSON.parse(localStorage.getItem('diagnosticos-backup') || '[]');
    backups.push({ 
      fecha: new Date().toISOString(), 
      datos: { datosCliente, seleccion, resultado } 
    });
    localStorage.setItem('diagnosticos-backup', JSON.stringify(backups));
    
    return { exito: false, error: error.message, fallback: true };
  }
};

// ─────────────────────────────────────────────────────────────
// REINTENTAR ENVÍOS PENDIENTES (cuando hay conexión)
// ─────────────────────────────────────────────────────────────
window.estimadorPWA.reintentarPendientes = async function() {
  const pendientes = JSON.parse(localStorage.getItem('diagnosticos-backup') || '[]');
  if (pendientes.length === 0) return;
  
  console.log(`🔄 Reintentando ${pendientes.length} diagnóstico(s) pendiente(s)...`);
  
  const exitosos = [];
  
  for (const item of pendientes) {
    const resultado = await estimadorPWA.guardarDiagnostico(
      item.datos.datosCliente,
      item.datos.seleccion,
      item.datos.resultado
    );
    
    if (resultado.exito) {
      exitosos.push(item);
    }
  }
  
  // Remover exitosos de pendientes
  const restantes = pendientes.filter(item => !exitosos.includes(item));
  localStorage.setItem('diagnosticos-backup', JSON.stringify(restantes));
  
  console.log(`✅ Enviados: ${exitosos.length} | Pendientes: ${restantes.length}`);
};

// Auto-reintentar cuando el navegador recupera conexión
window.addEventListener('online', () => {
  if (window.estimadorPWA?.reintentarPendientes) {
    estimadorPWA.reintentarPendientes();
  }
});

console.log('✅ estimador-firebase.js listo');
