// ═══════════════════════════════════════════════════════════════
// PWA ESTIMATOR - INTERFAZ DE USUARIO (CORREGIDO)
// ═══════════════════════════════════════════════════════════════

console.log('🎨 estimator-ui.js cargado');

window.estimatorUI = {
  pasoActual: 1,
  seleccion: {
    disciplinas: [],
    motorCotizacion: false,
    componentes: [],
    exportacionNeodata: false,
    exportacionExcel: false,
    capacidades: [],
    escala: null,
    personalizacion: null
  },
  
  // ─────────────────────────────────────────────────────────────
  // INICIALIZAR
  // ─────────────────────────────────────────────────────────────
  init: function() {
    this.agregarListeners();
    this.actualizarPuntosVisibles();
    console.log('✅ Configurador UI inicializado');
  },
  
  // ─────────────────────────────────────────────────────────────
  // AGREGAR EVENT LISTENERS (CORREGIDO)
  // ─────────────────────────────────────────────────────────────
  agregarListeners: function() {
    // Disciplinas - Click en el label/card completo
    document.querySelectorAll('.disciplina-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Prevenir propagación pero NO el default del checkbox
        const checkbox = card.querySelector('input[type="checkbox"]');
        if (checkbox) {
          // Toggle manual del checkbox
          checkbox.checked = !checkbox.checked;
        }
        
        // Actualizar estado
        this.actualizarSeleccionDisciplinas();
        this.actualizarPuntosVisibles();
        this.actualizarBadgeMultidisciplinario();
      });
    });
    
    // Componentes del motor
    document.querySelectorAll('input[name="componente"]').forEach(cb => {
      cb.addEventListener('change', () => {
        this.actualizarSeleccionComponentes();
        this.actualizarPuntosVisibles();
      });
    });
    
    // Motor cotización toggle
    const motorToggle = document.getElementById('motor-cotizacion-toggle');
    if (motorToggle) {
      motorToggle.addEventListener('change', (e) => {
        this.seleccion.motorCotizacion = e.target.checked;
        this.actualizarPuntosVisibles();
      });
    }
    
    // Exportación Neodata
    const neodataSync = document.getElementById('neodata-sync');
    if (neodataSync) {
      neodataSync.addEventListener('change', (e) => {
        this.seleccion.exportacionNeodata = e.target.checked;
        this.actualizarPuntosVisibles();
      });
    }
    
    // Capacidades
    document.querySelectorAll('input[name="capacidad"]').forEach(cb => {
      cb.addEventListener('change', () => {
        this.actualizarSeleccionCapacidades();
        this.actualizarPuntosVisibles();
      });
    });
  },
  
  // ─────────────────────────────────────────────────────────────
  // ACTUALIZAR SELECCIÓN
  // ─────────────────────────────────────────────────────────────
  actualizarSeleccionDisciplinas: function() {
    this.seleccion.disciplinas = Array.from(
      document.querySelectorAll('input[name="disciplina"]:checked')
    ).map(cb => cb.value);
  },
  
  actualizarSeleccionComponentes: function() {
    this.seleccion.componentes = Array.from(
      document.querySelectorAll('input[name="componente"]:checked')
    ).map(cb => cb.value);
  },
  
  actualizarSeleccionCapacidades: function() {
    this.seleccion.capacidades = Array.from(
      document.querySelectorAll('input[name="capacidad"]:checked')
    ).map(cb => cb.value);
  },
  
  // ─────────────────────────────────────────────────────────────
  // ACTUALIZAR PUNTOS (CORREGIDO - SIN OPTIONAL CHAINING EN ASIGNACIÓN)
  // ─────────────────────────────────────────────────────────────
  actualizarPuntosVisibles: function() {
    let puntos = 20;
    
    this.seleccion.disciplinas.forEach(discId => {
      const disc = estimadorPWA.disciplinas[discId];
      if (disc) puntos += disc.puntos;
    });
    
    if (this.seleccion.disciplinas.length >= 3) puntos += 30;
    
    if (this.seleccion.motorCotizacion) {
      puntos += estimadorPWA.motorCotizacion.base.puntos;
    }
    
    if (this.seleccion.exportacionNeodata) puntos += 15;
    else if (this.seleccion.exportacionExcel) puntos += 5;
    
    this.seleccion.capacidades.forEach(capId => {
      const cap = estimadorPWA.capacidades[capId];
      if (cap) puntos += cap.puntos;
    });
    
    // ✅ CORREGIDO: Verificar elemento antes de asignar
    const resumen = document.getElementById('puntos-resumen');
    if (resumen) {
      resumen.textContent = `${puntos} puntos estimados`;
    }
    
    let nivel = 'Starter';
    if (puntos > 90) nivel = 'Professional';
    if (puntos > 140) nivel = 'Enterprise';
    if (puntos > 200) nivel = 'Elite';
    
    const elNivel = document.getElementById('nivel-resumen');
    if (elNivel) {
      elNivel.textContent = `Nivel: ${nivel}`;
    }
  },
  
  actualizarBadgeMultidisciplinario: function() {
    const count = this.seleccion.disciplinas.length;
    const badge = document.getElementById('badge-multidisciplinario');
    
    if (badge) {
      if (count >= 3) {
        badge.style.display = 'inline-block';
        badge.textContent = '🎯 +30 pts Bono Multidisciplinario';
      } else {
        badge.style.display = 'none';
      }
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // NAVEGACIÓN
  // ─────────────────────────────────────────────────────────────
  irAPaso: function(paso) {
    document.querySelectorAll('[id^="paso-"]').forEach(el => {
      el.style.display = 'none';
    });
    
    const pasoActual = document.getElementById(`paso-${paso}`);
    if (pasoActual) {
      pasoActual.style.display = 'block';
    }
    
    document.querySelectorAll('.step').forEach((step, index) => {
      if (index + 1 <= paso) {
        step.classList.add('active');
        step.style.background = 'var(--blue)';
        step.style.color = 'white';
      } else {
        step.classList.remove('active');
        step.style.background = 'var(--bg2)';
        step.style.color = 'var(--ink3)';
      }
    });
    
    this.pasoActual = paso;
  },
  
  // ─────────────────────────────────────────────────────────────
  // SIGUIENTE PASO (CORREGIDO)
  // ─────────────────────────────────────────────────────────────
  siguientePaso: function(paso) {
    // Validar paso 1: Al menos una disciplina seleccionada
    if (paso === 2) {
      this.actualizarSeleccionDisciplinas();
      
      if (!this.seleccion.disciplinas || this.seleccion.disciplinas.length === 0) {
        alert('⚠️ Selecciona al menos una disciplina para continuar');
        
        // Highlight visual del error
        const paso1 = document.getElementById('paso-1');
        if (paso1) {
          paso1.style.animation = 'shake 0.5s ease';
          setTimeout(() => {
            paso1.style.animation = '';
          }, 500);
        }
        
        return;
      }
    }
    
    this.irAPaso(paso);
  },
  // ─────────────────────────────────────────────────────────────
  // ANTERIOR PASO (FUNCIÓN FALTANTE)
  // ─────────────────────────────────────────────────────────────
  anteriorPaso: function(paso) {
    // Validar que el paso sea válido
    if (paso < 1 || paso > 4) return;
    
    // Ir al paso solicitado
    this.irAPaso(paso);
    
    console.log('⬅️ Regresando al paso:', paso);
  },  
  // ─────────────────────────────────────────────────────────────
  // FINALIZAR (CORREGIDO)
  // ─────────────────────────────────────────────────────────────
  finalizarDiagnostico: async function() {
    try {
      const datosCliente = {
        empresa: document.getElementById('cliente-empresa')?.value || 'No especificada',
        email: document.getElementById('cliente-email')?.value || '',
        telefono: document.getElementById('cliente-telefono')?.value || '',
        industria: document.getElementById('cliente-industria')?.value || ''
      };
      
      if (datosCliente.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosCliente.email)) {
        alert('⚠️ Ingresa un email válido');
        return;
      }
      
      const calculo = estimadorPWA.calcular(this.seleccion);
      if (!calculo.exito) {
        alert('⚠️ Error calculando estimación');
        return;
      }
      
      const resultado = calculo.datos;
      const mensaje = estimadorPWA.generarMensajeCierre(resultado);
      
      // ✅ CORREGIDO: Verificar elemento antes de asignar
      const elMensaje = document.getElementById('mensaje-cierre');
      if (elMensaje) {
        elMensaje.textContent = mensaje;
      }
      
      const guardado = await estimadorPWA.guardarDiagnostico(datosCliente, this.seleccion, resultado);
      
      if (guardado.exito) {
        alert('✅ ¡Diagnóstico guardado!\n\nTe contactaremos pronto.');
      } else if (guardado.fallback) {
        alert('✅ Diagnóstico guardado localmente.');
      }
      
      this.mostrarResultado(resultado, mensaje);
      
    } catch (error) {
      console.error('❌ Error finalizando diagnóstico:', error);
      alert('❌ Error: ' + error.message);
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // MOSTRAR RESULTADO (CORREGIDO)
  // ─────────────────────────────────────────────────────────────
  mostrarResultado: function(resultado, mensaje) {
    this.irAPaso('resultado');
    
    const contenido = document.getElementById('diagnostico-contenido');
    if (!contenido) return;
    
    contenido.innerHTML = `
      <div style="margin-bottom:20px;">
        <h4 style="color:var(--ink);margin-bottom:10px;">${mensaje}</h4>
      </div>
      
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;margin-bottom:20px;">
        <div style="background:var(--bg);padding:15px;border-radius:10px;text-align:center;">
          <div style="font-size:24px;font-weight:700;color:var(--blue);">${resultado.nivel || '—'}</div>
          <div style="font-size:11px;color:var(--ink4);">Nivel</div>
        </div>
        <div style="background:var(--bg);padding:15px;border-radius:10px;text-align:center;">
          <div style="font-size:24px;font-weight:700;color:var(--green);">${resultado.totalPuntos || 0} pts</div>
          <div style="font-size:11px;color:var(--ink4);">Puntos</div>
        </div>
        <div style="background:var(--bg);padding:15px;border-radius:10px;text-align:center;">
          <div style="font-size:24px;font-weight:700;color:var(--amber);">${resultado.semanas || '—'}</div>
          <div style="font-size:11px;color:var(--ink4);">Tiempo</div>
        </div>
      </div>
      
      <div style="background:var(--blue-l);padding:15px;border-radius:10px;border:1px solid var(--blue-m);margin-bottom:20px;">
        <div style="font-size:12px;color:var(--blue);margin-bottom:5px;">Inversión Estimada:</div>
        <div style="font-size:20px;font-weight:700;color:var(--blue);">${resultado.rangoPrecio?.texto || 'Por definir'}</div>
      </div>
      
      <div style="margin-bottom:20px;">
        <h5 style="color:var(--ink);margin-bottom:10px;">Componentes:</h5>
        <ul style="color:var(--ink3);font-size:13px;line-height:1.8;padding-left:20px;">
          ${(resultado.disciplinas || []).map(d => `<li>${d.nombre || d}</li>`).join('')}
          ${resultado.motorCotizacion ? '<li>Motor de Cotización</li>' : ''}
          ${(resultado.capacidades || []).map(c => `<li>${c.nombre || c}</li>`).join('')}
        </ul>
      </div>
    `;
  },
  
  descargarPDF: function() {
    alert('📄 Funcionalidad PDF en desarrollo...');
  },
  
  solicitarDemo: function() {
    const emailInput = document.getElementById('cliente-email');
    const email = emailInput?.value || '';
    
    if (!email) {
      alert('⚠️ Ingresa tu email para solicitar la demo');
      if (emailInput) emailInput.focus();
      return;
    }
    alert('✅ ¡Gracias! Te contactaremos en 24-48 horas.');
  }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  if (window.estimatorUI) {
    window.estimatorUI.init();
  }
});

console.log('✅ estimator-ui.js listo');
