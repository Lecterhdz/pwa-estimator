// ═══════════════════════════════════════════════════════════════
// SMARTCOT - UI DEL CONFIGURADOR PWA
// ═══════════════════════════════════════════════════════════════

console.log('🎨 estimador-ui.js cargado');

window.estimadorUI = {
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
  // INICIALIZAR CONFIGURADOR
  // ─────────────────────────────────────────────────────────────
  init: function() {
    this.agregarListeners();
    this.actualizarPuntosVisibles();
    console.log('✅ Configurador UI inicializado');
  },
  
  // ─────────────────────────────────────────────────────────────
  // AGREGAR EVENT LISTENERS
  // ─────────────────────────────────────────────────────────────
  agregarListeners: function() {
    // Disciplinas
    document.querySelectorAll('input[name="disciplina"]').forEach(cb => {
      cb.addEventListener('change', () => {
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
      motorToggle.addEventListener('change', () => {
        this.seleccion.motorCotizacion = motorToggle.checked;
        this.actualizarPuntosVisibles();
      });
    }
    
    // Exportación
    document.getElementById('neodata-sync')?.addEventListener('change', (e) => {
      this.seleccion.exportacionNeodata = e.target.checked;
      this.actualizarPuntosVisibles();
    });
    
    document.getElementById('excel-sync')?.addEventListener('change', (e) => {
      this.seleccion.exportacionExcel = e.target.checked;
      this.actualizarPuntosVisibles();
    });
    
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
  // ACTUALIZAR PUNTOS EN TIEMPO REAL
  // ─────────────────────────────────────────────────────────────
  actualizarPuntosVisibles: function() {
    let puntos = 20; // Base
    
    // Disciplinas
    this.seleccion.disciplinas.forEach(discId => {
      const disc = estimadorPWA.disciplinas[discId];
      if (disc) puntos += disc.puntos;
    });
    
    // Bono multidisciplinario
    if (this.seleccion.disciplinas.length >= 3) puntos += 30;
    
    // Motor de cotización
    if (this.seleccion.motorCotizacion) {
      puntos += estimadorPWA.motorCotizacion.base.puntos;
    }
    
    // Exportación
    if (this.seleccion.exportacionNeodata) puntos += 15;
    else if (this.seleccion.exportacionExcel) puntos += 5;
    
    // Capacidades
    this.seleccion.capacidades.forEach(capId => {
      const cap = estimadorPWA.capacidades[capId];
      if (cap) puntos += cap.puntos;
    });
    
    // Mostrar resumen
    const resumen = document.getElementById('puntos-resumen');
    if (resumen) {
      resumen.textContent = `${puntos} puntos estimados`;
      
      // Determinar nivel
      let nivel = 'Starter';
      if (puntos > 90) nivel = 'Professional';
      if (puntos > 140) nivel = 'Enterprise';
      if (puntos > 200) nivel = 'Elite';
      
      document.getElementById('nivel-resumen')?.textContent = `Nivel: ${nivel}`;
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // ACTUALIZAR BADGE MULTIDISCIPLINARIO
  // ─────────────────────────────────────────────────────────────
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
  // NAVEGACIÓN ENTRE PASOS
  // ─────────────────────────────────────────────────────────────
  irAPaso: function(paso) {
    // Ocultar todos los pasos
    document.querySelectorAll('[id^="paso-"]').forEach(el => {
      el.style.display = 'none';
    });
    
    // Mostrar paso actual
    const pasoActual = document.getElementById(`paso-${paso}`);
    if (pasoActual) pasoActual.style.display = 'block';
    
    // Actualizar indicador de pasos
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
  
  siguientePaso: function(paso) {
    // Validaciones por paso
    if (paso === 2 && this.seleccion.disciplinas.length === 0) {
      alert('⚠️ Selecciona al menos una disciplina');
      return;
    }
    
    this.irAPaso(paso);
  },
  
  anteriorPaso: function(paso) {
    this.irAPaso(paso);
  },
  
  // ─────────────────────────────────────────────────────────────
  // FINALIZAR Y GUARDAR DIAGNÓSTICO
  // ─────────────────────────────────────────────────────────────
  finalizarDiagnostico: async function() {
    try {
      // 1. Recopilar datos del cliente
      const datosCliente = {
        empresa: document.getElementById('cliente-empresa')?.value || 'No especificada',
        email: document.getElementById('cliente-email')?.value || '',
        telefono: document.getElementById('cliente-telefono')?.value || '',
        industria: document.getElementById('cliente-industria')?.value || ''
      };
      
      // Validar email si se proporcionó
      if (datosCliente.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosCliente.email)) {
        alert('⚠️ Ingresa un email válido');
        return;
      }
      
      // 2. Calcular resultado
      const calculo = estimadorPWA.calcular(this.seleccion);
      if (!calculo.exito) {
        alert('⚠️ Error calculando estimación');
        return;
      }
      
      const resultado = calculo.datos;
      
      // 3. Mostrar mensaje de cierre
      const mensaje = estimadorPWA.generarMensajeCierre(resultado);
      document.getElementById('mensaje-cierre')?.textContent = mensaje;
      
      // 4. Guardar en Firebase
      const guardado = await estimadorPWA.guardarDiagnostico(datosCliente, this.seleccion, resultado);
      
      if (guardado.exito) {
        console.log('✅ Diagnóstico guardado en Firebase:', guardado.id);
        alert('✅ ¡Diagnóstico guardado exitosamente!\n\nTe contactaremos pronto para agendar una demo.');
      } else if (guardado.fallback) {
        alert('✅ Diagnóstico guardado localmente. Se enviará cuando tengas conexión.');
      }
      
      // 5. Mostrar resultado final
      this.mostrarResultado(resultado, mensaje);
      
    } catch (error) {
      console.error('❌ Error finalizando diagnóstico:', error);
      alert('❌ Error: ' + error.message);
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // MOSTRAR RESULTADO FINAL
  // ─────────────────────────────────────────────────────────────
  mostrarResultado: function(resultado, mensaje) {
    this.irAPaso('resultado');
    
    const contenido = document.getElementById('diagnostico-contenido');
    if (!contenido) return;
    / Después de mostrar el resultado, agregar:
    const seccionPago = document.createElement('div');
    seccionPago.style.cssText = 'background:var(--blue-l);padding:20px;border-    radius:12px;border:1px solid var(--blue-m);margin-top:24px;';
    seccionPago.innerHTML = `
      <h4 style="color:var(--blue);margin-bottom:12px;font-size:14px;">📋     Siguiente Paso: Cotización Formal</h4>
      <p style="color:var(--ink3);font-size:13px;margin-bottom:16px;line-    height:1.6;">
        Este es un estimado preliminar. Para recibir una cotización formal     detallada y comenzar el desarrollo de tu PWA:
      </p>
  
      <div style="background:var(--bg);padding:16px;border-radius:8px;margin-    bottom:16px;">
        <div style="font-size:12px;color:var(--ink4);margin-bottom:8px;">📧 Envía tu     diagnóstico a:</div>
        <div style="font-size:16px;font-weight:700;color:var(--ink);">    TU_EMAIL@DOMINIO.COM</div>
        <div style="font-size:12px;color:var(--ink4);margin-top:4px;">o WhatsApp: +52 55     1234 5678</div>
      </div>
  
      <div style="background:var(--bg);padding:16px;border-radius:8px;margin-    bottom:16px;">
        <div style="font-size:12px;color:var(--ink4);margin-bottom:8px;">💳 Forma de     Pago:</div>
        <div style="font-size:13px;color:var(--ink);font-weight:600;margin-bottom:8px;">Transferencia Bancaria</div>
        <div style="font-size:12px;color:var(--ink3);line-height:1.6;">
          <strong>Banco:</strong> BBVA<br>
          <strong>CLABE:</strong> 012345678901234567<br>
          <strong>Beneficiario:</strong> TU NOMBRE O EMPRESA<br>
          <strong>Concepto:</strong> Desarrollo PWA - [Nombre de tu empresa]
        </div>
      </div>
  
      <div style="background:var(--amber-l);padding:12px;border-radius:8px;border-left:3px     solid var(--amber);">
        <div style="font-size:12px;color:var(--amber);font-weight:600;">⚠️     Importante:</div>
        <div style="font-size:11px;color:var(--ink4);margin-top:4px;">
          El pago inicial es del 50% para comenzar el desarrollo. El 50% restante al     entregar la PWA funcional.
        </div>
      </div>
    `;

    // Insertar antes de los botones
    const botones = document.getElementById('paso-    resultado')?.querySelector('div[style*="grid"]');
    if (botones && seccionPago) {
      botones.parentNode.insertBefore(seccionPago, botones);
    }

    // CAMBIAR botones
    if (botones) {
      botones.innerHTML = `
        <button onclick="estimatorUI.enviarSolicitud()" class="topbar-btn primary"     style="width:100%;">
          📧 Enviar Solicitud de Cotización
        </button>
        <button onclick="estimatorUI.descargarPDF()" class="topbar-btn ghost"     style="width:100%;">
          📄 Descargar Diagnóstico en PDF
        </button>
      `;
    }    
    contenido.innerHTML = `
      <div style="margin-bottom:20px;">
        <h4 style="color:var(--ink);margin-bottom:10px;">${mensaje}</h4>
      </div>
      
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;margin-bottom:20px;">
        <div style="background:var(--bg);padding:15px;border-radius:10px;text-align:center;">
          <div style="font-size:24px;font-weight:700;color:var(--blue);">${resultado.nivel}</div>
          <div style="font-size:11px;color:var(--ink4);">Nivel Recomendado</div>
        </div>
        <div style="background:var(--bg);padding:15px;border-radius:10px;text-align:center;">
          <div style="font-size:24px;font-weight:700;color:var(--green);">${resultado.totalPuntos} pts</div>
          <div style="font-size:11px;color:var(--ink4);">Puntos Totales</div>
        </div>
        <div style="background:var(--bg);padding:15px;border-radius:10px;text-align:center;">
          <div style="font-size:24px;font-weight:700;color:var(--amber);">${resultado.semanas}</div>
          <div style="font-size:11px;color:var(--ink4);">Tiempo Estimado</div>
        </div>
      </div>
      
      <div style="background:var(--blue-l);padding:15px;border-radius:10px;border:1px solid var(--blue-m);margin-bottom:20px;">
        <div style="font-size:12px;color:var(--blue);margin-bottom:5px;">Rango de Inversión Estimado:</div>
        <div style="font-size:20px;font-weight:700;color:var(--blue);">${resultado.rangoPrecio?.texto || 'Por definir'}</div>
      </div>
      
      <div style="margin-bottom:20px;">
        <h5 style="color:var(--ink);margin-bottom:10px;">Componentes Incluidos:</h5>
        <ul style="color:var(--ink3);font-size:13px;line-height:1.8;padding-left:20px;">
          ${resultado.disciplinas.map(d => `<li>${d.nombre}</li>`).join('')}
          ${resultado.motorCotizacion ? '<li>Motor de Cotización Universal</li>' : ''}
          ${resultado.capacidades.map(c => `<li>${c.nombre}</li>`).join('')}
        </ul>
      </div>
    `;
  },
// ─────────────────────────────────────────────────────────────
// ENVIAR SOLICITUD POR EMAIL (NUEVA FUNCIÓN)
// ─────────────────────────────────────────────────────────────
enviarSolicitud: function() {
  const email = document.getElementById('cliente-email')?.value;
  const empresa = document.getElementById('cliente-empresa')?.value || 'No especificada';
  
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert('⚠️ Por favor ingresa un email válido para contactarte');
    document.getElementById('cliente-email')?.focus();
    return;
  }
  
  // Opción 1: Abrir cliente de email del usuario
  const asunto = encodeURIComponent(`🔧 Solicitud de Cotización PWA - ${empresa}`);
  const cuerpo = encodeURIComponent(
    `Hola,\n\n` +
    `Me interesa cotizar el desarrollo de una PWA con las siguientes características:\n\n` +
    `Empresa: ${empresa}\n` +
    `Email: ${email}\n\n` +
    `Adjunto el diagnóstico generado en el estimador.\n\n` +
    `Quedo en espera de la cotización formal.\n\n` +
    `Saludos.`
  );
  
  // Abrir cliente de email
  window.location.href = `mailto:TU_EMAIL@DOMINIO.COM?subject=${asunto}&body=${cuerpo}`;
  
  // Mostrar confirmación
  alert('✅ Se abrirá tu cliente de email para enviar la solicitud.\n\nTambién puedes escribirnos directamente a:\n\n📧 TU_EMAIL@DOMINIO.COM\n📱 WhatsApp: +52 55 1234 5678');
  
  // Guardar como "lead enviado" en Firebase
  this.marcarComoSolicitudEnviada();
},

// ─────────────────────────────────────────────────────────────
// MARCAR COMO SOLICITUD ENVIADA (NUEVA FUNCIÓN)
// ─────────────────────────────────────────────────────────────
marcarComoSolicitudEnviada: async function() {
  try {
    // Actualizar el último diagnóstico con flag de "solicitud enviada"
    const pendientes = JSON.parse(localStorage.getItem('diagnosticos-pendientes') || '[]');
    if (pendientes.length > 0) {
      const ultimo = pendientes[pendientes.length - 1];
      ultimo.solicitudEnviada = true;
      ultimo.fechaSolicitud = new Date().toISOString();
      localStorage.setItem('diagnosticos-pendientes', JSON.stringify(pendientes));
    }
    
    console.log('✅ Solicitud marcada como enviada');
  } catch (error) {
    console.error('❌ Error marcando solicitud:', error);
  }
},  
  // ─────────────────────────────────────────────────────────────
  // DESCARGAR PDF DEL DIAGNÓSTICO
  // ─────────────────────────────────────────────────────────────
  descargarPDF: function() {
    alert('📄 Funcionalidad de PDF en desarrollo...\n\nPróximamente podrás descargar este diagnóstico en formato PDF.');
  },
  
  // ─────────────────────────────────────────────────────────────
  // SOLICITAR DEMO TÉCNICA
  // ─────────────────────────────────────────────────────────────
  solicitarDemo: function() {
    const email = document.getElementById('cliente-email')?.value;
    if (!email) {
      alert('⚠️ Por favor ingresa tu email para solicitar la demo');
      document.getElementById('cliente-email')?.focus();
      return;
    }
    
    alert('✅ ¡Gracias por tu interés!\n\nNos pondremos en contacto contigo en las próximas 24-48 horas para agendar tu demo técnica personalizada.');
  }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  if (window.estimadorUI) {
    window.estimadorUI.init();
  }
});

console.log('✅ estimador-ui.js listo');
