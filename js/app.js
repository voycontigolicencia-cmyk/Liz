/* ════════════════════════════════════════════════════════════════ */
/* SALÓN DE BELLEZA — js/app.js (v3 — Salon Belleza)            */
/* ════════════════════════════════════════════════════════════════ */

const state = {
  servicios:    [],
  empleados:    [],
  servicioSel:  null,
  slotSel:      null,
  fechaSel:     null,
  empleadoSel:  null,
  disponibilidad: {}
};

// ── INICIALIZACIÓN ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  aplicarLogo();
  mostrarLoader(true, 'Cargando servicios…');
  
  try {
    const [srv, emp] = await Promise.all([
      API.getServicios(),
      API.getEmpleados()
    ]);
    
    state.servicios = Array.isArray(srv) ? srv : [];
    state.empleados = Array.isArray(emp) ? emp : [];
    
    renderServicios();
    renderEmpleadosFiltro();
  } catch(e) {
    console.error('Error durante init:', e);
    mostrarError('Error al cargar datos. Por favor, recarga la página.');
  } finally {
    mostrarLoader(false);
  }
  
  renderCalendario('calendario');
  escucharEventos();
});

// ── APLICAR LOGO ───────────────────────────────────────────────────
function aplicarLogo() {
  if (!window.LOGO_URL) return;
  
  const elementos = ['nav-logo', 'sidebar-logo', 'footer-logo'];
  elementos.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    
    if (el.innerHTML.includes('💅') || el.innerHTML.includes('emoji')) {
      el.innerHTML = `<img src="${window.LOGO_URL}" alt="Logo" 
        style="height:40px;width:40px;border-radius:50%;object-fit:cover;border:2px solid var(--gold)">`;
    }
  });
}

// ── SERVICIOS ──────────────────────────────────────────────────────
function renderServicios() {
  const cont = document.getElementById('servicios-grid');
  if (!cont) return;

  if (!state.servicios.length) {
    cont.innerHTML = '<p style="color:var(--hint);padding:20px;text-align:center">Sin servicios disponibles</p>';
    return;
  }

  // Agrupar por categoría
  const cats = {};
  state.servicios.forEach(s => {
    if (!cats[s.categoria]) cats[s.categoria] = [];
    cats[s.categoria].push(s);
  });

  let html = '';
  Object.entries(cats).forEach(([cat, svcs]) => {
    html += `<div class="srv-categoria">
      <h3 class="srv-cat-titulo">${cat}</h3>
      <div class="srv-lista">`;

    svcs.forEach(s => {
      const durStr = s.duracion >= 60
        ? `${Math.floor(s.duracion/60)}h${s.duracion%60 ? ' '+s.duracion%60+'min':''}`
        : `${s.duracion} min`;
      
      const esSel = state.servicioSel && state.servicioSel.id === s.id;
      const sesTag = s.esSesion ? `<span class="srv-sesion">📅 ${s.maxSesiones} sesiones</span>` : '';
      const skTag = s.requiereSkill ? `<span class="srv-skill">${s.requiereSkill}</span>` : '';

      html += `
        <div class="srv-card ${esSel ? 'srv-card--sel' : ''}"
             onclick="seleccionarServicio('${s.id}')">
          <div class="srv-card-info">
            <div class="srv-card-nombre">${s.nombre} ${sesTag} ${skTag}</div>
            <div class="srv-card-detalles">
              <span class="srv-duracion">⏱ ${durStr}</span>
              <span class="srv-precio">$${s.precio.toLocaleString('es-CL')}</span>
            </div>
          </div>
          <div class="srv-card-check ${esSel ? 'activo' : ''}">✓</div>
        </div>`;
    });
    
    html += '</div></div>';
  });

  cont.innerHTML = html;
}

function seleccionarServicio(servicioId) {
  state.servicioSel = state.servicios.find(s => s.id === servicioId);
  if (!state.servicioSel) return;

  renderServicios();
  actualizarResumen();

  // Si ya hay fecha seleccionada, cargar slots
  if (state.fechaSel) {
    cargarSlotsDisponibles();
  }
}

// ── EMPLEADOS / FILTRO ─────────────────────────────────────────────
function renderEmpleadosFiltro() {
  const cont = document.getElementById('empleados-filtro');
  if (!cont || !state.servicioSel) {
    if (cont) cont.innerHTML = '';
    return;
  }

  const empleadosAptos = state.empleados.filter(emp => {
    if (!state.servicioSel.requiereSkill) return true;
    return emp.especialidad === state.servicioSel.requiereSkill;
  });

  let html = '<div style="display:flex;gap:8px;flex-wrap:wrap">';
  
  html += `<button class="empleado-filtro-btn ${!state.empleadoSel ? 'activo' : ''}"
    onclick="seleccionarEmpleado(null)">
    👥 Cualquiera
  </button>`;

  empleadosAptos.forEach(emp => {
    const esSel = state.empleadoSel && state.empleadoSel.id === emp.id;
    html += `<button class="empleado-filtro-btn ${esSel ? 'activo' : ''}"
      onclick="seleccionarEmpleado('${emp.id}')">
      ${emp.nombre}
    </button>`;
  });

  html += '</div>';
  cont.innerHTML = html;

  // Estilos para los botones (si no existen)
  if (!document.getElementById('estilos-empleados')) {
    const style = document.createElement('style');
    style.id = 'estilos-empleados';
    style.textContent = `
      .empleado-filtro-btn {
        padding: 8px 16px;
        background: var(--bg);
        border: 2px solid var(--border);
        border-radius: var(--r-lg);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--dur-norm);
        color: var(--text);
      }
      
      .empleado-filtro-btn:hover {
        border-color: var(--gold);
        background: rgba(201, 168, 76, 0.05);
      }
      
      .empleado-filtro-btn.activo {
        background: linear-gradient(135deg, var(--gold), var(--rose));
        color: white;
        border-color: transparent;
      }
    `;
    document.head.appendChild(style);
  }
}

function seleccionarEmpleado(empleadoId) {
  if (!empleadoId) {
    state.empleadoSel = null;
  } else {
    state.empleadoSel = state.empleados.find(e => e.id === empleadoId);
  }

  renderEmpleadosFiltro();
  cargarSlotsDisponibles();
  actualizarResumen();
}

// ── SLOTS DISPONIBLES ──────────────────────────────────────────────
async function cargarSlotsDisponibles() {
  if (!state.servicioSel || !state.fechaSel) return;

  const cont = document.getElementById('slots-container');
  if (!cont) return;

  cont.innerHTML = '<p class="slots-vacio">Cargando disponibilidad…</p>';

  try {
    const fechaStr = formatearFecha(state.fechaSel);
    const data = await API.getDisponibilidad(fechaStr, state.servicioSel.id);
    
    state.disponibilidad = data;

    renderSlotsDisponibles(data);
  } catch(e) {
    console.error('Error cargando slots:', e);
    cont.innerHTML = '<p class="slots-vacio">Error al cargar disponibilidad</p>';
  }
}

function renderSlotsDisponibles(disponibilidad) {
  const cont = document.getElementById('slots-container');
  if (!cont) return;

  // Filtrar empleados según skill
  let empleadosAptos = state.empleados;
  if (state.servicioSel.requiereSkill) {
    empleadosAptos = empleadosAptos.filter(e => e.especialidad === state.servicioSel.requiereSkill);
  }

  // Si un empleado está seleccionado, mostrar solo sus slots
  if (state.empleadoSel) {
    empleadosAptos = [state.empleadoSel];
  }

  if (!empleadosAptos.length) {
    cont.innerHTML = '<p class="slots-vacio">No hay especialistas disponibles</p>';
    return;
  }

  // Generar slots
  const horaInicio = 9 * 60; // 09:00
  const horaFin = 20 * 60;   // 20:00
  const duracion = state.servicioSel.duracion;
  
  const slots = [];
  for (let t = horaInicio; t < horaFin; t += 30) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    const hora = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    
    // Verificar disponibilidad
    empleadosAptos.forEach(emp => {
      const key = `${emp.id}|${hora}`;
      const disponible = disponibilidad[emp.id]?.[hora] !== false;
      
      if (disponible) {
        slots.push({
          hora,
          empleado: emp,
          key
        });
      }
    });
  }

  if (!slots.length) {
    cont.innerHTML = '<p class="slots-vacio">No hay horarios disponibles</p>';
    return;
  }

  // Renderizar slots
  let html = '';
  let empleadoActual = null;

  slots.forEach(slot => {
    // Encabezado de empleado
    if (!empleadoActual || empleadoActual.id !== slot.empleado.id) {
      if (empleadoActual) html += '</div>';
      html += `<div style="grid-column:1/-1;padding:8px 0;border-top:1px solid var(--border);margin-top:8px">
        <strong style="color:var(--gold);font-size:13px">${slot.empleado.nombre}</strong>
      </div>`;
      empleadoActual = slot.empleado;
    }

    const esSel = state.slotSel && state.slotSel.key === slot.key;
    html += `<div class="slot-item ${esSel ? 'seleccionado' : ''}"
             onclick="seleccionarSlot('${slot.key}', '${slot.empleado.id}', '${slot.hora}')">
      ${slot.hora}
    </div>`;
  });

  cont.innerHTML = html || '<p class="slots-vacio">Sin disponibilidad</p>';
}

function seleccionarSlot(key, empleadoId, hora) {
  const empleado = state.empleados.find(e => e.id === empleadoId);
  state.slotSel = { key, empleadoId, hora, empleado };
  state.empleadoSel = empleado;

  renderSlotsDisponibles(state.disponibilidad);
  actualizarResumen();
}

// ── RESUMEN DE SELECCIÓN ───────────────────────────────────────────
function actualizarResumen() {
  const cont = document.getElementById('resumen-seleccion');
  if (!cont) return;

  if (!state.servicioSel) {
    cont.innerHTML = '<p class="resumen-placeholder">Selecciona un servicio para continuar.</p>';
    return;
  }

  let html = '';

  // Servicio
  html += `<div class="resumen-item">
    <strong>Servicio:</strong> ${state.servicioSel.nombre}
  </div>`;

  // Duración
  const durStr = state.servicioSel.duracion >= 60
    ? `${Math.floor(state.servicioSel.duracion/60)}h${state.servicioSel.duracion%60 ? ' '+state.servicioSel.duracion%60+'min':''}`
    : `${state.servicioSel.duracion} min`;
  html += `<div class="resumen-item">
    <strong>Duración:</strong> ${durStr}
  </div>`;

  // Precio
  html += `<div class="resumen-item">
    <strong>Precio:</strong> $${state.servicioSel.precio.toLocaleString('es-CL')}
  </div>`;

  // Fecha
  if (state.fechaSel) {
    const opciones = { weekday: 'short', month: 'short', day: 'numeric' };
    const fechaStr = state.fechaSel.toLocaleDateString('es-CL', opciones);
    html += `<div class="resumen-item">
      <strong>Fecha:</strong> ${fechaStr}
    </div>`;
  }

  // Hora
  if (state.slotSel) {
    html += `<div class="resumen-item">
      <strong>Hora:</strong> ${state.slotSel.hora}
    </div>`;
    
    html += `<div class="resumen-item">
      <strong>Especialista:</strong> ${state.slotSel.empleado.nombre}
    </div>`;

    // Botón confirmar
    html += `<button class="btn-primary" style="width:100%;margin-top:12px" 
             onclick="abrirModal()">
      ✅ Confirmar Reserva
    </button>`;
  }

  cont.innerHTML = html || '<p class="resumen-placeholder">Selecciona fecha y hora</p>';
}

// ── MODAL DE RESERVA ───────────────────────────────────────────────
function abrirModal() {
  if (!state.slotSel || !state.servicioSel) {
    mostrarError('Selecciona fecha y hora');
    return;
  }

  const modal = document.getElementById('modal-reserva');
  if (!modal) return;

  // Llenar datos
  document.getElementById('modal-srv').textContent = state.servicioSel.nombre;
  document.getElementById('modal-barbero').textContent = state.slotSel.empleado.nombre;
  document.getElementById('modal-hora').textContent = state.slotSel.hora;
  document.getElementById('modal-precio').textContent = '$' + state.servicioSel.precio.toLocaleString('es-CL');

  // Fecha
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fechaStr = state.fechaSel.toLocaleDateString('es-CL', opciones);
  document.getElementById('modal-fecha').textContent = fechaStr.charAt(0).toUpperCase() + fechaStr.slice(1);

  // Sesiones (si aplica)
  const sesionGroup = document.getElementById('sesion-group');
  if (state.servicioSel.esSesion) {
    sesionGroup.style.display = 'block';
    const select = document.getElementById('sesion-num');
    select.innerHTML = '';
    for (let i = 1; i <= state.servicioSel.maxSesiones; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `Sesión ${i} de ${state.servicioSel.maxSesiones}`;
      select.appendChild(opt);
    }
  } else {
    sesionGroup.style.display = 'none';
  }

  // Mostrar modal
  modal.classList.add('activo');
}

function cerrarModal() {
  const modal = document.getElementById('modal-reserva');
  if (modal) modal.classList.remove('activo');
}

// ── CONFIRMAR RESERVA ──────────────────────────────────────────────
async function confirmarReserva() {
  // Validar
  const nombre = document.getElementById('inp-nombre').value.trim();
  const email = document.getElementById('inp-email').value.trim();
  const tel = document.getElementById('inp-tel').value.trim();
  const notas = document.getElementById('inp-notas').value.trim();

  if (!nombre) {
    mostrarError('Por favor ingresa tu nombre');
    return;
  }

  if (!email || !API.validarEmail(email)) {
    mostrarError('Por favor ingresa un email válido');
    return;
  }

  mostrarLoader(true, 'Creando reserva…');

  try {
    const fechaStr = formatearFecha(state.fechaSel);
    const sesion = document.getElementById('sesion-num')?.value || '1';

    const resultado = await API.crearReserva({
      servicio: state.servicioSel.id,
      empleado: state.slotSel.empleadoId,
      fecha: fechaStr,
      hora: state.slotSel.hora,
      nombre,
      email,
      telefono: tel || 'N/A',
      notas: notas || 'N/A',
      sesion
    });

    if (!resultado.ok) {
      throw new Error(resultado.error || 'Error desconocido');
    }

    // Mostrar confirmación
    mostrarConfirmacion(resultado);
    cerrarModal();

  } catch(e) {
    console.error('Error:', e);
    mostrarError('Error al crear la reserva: ' + e.message);
  } finally {
    mostrarLoader(false);
  }
}

function mostrarConfirmacion(resultado) {
  const resScreen = document.getElementById('reservas-screen');
  const confScreen = document.getElementById('confirmacion-screen');

  if (!resScreen || !confScreen) return;

  // Llenar datos
  document.getElementById('conf-id').textContent = resultado.id || 'N/A';
  document.getElementById('conf-nombre').textContent = resultado.nombre || 'N/A';
  document.getElementById('conf-srv').textContent = resultado.servicio || 'N/A';
  document.getElementById('conf-barbero').textContent = resultado.empleado || 'N/A';
  document.getElementById('conf-fecha').textContent = resultado.fecha || 'N/A';
  document.getElementById('conf-hora').textContent = resultado.hora || 'N/A';

  resScreen.style.display = 'none';
  confScreen.style.display = 'block';
  confScreen.scrollIntoView({ behavior: 'smooth' });

  mostrarExito('¡Reserva confirmada! Te enviaremos un email con los detalles.');
}

function nuevaReserva() {
  // Limpiar estado
  state.servicioSel = null;
  state.slotSel = null;
  state.fechaSel = null;
  state.empleadoSel = null;

  document.getElementById('inp-nombre').value = '';
  document.getElementById('inp-email').value = '';
  document.getElementById('inp-tel').value = '';
  document.getElementById('inp-notas').value = '';

  const resScreen = document.getElementById('reservas-screen');
  const confScreen = document.getElementById('confirmacion-screen');

  if (resScreen) resScreen.style.display = 'block';
  if (confScreen) confScreen.style.display = 'none';

  renderServicios();
  renderEmpleadosFiltro();
  renderCalendario('calendario');
  actualizarResumen();

  resScreen.scrollIntoView({ behavior: 'smooth' });
}

// ── EVENTOS ────────────────────────────────────────────────────────
function escucharEventos() {
  // Cerrar modal con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarModal();
  });

  // Cerrar modal al hacer clic afuera
  const modal = document.getElementById('modal-reserva');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) cerrarModal();
    });
  }
}

// ── SCROLL A SERVICIOS ─────────────────────────────────────────────
function scrollToServicios(nombreServicio) {
  document.getElementById('reservar').scrollIntoView({ behavior: 'smooth' });
  
  // Buscar servicio
  const servicio = state.servicios.find(s => 
    s.nombre.toLowerCase().includes(nombreServicio.toLowerCase())
  );
  
  if (servicio) {
    seleccionarServicio(servicio.id);
  }
}

// ── INICIALIZACIÓN DE WINDOW ───────────────────────────────────────
// Para uso desde HTML
window.seleccionarServicio = seleccionarServicio;
window.seleccionarEmpleado = seleccionarEmpleado;
window.seleccionarSlot = seleccionarSlot;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.confirmarReserva = confirmarReserva;
window.nuevaReserva = nuevaReserva;
window.scrollToServicios = scrollToServicios;
