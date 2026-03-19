// ═══════════════════════════════════════════════════════════════
// PWA ESTIMATOR - ADMIN DE DIAGNÓSTICOS
// ═══════════════════════════════════════════════════════════════

console.log('📊 admin-diagnosticos.js cargado');

window.adminDiagnosticos = {
  
  diagnosticosCache: [],
  
  // ─────────────────────────────────────────────────────────────
  // CARGAR DIAGNÓSTICOS (CORREGIDO)
  // ─────────────────────────────────────────────────────────────
  cargar: async function() {
    try {
      if (!window.db?.diagnosticos) {
        console.error('❌ DB no disponible');
        this.renderTabla([]);
        return;
      }
      
      // Obtener diagnósticos de Firebase/IndexedDB
      const diagnosticos = await window.db.diagnosticos
        .orderBy('timestamp', 'desc')
        .limit(100)
        .toArray();
      
      console.log('🔍 Diagnósticos cargados:', diagnosticos.length);
      
      // Filtrar eliminados (soft delete)
      const diagnosticosValidos = diagnosticos.filter(d => !d.eliminado);
      
      // ⚠️ GUARDAR EN CACHE CON LOS IDs CORRECTOS
      this.diagnosticosCache = diagnosticosValidos.map(d => ({
        ...d,
        // Asegurar que el ID esté disponible
        id: d.id || d._id || d.documentId
      }));
      
      console.log('🔍 Cache actualizado:', this.diagnosticosCache.length);
      
      // Renderizar tabla
      this.renderTabla(diagnosticosValidos);
      
      // Actualizar badge del menú
      this.actualizarBadge();
      
    } catch (error) {
      console.error('❌ Error cargando diagnósticos:', error);
      this.renderTabla([]);
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // RENDERIZAR TABLA (CORREGIDO + NUEVOS STATUS)
  // ─────────────────────────────────────────────────────────────
  renderTabla: function(diagnosticos) {
    const tbody = document.getElementById('tabla-diagnosticos');
    if (!tbody) return;
    
    if (!diagnosticos || diagnosticos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="padding:40px;text-align:center;color:var(--ink4);">📭 Sin diagnósticos registrados aún</td></tr>';
      return;
    }
    
    tbody.innerHTML = diagnosticos.map(d => {
      const fecha = new Date(d.fecha || d.timestamp).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const nivelColor = this.getColorNivel(d.resultado?.nivel);
      const semanas = d.resultado?.semanas || 'Por definir';
      // Asegurar que siempre diga "semanas"
      const semanasTexto = semanas.includes('semana') ? semanas : `${semanas} semanas`;
      
      // Status del proyecto
      const status = d.status || 'pendiente';
      const statusBadge = this.getStatusBadge(status, d.fechaEntrega);
      
      // Solicitud enviada
      const solicitudBadge = d.solicitudEnviada 
        ? '<span class="badge-solicitud enviada">✅ Enviada</span>' 
        : '<span class="badge-solicitud pendiente">⏳ Pendiente</span>';
      
      return `
        <tr style="border-bottom:1px solid var(--border);transition:background 0.2s;">
          <td style="padding:12px;font-family:var(--mono);font-size:12px;">${fecha}</td>
          <td style="padding:12px;font-weight:600;">${d.cliente?.empresa || '—'}</td>
          <td style="padding:12px;">${d.cliente?.email || '—'}</td>
          <td style="padding:12px;">${d.cliente?.industria || '—'}</td>
          <td style="padding:12px;">
            <span class="badge-nivel ${d.resultado?.nivel?.toLowerCase()}" style="background:${nivelColor};color:white;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:600;">
              ${d.resultado?.nivel || '—'}
            </span>
          </td>
          <td style="padding:12px;font-family:var(--mono);font-size:12px;">${semanasTexto}</td>
          <td style="padding:12px;">${solicitudBadge}</td>
          <td style="padding:12px;">${statusBadge}</td>
          <td style="padding:12px;">
            <div class="tabla-acciones">
              <button onclick="adminDiagnosticos.contactar('${d.id}', '${d.cliente?.email || ''}')" 
                class="tabla-btn contactar" title="Contactar cliente">
                📧
              </button>
              <button onclick="adminDiagnosticos.verDetalle('${d.id}')" 
                class="tabla-btn ver" title="Ver detalles">
                👁️
              </button>
              <button onclick="adminDiagnosticos.cambiarStatus('${d.id}')" 
                class="tabla-btn status" title="Cambiar status">
                📊
              </button>
              <button onclick="adminDiagnosticos.rechazarDiagnostico('${d.id}')" 
                class="tabla-btn delete" 
                title="Marcar como rechazada" 
                style="background:var(--rose);color:white;">
                ❌
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },
  // ─────────────────────────────────────────────────────────────
  // RECHAZAR DIAGNÓSTICO (CAMBIAR STATUS A RECHAZADA)
  // ─────────────────────────────────────────────────────────────
  rechazarDiagnostico: async function(id) {
    const confirmar = confirm(
      `❌ ¿Marcar este diagnóstico como RECHAZADO?\n\n` +
      `El cliente será notificado que su cotización no fue aceptada.\n\n` +
      `ID: ${id}`
    );
    
    if (!confirmar) return;
    
    try {
      let diagnostico = this.diagnosticosCache?.find(d => (d.id || d._id) === id);
      
      if (!diagnostico && window.db?.diagnosticos?.get) {
        diagnostico = await window.db.diagnosticos.get(id);
      }
      
      if (!diagnostico) {
        alert('❌ Diagnóstico no encontrado');
        return;
      }
      
      // Actualizar status
      diagnostico.status = 'rechazada';
      diagnostico.fechaRechazo = new Date().toISOString();
      diagnostico.motivoRechazo = prompt('Motivo del rechazo (opcional):') || 'No especificado';
      
      await window.db.diagnosticos.add(diagnostico);
      
      alert('✅ Diagnóstico marcado como RECHAZADO');
      this.cargar();
      
    } catch (error) {
      console.error('❌ Error rechazando diagnóstico:', error);
      alert('❌ Error: ' + error.message);
    }
  },
  // ─────────────────────────────────────────────────────────────
  // CAMBIAR STATUS DEL PROYECTO (CORREGIDO - SIN UNDEFINED)
  // ─────────────────────────────────────────────────────────────
  cambiarStatus: async function(id) {
    try {
      console.log('🔍 Cambiar status - ID:', id);
      
      // Buscar en cache primero
      let diagnostico = this.diagnosticosCache?.find(d => (d.id || d._id) === id);
      
      // Si no está en cache, buscar en DB
      if (!diagnostico && window.db?.diagnosticos?.get) {
        diagnostico = await window.db.diagnosticos.get(id);
      }
      
      if (!diagnostico) {
        alert('❌ Diagnóstico no encontrado\n\nID: ' + id);
        return;
      }
      
      const statusActual = diagnostico.status || 'pendiente';
      
      // Mostrar menú de status
      const nuevoStatus = prompt(
        `Cambiar estado del proyecto:\n\n` +
        `Estado actual: ${statusActual.toUpperCase()}\n\n` +
        `Escribe el número:\n` +
        `1️⃣ Pendiente\n2️⃣ Contactado\n3️⃣ ✅ Aceptada\n` +
        `4️⃣ 🔄 En Proceso\n5️⃣ 🎉 Entregada\n6️⃣ ❌ Rechazada`,
        this.getStatusNumber(statusActual)
      );
      
      if (!nuevoStatus) return;
      
      const statusMap = {
        '1': 'pendiente',
        '2': 'contactado', 
        '3': 'aceptada',
        '4': 'en_proceso',
        '5': 'entregada',
        '6': 'rechazada'
      };
      
      const statusFinal = statusMap[nuevoStatus] || statusActual;
      
      // ⚠️ CORRECCIÓN: Inicializar fechaEntrega como null (no undefined)
      let fechaEntrega = null;
      
      // Solo pedir fecha si es "En Proceso"
      if (statusFinal === 'en_proceso') {
        const semanas = diagnostico.resultado?.semanas || '8';
        const fechaSugerida = this.calcularFechaEntrega(semanas);
        const fechaInput = prompt(
          `Fecha estimada de entrega:\n\nFormato: YYYY-MM-DD\nSugerida: ${fechaSugerida}`,
          fechaSugerida
        );
        // ⚠️ Si el usuario cancela o deja vacío, usar null (no undefined)
        fechaEntrega = fechaInput || null;
      }
      
      // Si es "Entregada", mostrar checklist
      if (statusFinal === 'entregada') {
        const checklist = confirm(
          `✅ Checklist de Entrega:\n\n` +
          `□ Código fuente\n□ Documentación\n□ PWA funcionando\n` +
          `□ Credenciales\n□ Pago final\n\n¿Todo completado?`
        );
        if (!checklist) return;
      }
      
      // ⚠️ CORRECCIÓN: Solo agregar fechaEntrega si tiene valor válido
      diagnostico.status = statusFinal;
      if (fechaEntrega) {
        diagnostico.fechaEntrega = fechaEntrega;
      }
      diagnostico.fechaStatusChange = new Date().toISOString();
      
      // Guardar en DB
      await window.db.diagnosticos.add(diagnostico);
      
      console.log('✅ Status actualizado:', statusFinal);
      alert(`✅ Estado actualizado a: ${this.getStatusLabel(statusFinal)}`);
      
      // Actualizar cache
      const index = this.diagnosticosCache?.findIndex(d => (d.id || d._id) === id);
      if (index !== -1 && this.diagnosticosCache) {
        this.diagnosticosCache[index] = diagnostico;
      }
      
      // Recargar tabla
      this.cargar();
      
    } catch (error) {
      console.error('❌ Error cambiando status:', error);
      alert('❌ Error: ' + error.message);
    }
  },
  // ─────────────────────────────────────────────────────────────
  // ELIMINAR DIAGNÓSTICO (NUEVA FUNCIÓN)
  // ─────────────────────────────────────────────────────────────
  eliminarDiagnostico: async function(id) {
    const confirmar = confirm(
      `⚠️ ¿Estás SEGURO de eliminar este diagnóstico?\n\n` +
      `Esta acción NO se puede deshacer.\n\n` +
      `ID: ${id}`
    );
    
    if (!confirmar) return;
    
    try {
      if (window.db?.diagnosticos) {
        // Firebase no tiene delete directo en esta implementación
        // Marcamos como eliminado en lugar de borrar
        const diagnostico = await window.db.diagnosticos.get(id);
        if (diagnostico) {
          diagnostico.eliminado = true;
          diagnostico.fechaEliminacion = new Date().toISOString();
          await window.db.diagnosticos.add(diagnostico);
          
          console.log('✅ Diagnóstico marcado como eliminado:', id);
          alert('✅ Diagnóstico eliminado');
          
          // Recargar tabla
          this.cargar();
        }
      } else {
        // IndexedDB - borrar realmente
        // Implementar según tu estructura
        alert('⚠️ Función de eliminar en desarrollo para IndexedDB');
      }
    } catch (error) {
      console.error('❌ Error eliminando diagnóstico:', error);
      alert('❌ Error: ' + error.message);
    }
  },

  // ─────────────────────────────────────────────────────────────
  // HELPERS PARA STATUS (AGREGAR DENTRO DE adminDiagnosticos)
  // ─────────────────────────────────────────────────────────────
  getStatusNumber: function(status) {
    const map = {
      'pendiente': '1',
      'contactado': '2',
      'aceptada': '3',
      'en_proceso': '4',
      'entregada': '5',
      'rechazada': '6'
    };
    return map[status] || '1';
  },
  
  getStatusLabel: function(status) {
    const map = {
      'pendiente': 'Pendiente',
      'contactado': 'Contactado',
      'aceptada': '✅ Aceptada',
      'en_proceso': '🔄 En Proceso',
      'entregada': '🎉 Entregada',
      'rechazada': '❌ Rechazada'
    };
    return map[status] || status;
  },
  // ─────────────────────────────────────────────────────────────
  // CALCULAR FECHA DE ENTREGA SUGERIDA (FUNCIÓN AUXILIAR)
  // ─────────────────────────────────────────────────────────────
  calcularFechaEntrega: function(semanas) {
    try {
      const semanasNum = parseInt(semanas) || 8;
      const hoy = new Date();
      const entrega = new Date(hoy.getTime() + (semanasNum * 7 * 24 * 60 * 60 * 1000));
      return entrega.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  },
  // ─────────────────────────────────────────────────────────────
  // OBTENER BADGE DE STATUS (NUEVA FUNCIÓN)
  // ─────────────────────────────────────────────────────────────
  getStatusBadge: function(status, fechaEntrega) {
    const badges = {
      'pendiente': '<span class="badge-status pendiente">⏳ Pendiente</span>',
      'contactado': '<span class="badge-status contactado">📞 Contactado</span>',
      'aceptada': '<span class="badge-status aceptada">✅ Cotización Aceptada</span>',
      'en_proceso': `<span class="badge-status en_proceso">🔄 En Proceso${fechaEntrega ? ' (' + this.getDiasRestantes(fechaEntrega) + ')' : ''}</span>`,
      'entregada': '<span class="badge-status entregada">🎉 Entregada</span>',
      'rechazada': '<span class="badge-status cancelada">❌ Rechazada</span>'
    };
    
    return badges[status] || badges['pendiente'];
  },
  
  // ─────────────────────────────────────────────────────────────
  // CALCULAR DÍAS RESTANTES PARA ENTREGA (NUEVA FUNCIÓN)
  // ─────────────────────────────────────────────────────────────
  getDiasRestantes: function(fechaEntrega) {
    try {
      const entrega = new Date(fechaEntrega);
      const hoy = new Date();
      const diff = Math.ceil((entrega - hoy) / (1000 * 60 * 60 * 24));
      
      if (diff < 0) return 'Atrasado';
      if (diff === 0) return 'Hoy';
      if (diff === 1) return '1 día';
      return `${diff} días`;
    } catch (error) {
      return '';
    }
  },
  // ─────────────────────────────────────────────────────────────
  // OBTENER COLOR POR NIVEL
  // ─────────────────────────────────────────────────────────────
  getColorNivel: function(nivel) {
    const colores = {
      'Starter': '#10b981',
      'Professional': '#3b82f6',
      'Enterprise': '#8b5cf6',
      'Elite': '#f59e0b'
    };
    return colores[nivel] || '#64748b';
  },
  
  // ─────────────────────────────────────────────────────────────
  // OBTENER COLOR POR LEAD SCORE
  // ─────────────────────────────────────────────────────────────
  getColorScore: function(score) {
    if (score >= 70) return '#10b981';  // Verde - Lead caliente
    if (score >= 40) return '#f59e0b';  // Ámbar - Lead tibio
    return '#64748b';  // Gris - Lead frío
  },
  
  // ─────────────────────────────────────────────────────────────
  // CONTACTAR CLIENTE (ABRIR EMAIL)
  // ─────────────────────────────────────────────────────────────
  contactar: function(id, email) {
    if (!email) {
      alert('⚠️ No hay email registrado para este cliente');
      return;
    }
    
    const diagnostico = this.diagnosticosCache.find(d => d.id === id);
    const empresa = diagnostico?.cliente?.empresa || 'Cliente';
    const nivel = diagnostico?.resultado?.nivel || 'PWA';
    
    const asunto = encodeURIComponent(`Tu Cotización PWA - ${empresa}`);
    const cuerpo = encodeURIComponent(
      `Hola,\n\n` +
      `Gracias por tu interés en desarrollar una PWA con nosotros.\n\n` +
      `Hemos revisado tu diagnóstico (${nivel}) y nos gustaría agendar una llamada para:\n` +
      `• Confirmar requerimientos específicos\n` +
      `• Presentarte la cotización formal\n` +
      `• Resolver cualquier duda\n\n` +
      `¿Te parece bien esta semana?\n\n` +
      `Saludos,\n` +
      `TU NOMBRE\n` +
      `TU TELÉFONO\n` +
      `TU EMAIL`
    );
    
    window.location.href = `mailto:${email}?subject=${asunto}&body=${cuerpo}`;
    
    // Marcar como contactado automáticamente
    this.marcarComoContactado(id);
  },
  
  // ─────────────────────────────────────────────────────────────
  // MARCAR COMO CONTACTADO
  // ─────────────────────────────────────────────────────────────
  marcarComoContactado: async function(id) {
    try {
      if (!window.db?.diagnosticos) {
        console.warn('⚠️ DB no disponible');
        return;
      }
      
      const diagnostico = await window.db.diagnosticos.get(id);
      if (diagnostico) {
        diagnostico.contactado = true;
        diagnostico.fechaContacto = new Date().toISOString();
        await window.db.diagnosticos.add(diagnostico);
        
        console.log('✅ Marcado como contactado:', id);
        
        // Recargar tabla
        this.cargar();
        
        alert('✅ Cliente marcado como contactado');
      }
    } catch (error) {
      console.error('❌ Error marcando contacto:', error);
      alert('❌ Error: ' + error.message);
    }
  },
  // ─────────────────────────────────────────────────────────────
  // VER CHECKLIST DE ENTREGA (NUEVA FUNCIÓN)
  // ─────────────────────────────────────────────────────────────
  verChecklistEntrega: async function(id) {
    const diagnostico = await window.db.diagnosticos.get(id);
    if (!diagnostico) {
      alert('❌ Diagnóstico no encontrado');
      return;
    }
    
    const checklist = [
      { item: 'Código fuente entregado', done: diagnostico.checklist?.codigo || false },
      { item: 'Documentación completa', done: diagnostico.checklist?.documentacion || false },
      { item: 'PWA instalable funcionando', done: diagnostico.checklist?.pwa || false },
      { item: 'Credenciales de acceso entregadas', done: diagnostico.checklist?.credenciales || false },
      { item: 'Pago final recibido', done: diagnostico.checklist?.pago || false },
      { item: 'Capacitación al cliente', done: diagnostico.checklist?.capacitacion || false }
    ];
    
    const checklistTexto = checklist.map((c, i) => 
      `${c.done ? '✅' : '❌'} ${i + 1}. ${c.item}`
    ).join('\n');
    
    alert(
      `📋 Checklist de Entrega - ${diagnostico.cliente?.empresa || 'Cliente'}\n\n` +
      `${checklistTexto}\n\n` +
      `Completados: ${checklist.filter(c => c.done).length}/${checklist.length}`
    );
  },  
// ─────────────────────────────────────────────────────────────
// VER DETALLE DEL DIAGNÓSTICO (CORREGIDO)
// ─────────────────────────────────────────────────────────────
verDetalle: async function(id) {
  try {
    // Buscar en cache primero
    let diagnostico = this.diagnosticosCache.find(d => d.id === id);
    
    // Si no está en cache, buscar en DB
    if (!diagnostico && window.db?.diagnosticos) {
      diagnostico = await window.db.diagnosticos.get(id);
    }
    
    if (!diagnostico) {
      alert('❌ Diagnóstico no encontrado');
      return;
    }
    
    const disciplinas = (diagnostico.seleccion?.tipoPWA ? [estimadorPWA.tiposPWA[diagnostico.seleccion.tipoPWA]?.nombre] : [])
      .concat(diagnostico.seleccion?.modulos?.map(m => estimadorPWA.modulos[m]?.nombre) || [])
      .filter(Boolean)
      .join(', ') || 'Ninguna';
    
    const detalle = `
  ╔═══════════════════════════════════════════════════════════╗
  ║  DIAGNÓSTICO PWA - ${diagnostico.cliente?.empresa || 'Cliente'}
  ╚═══════════════════════════════════════════════════════════╝
  
  📋 DATOS DEL CLIENTE
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Empresa: ${diagnostico.cliente?.empresa || '—'}
  Email: ${diagnostico.cliente?.email || '—'}
  Teléfono: ${diagnostico.cliente?.telefono || '—'}
  Industria: ${diagnostico.cliente?.industria || '—'}
  Fecha: ${new Date(diagnostico.fecha || diagnostico.timestamp).toLocaleString('es-MX')}
  
  🎯 RESULTADO
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Nivel: ${diagnostico.resultado?.nivel || '—'}
  Puntos: ${diagnostico.resultado?.puntos || 0}
  Inversión Estimada: ${diagnostico.resultado?.rangoPrecio?.texto || '—'}
  Tiempo: ${diagnostico.resultado?.semanas || '—'} semanas
  Lead Score: ${diagnostico.meta?.leadScore || 0}/100
  
  ⚙️ CONFIGURACIÓN
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Tipo PWA: ${estimadorPWA.tiposPWA[diagnostico.seleccion?.tipoPWA]?.nombre || '—'}
  Base: ${estimadorPWA.bases[diagnostico.seleccion?.base]?.nombre || '—'}
  Módulos: ${disciplinas}
  
  📊 ESTADO
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Solicitud Enviada: ${diagnostico.solicitudEnviada ? '✅ Sí' : '❌ No'}
  Contactado: ${diagnostico.contactado ? '✅ Sí' : '❌ No'}
  Status: ${diagnostico.status?.toUpperCase() || 'PENDIENTE'}
  Eliminado: ${diagnostico.eliminado ? '✅ Sí' : '❌ No'}
      `;
      
      console.log(detalle);
      alert(detalle);
      
    } catch (error) {
      console.error('❌ Error viendo detalle:', error);
      alert('❌ Error: ' + error.message);
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // EXPORTAR A CSV
  // ─────────────────────────────────────────────────────────────
  exportarCSV: function() {
    if (!this.diagnosticosCache || this.diagnosticosCache.length === 0) {
      alert('⚠️ No hay diagnósticos para exportar');
      return;
    }
    
    const headers = [
      'ID',
      'Fecha',
      'Empresa',
      'Email',
      'Teléfono',
      'Industria',
      'Nivel',
      'Puntos',
      'Inversión',
      'Semanas',
      'Lead Score',
      'Disciplinas',
      'Motor Cotización',
      'Capacidades',
      'Solicitud Enviada',
      'Contactado'
    ];
    
    const rows = this.diagnosticosCache.map(d => [
      d.id || '',
      new Date(d.fecha || d.timestamp).toLocaleString('es-MX'),
      d.cliente?.empresa || '',
      d.cliente?.email || '',
      d.cliente?.telefono || '',
      d.cliente?.industria || '',
      d.resultado?.nivel || '',
      d.resultado?.puntos || 0,
      d.resultado?.rangoPrecio?.texto || '',
      d.resultado?.semanas || '',
      d.meta?.leadScore || 0,
      (d.seleccion?.disciplinas || []).join('; '),
      d.seleccion?.motorCotizacion ? 'Sí' : 'No',
      (d.seleccion?.capacidades || []).join('; '),
      d.solicitudEnviada ? 'Sí' : 'No',
      d.contactado ? 'Sí' : 'No'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `diagnosticos-pwa-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ CSV exportado');
    alert('✅ Diagnósticos exportados a CSV');
  },
  
  // ─────────────────────────────────────────────────────────────
  // FILTRAR DIAGNÓSTICOS
  // ─────────────────────────────────────────────────────────────
  filtrar: function() {
    const nivelFiltro = document.getElementById('filtro-nivel')?.value || '';
    const industriaFiltro = document.getElementById('filtro-industria')?.value || '';
    const fechaFiltro = document.getElementById('filtro-fecha')?.value || '';
    
    let filtrados = this.diagnosticosCache;
    
    if (nivelFiltro) {
      filtrados = filtrados.filter(d => d.resultado?.nivel === nivelFiltro);
    }
    
    if (industriaFiltro) {
      filtrados = filtrados.filter(d => d.cliente?.industria === industriaFiltro);
    }
    
    if (fechaFiltro) {
      const fechaBusqueda = new Date(fechaFiltro).toDateString();
      filtrados = filtrados.filter(d => {
        const fechaDiagnostico = new Date(d.fecha || d.timestamp).toDateString();
        return fechaDiagnostico === fechaBusqueda;
      });
    }
    
    this.renderTabla(filtrados);
    console.log(`🔍 Filtrados: ${filtrados.length} de ${this.diagnosticosCache.length}`);
  },
  
  // ─────────────────────────────────────────────────────────────
  // ACTUALIZAR BADGE DEL MENÚ
  // ─────────────────────────────────────────────────────────────
  actualizarBadge: async function() {
    try {
      if (window.db?.diagnosticos) {
        const count = await window.db.diagnosticos.count();
        const badge = document.getElementById('menu-badge-diagnosticos');
        if (badge) {
          badge.textContent = count;
          badge.style.display = count > 0 ? 'inline-block' : 'none';
        }
      }
    } catch (error) {
      console.error('❌ Error actualizando badge:', error);
    }
  }
};

console.log('✅ admin-diagnosticos.js listo');
