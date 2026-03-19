// ═══════════════════════════════════════════════════════════════
// PWA ESTIMATOR - ADMIN DE DIAGNÓSTICOS
// ═══════════════════════════════════════════════════════════════

console.log('📊 admin-diagnosticos.js cargado');

window.adminDiagnosticos = {
  
  diagnosticosCache: [],
  
  // ─────────────────────────────────────────────────────────────
  // CARGAR DIAGNÓSTICOS
  // ─────────────────────────────────────────────────────────────
  cargar: async function() {
    try {
      if (!window.db?.diagnosticos) {
        console.error('❌ Firebase/DB no disponible');
        this.renderTabla([]);
        return;
      }
      
      const diagnosticos = await window.db.diagnosticos
        .orderBy('timestamp', 'desc')
        .limit(100)
        .toArray();
      
      this.diagnosticosCache = diagnosticos;
      this.renderTabla(diagnosticos);
      this.actualizarBadge();
      
    } catch (error) {
      console.error('❌ Error cargando diagnósticos:', error);
      this.renderTabla([]);
    }
  },
  
  // ─────────────────────────────────────────────────────────────
  // RENDERIZAR TABLA
  // ─────────────────────────────────────────────────────────────
  renderTabla: function(diagnosticos) {
    const tbody = document.getElementById('tabla-diagnosticos');
    if (!tbody) return;
    
    if (!diagnosticos || diagnosticos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="padding:40px;text-align:center;color:var(--ink4);">📭 Sin diagnósticos registrados aún</td></tr>';
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
      const scoreColor = this.getColorScore(d.meta?.leadScore || 0);
      const solicitudBadge = d.solicitudEnviada 
        ? '<span style="padding:4px 10px;background:var(--green-l);color:var(--green);border-radius:20px;font-size:11px;font-weight:600;">✅ Enviada</span>' 
        : '<span style="padding:4px 10px;background:var(--bg2);color:var(--ink4);border-radius:20px;font-size:11px;">Pendiente</span>';
      
      const contactoBadge = d.contactado
        ? '<span style="padding:4px 10px;background:var(--blue-l);color:var(--blue);border-radius:20px;font-size:11px;font-weight:600;">📞 Contactado</span>'
        : '';
      
      const inversion = d.resultado?.rangoPrecio?.texto || 'Por definir';
      
      return `
        <tr style="border-bottom:1px solid var(--border);transition:background 0.2s;">
          <td style="padding:12px;font-family:var(--mono);font-size:12px;">${fecha}</td>
          <td style="padding:12px;font-weight:600;">${d.cliente?.empresa || '—'}</td>
          <td style="padding:12px;">${d.cliente?.email || '—'}</td>
          <td style="padding:12px;">${d.cliente?.industria || '—'}</td>
          <td style="padding:12px;">
            <span style="padding:4px 10px;background:${nivelColor};color:white;border-radius:20px;font-size:11px;font-weight:600;">
              ${d.resultado?.nivel || '—'}
            </span>
          </td>
          <td style="padding:12px;font-family:var(--mono);font-size:12px;">${inversion}</td>
          <td style="padding:12px;">${solicitudBadge}</td>
          <td style="padding:12px;">
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button onclick="adminDiagnosticos.contactar('${d.id}', '${d.cliente?.email || ''}')" 
                style="padding:6px 12px;background:var(--blue);color:white;border:none;border-radius:6px;font-size:11px;cursor:pointer;transition:all 0.2s;"
                title="Contactar cliente">
                📧 Contactar
              </button>
              <button onclick="adminDiagnosticos.verDetalle('${d.id}')" 
                style="padding:6px 12px;background:var(--bg2);color:var(--ink);border:1px solid var(--border);border-radius:6px;font-size:11px;cursor:pointer;transition:all 0.2s;"
                title="Ver detalles">
                👁️ Ver
              </button>
              ${d.contactado ? '' : `<button onclick="adminDiagnosticos.marcarComoContactado('${d.id}')" 
                style="padding:6px 12px;background:var(--green);color:white;border:none;border-radius:6px;font-size:11px;cursor:pointer;transition:all 0.2s;"
                title="Marcar como contactado">
                ✅ Marcar
              </button>`}
            </div>
          </td>
        </tr>
      `;
    }).join('');
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
  // VER DETALLE DEL DIAGNÓSTICO
  // ─────────────────────────────────────────────────────────────
  verDetalle: function(id) {
    const diagnostico = this.diagnosticosCache.find(d => d.id === id);
    if (!diagnostico) {
      alert('❌ Diagnóstico no encontrado');
      return;
    }
    
    const disciplinas = diagnostico.seleccion?.disciplinas?.map(d => {
      const disc = window.estimadorPWA?.disciplinas?.[d];
      return disc ? disc.nombre : d;
    }).join(', ') || 'Ninguna';
    
    const capacidades = diagnostico.seleccion?.capacidades?.map(c => {
      const cap = window.estimadorPWA?.capacidades?.[c];
      return cap ? cap.nombre : c;
    }).join(', ') || 'Ninguna';
    
    const componentes = diagnostico.seleccion?.componentes?.join(', ') || 'Ninguno';
    
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
Tiempo: ${diagnostico.resultado?.semanas || '—'}
Lead Score: ${diagnostico.meta?.leadScore || 0}/100

⚙️ DISCIPLINAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${disciplinas}

💰 MOTOR DE COTIZACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Activado: ${diagnostico.seleccion?.motorCotizacion ? '✅ Sí' : '❌ No'}
Componentes: ${componentes}
Exportación: ${diagnostico.seleccion?.exportacion || 'Ninguna'}

🚀 CAPACIDADES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${capacidades}

📝 MENSAJE DE CIERRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${diagnostico.resultado?.mensajeCierre || '—'}

📊 ESTADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Solicitud Enviada: ${diagnostico.solicitudEnviada ? '✅ Sí' : '❌ No'}
Contactado: ${diagnostico.contactado ? '✅ Sí' : '❌ No'}
    `;
    
    console.log(detalle);
    alert(detalle);
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