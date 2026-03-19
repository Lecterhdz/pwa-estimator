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
    
    // PASO 1: Tipo de PWA (Radio buttons)
    document.querySelectorAll('input[name="tipoPWA"]').forEach(radio => {
      radio.addEventListener('change', () => {
        this.actualizarSeleccionTipoPWA();
        this.actualizarPuntosVisibles();
      });
    });
    
    // PASO 2: Base funcional (Radio buttons)
    document.querySelectorAll('input[name="base"]').forEach(radio => {
      radio.addEventListener('change', () => {
        this.actualizarSeleccionBase();
        this.actualizarPuntosVisibles();
      });
    });
    
    // PASO 3: Módulos (Checkboxes - múltiples)
    document.querySelectorAll('input[name="modulo"]').forEach(cb => {
      cb.addEventListener('change', () => {
        this.actualizarSeleccionModulos();
        this.actualizarPuntosVisibles();
      });
    });
    
    // PASO 4: Escala (Radio buttons)
    document.querySelectorAll('input[name="escala"]').forEach(radio => {
      radio.addEventListener('change', () => {
        this.actualizarSeleccionEscala();
        this.actualizarPuntosVisibles();
      });
    });
    
    // También permitir click en las cards completas (no solo en el radio)
    document.querySelectorAll('.tipo-pwa-card, .base-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Si el click NO fue directamente en el input, buscarlo y marcarlo
        if (e.target.tagName !== 'INPUT') {
          const radio = card.querySelector('input[type="radio"]');
          if (radio) {
            radio.checked = true;
            radio.dispatchEvent(new Event('change'));
          }
        }
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
  // ACTUALIZAR SELECCIÓN (CORREGIDO PARA RADIO + CHECKBOX)
  // ─────────────────────────────────────────────────────────────
  actualizarSeleccionTipoPWA: function() {
    const seleccionado = document.querySelector('input[name="tipoPWA"]:checked');
    this.seleccion.tipoPWA = seleccionado ? seleccionado.value : null;
  },
  
  actualizarSeleccionBase: function() {
    const seleccionado = document.querySelector('input[name="base"]:checked');
    this.seleccion.base = seleccionado ? seleccionado.value : null;
  },
  
  actualizarSeleccionModulos: function() {
    this.seleccion.modulos = Array.from(
      document.querySelectorAll('input[name="modulo"]:checked')
    ).map(cb => cb.value);
  },
  
  actualizarSeleccionEscala: function() {
    const seleccionado = document.querySelector('input[name="escala"]:checked');
    this.seleccion.escala = seleccionado ? seleccionado.value : null;
  },
  
  // ─────────────────────────────────────────────────────────────
  // ACTUALIZAR PUNTOS VISIBLES (CORREGIDO)
  // ─────────────────────────────────────────────────────────────
  actualizarPuntosVisibles: function() {
    let puntos = 0;
    
    // Tipo de PWA (1 selección)
    if (this.seleccion.tipoPWA && estimadorPWA.tiposPWA[this.seleccion.tipoPWA]) {
      puntos += estimadorPWA.tiposPWA[this.seleccion.tipoPWA].puntos;
    }
    
    // Base funcional (1 selección)
    if (this.seleccion.base && estimadorPWA.bases[this.seleccion.base]) {
      puntos += estimadorPWA.bases[this.seleccion.base].puntos;
    }
    
    // Módulos (múltiples selecciones)
    if (this.seleccion.modulos && Array.isArray(this.seleccion.modulos)) {
      this.seleccion.modulos.forEach(modId => {
        if (estimadorPWA.modulos[modId]) {
          puntos += estimadorPWA.modulos[modId].puntos;
        }
      });
    }
    
    // Escala de usuarios
    if (this.seleccion.escala) {
      const escala = estimadorPWA.escalas.find(e => e.etiqueta.includes(this.seleccion.escala));
      if (escala) {
        puntos += escala.puntos;
      }
    }
    
    // Actualizar resumen visual
    const elPuntos = document.getElementById('puntos-resumen');
    const elNivel = document.getElementById('nivel-resumen');
    const elPrecio = document.getElementById('precio-resumen');
    const elTiempo = document.getElementById('tiempo-resumen');
    
    if (elPuntos) elPuntos.textContent = `${puntos} pts`;
    
    // Determinar nivel
    const rango = estimadorPWA.rangosPrecio.find(r => puntos <= r.maxPuntos);
    if (rango && elNivel) {
      elNivel.textContent = rango.nivel;
      elNivel.className = `resumen-value nivel-${rango.nivel.toLowerCase().replace(' ', '-')}`;
    }
    
    if (rango && elPrecio) {
      elPrecio.textContent = rango.rangoPrecio?.texto || 'Por definir';
    }
    
    if (rango && elTiempo) {
      elTiempo.textContent = rango.semanas || 'Por definir';
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
  // SIGUIENTE PASO (CORREGIDO PARA RADIO BUTTONS)
  // ─────────────────────────────────────────────────────────────
  siguientePaso: function(paso) {
    
    // Validar PASO 1: Tipo de PWA (radio button - solo 1 selección)
    if (paso === 2) {
      const tipoPWASeleccionado = document.querySelector('input[name="tipoPWA"]:checked');
      
      if (!tipoPWASeleccionado) {
        alert('⚠️ Selecciona al menos una industria para continuar');
        
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
      
      // Guardar selección
      this.seleccion.tipoPWA = tipoPWASeleccionado.value;
    }
    
    // Validar PASO 2: Funcionalidad Base (radio button - solo 1 selección)
    if (paso === 3) {
      const baseSeleccionada = document.querySelector('input[name="base"]:checked');
      
      if (!baseSeleccionada) {
        alert('⚠️ Selecciona una funcionalidad principal para continuar');
        
        const paso2 = document.getElementById('paso-2');
        if (paso2) {
          paso2.style.animation = 'shake 0.5s ease';
          setTimeout(() => {
            paso2.style.animation = '';
          }, 500);
        }
        
        return;
      }
      
      // Guardar selección
      this.seleccion.base = baseSeleccionada.value;
    }
    
    // Validar PASO 3: Módulos (checkboxes - múltiples selecciones permitidas)
    if (paso === 4) {
      // Guardar módulos seleccionados (puede ser 0 o más)
      this.seleccion.modulos = Array.from(
        document.querySelectorAll('input[name="modulo"]:checked')
      ).map(cb => cb.value);
      
      // Guardar escala
      const escalaSeleccionada = document.querySelector('input[name="escala"]:checked');
      if (escalaSeleccionada) {
        this.seleccion.escala = escalaSeleccionada.value;
      }
    }
    
    // Ir al siguiente paso
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
  // FINALIZAR DIAGNÓSTICO (CORREGIDO)
  // ─────────────────────────────────────────────────────────────
  finalizarDiagnostico: async function() {
    try {
      // Actualizar todas las selecciones antes de calcular
      this.actualizarSeleccionTipoPWA();
      this.actualizarSeleccionBase();
      this.actualizarSeleccionModulos();
      this.actualizarSeleccionEscala();
      
      // Datos de contacto
      const datosCliente = {
        empresa: document.getElementById('cliente-empresa')?.value || 'No especificada',
        email: document.getElementById('cliente-email')?.value || '',
        telefono: document.getElementById('cliente-telefono')?.value || '',
        industria: document.getElementById('cliente-industria')?.value || ''
      };
      
      // Validar email
      if (!datosCliente.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosCliente.email)) {
        alert('⚠️ Ingresa un email válido para contactarte');
        document.getElementById('cliente-email')?.focus();
        return;
      }
      
      // Calcular estimación
      const calculo = estimadorPWA.calcular(this.seleccion);
      if (!calculo.exito) {
        alert('⚠️ Error calculando estimación: ' + calculo.error);
        return;
      }
      
      const resultado = calculo.datos;
      const mensaje = estimadorPWA.generarMensajeCierre(resultado);
      
      // Mostrar mensaje
      const elMensaje = document.getElementById('mensaje-cierre');
      if (elMensaje) {
        elMensaje.textContent = mensaje;
      }
      
      // Guardar en Firebase/LocalStorage
      const guardado = await estimadorPWA.guardarDiagnostico(datosCliente, this.seleccion, resultado);
      
      if (guardado.exito) {
        alert('✅ ¡Diagnóstico guardado!\n\nTe contactaremos en 24-48 horas con la cotización formal.');
      } else if (guardado.fallback) {
        alert('✅ Diagnóstico guardado localmente.');
      }
      
      // Mostrar resultado
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
