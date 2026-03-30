// ═══════════════════════════════════════════════════════════════
// BELLEZA INTEGRAL — App Logic
// ═══════════════════════════════════════════════════════════════

// ── CONFIG ────────────────────────────────────────────
const CONFIG = {
  nombre: "Belleza Integral",
  duena: "Liz",
  whatsapp: "+56964364128",
  instagram: "https://www.instagram.com/bellezaintegral.liz?igsh=MWNua2d1d2R3aW83bA==",
  direccion: "Santiago Centro, Santiago de Chile"
};

// ── DEMO SERVICES DATA ────────────────────────────────
const SERVICIOS = [
  // Peluquería
  { id:'s1', nombre:'Corte Profesional', cat:'pelu', desc:'Estilo personalizado con productos premium.', dur:45, precio:15000, img:'', icon:'✂️' },
  { id:'s2', nombre:'Peinado Evento', cat:'pelu', desc:'Look espectacular para ocasiones especiales.', dur:60, precio:25000, img:'', icon:'👰' },
  { id:'s3', nombre:'Coloración', cat:'pelu', desc:'Tonos vibrantes con técnicas de vanguardia.', dur:90, precio:35000, img:'', icon:'🎨' },
  { id:'s4', nombre:'Alisado & Botox Capilar', cat:'pelu', desc:'Cabello liso, sedoso y restaurado.', dur:120, precio:45000, img:'', icon:'🌊' },
  { id:'s5', nombre:'Masaje Capilar', cat:'pelu', desc:'Relax y nutrición para tu cuero cabelludo.', dur:30, precio:12000, img:'', icon:'💆' },
  { id:'s6', nombre:'Lavado Premium', cat:'pelu', desc:'Limpieza profunda con productos de alta gama.', dur:30, precio:8000, img:'', icon:'💧' },
  // Uñas
  { id:'s7', nombre:'Manicure', cat:'unas', desc:'Cuidado completo y diseños personalizados.', dur:45, precio:12000, img:'', icon:'💅' },
  { id:'s8', nombre:'Manicure Permanente', cat:'unas', desc:'Esmalte que dura 14+ días sin dañar.', dur:60, precio:18000, img:'', icon:'✨' },
  { id:'s9', nombre:'Diseños Artísticos', cat:'unas', desc:'Nail art único que expresa tu estilo.', dur:75, precio:22000, img:'', icon:'🎀' }
];

// ── STATE ─────────────────────────────────────────────
let state = {
  selServicio: null,
  selFecha: null,
  selHora: null,
  calDate: new Date(),
  adminLogged: false,
  reservas: [
    { id:'RES-A1B2C3D4', nombre:'María González', email:'maria@email.com', tel:'+56912345678', servicio:'Manicure Permanente', fecha:'2026-04-01', hora:'14:00', estado:'Confirmada' },
    { id:'RES-E5F6G7H8', nombre:'Ana López', email:'ana@email.com', tel:'+56987654321', servicio:'Coloración', fecha:'2026-04-02', hora:'10:00', estado:'Pendiente' },
  ]
};

// ── INIT ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Simulate loading
  setTimeout(() => document.getElementById('pageLoader').classList.add('hidden'), 1200);

  // Navbar scroll
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
  });

  // Scroll reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Load services from API or use demo data
  try {
    const response = await API.getServicios();
    if (response.ok && response.servicios) {
      // Use API data
      SERVICIOS.length = 0;
      SERVICIOS.push(...response.servicios);
    }
  } catch(e) {
    console.log('Using demo services data');
  }

  // Render
  renderServiceCards();
  renderServicePicker();
  renderCalendar();

  // Terms checkbox
  document.getElementById('fTerms').addEventListener('change', (e) => {
    document.getElementById('btnConfirm').disabled = !e.target.checked;
  });
});

// ── MENU TOGGLE ───────────────────────────────────────
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

// ── RENDER SERVICE CARDS ──────────────────────────────
function renderServiceCards() {
  const pelu = SERVICIOS.filter(s => s.cat === 'pelu');
  const unas = SERVICIOS.filter(s => s.cat === 'unas');

  document.getElementById('serviciosPelu').innerHTML = pelu.map(s => serviceCardHTML(s)).join('');
  document.getElementById('serviciosUnas').innerHTML = unas.map(s => serviceCardHTML(s)).join('');

  // Add reveal class with stagger
  document.querySelectorAll('.servicio-card').forEach((card, i) => {
    card.classList.add('reveal');
    card.style.transitionDelay = `${i * .08}s`;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    observer.observe(card);
  });
}

function serviceCardHTML(s) {
  const durStr = s.dur >= 60 ? `${Math.floor(s.dur/60)}h${s.dur%60 ? ' '+s.dur%60+'m':''}` : `${s.dur} min`;
  const imgHTML = s.img
    ? `<img src="${s.img}" alt="${s.nombre}">`
    : `<div class="placeholder-icon">${s.icon}</div>`;
  return `
    <div class="servicio-card" onclick="pickService('${s.id}')">
      <div class="servicio-card-img">${imgHTML}</div>
      <div class="servicio-card-body">
        <h4>${s.nombre}</h4>
        <p>${s.desc}</p>
        <div class="servicio-card-meta">
          <span class="dur">⏱ ${durStr}</span>
          <span class="price">$${s.precio.toLocaleString('es-CL')}</span>
        </div>
      </div>
    </div>`;
}

// ── SERVICE PICKER (in booking section) ───────────────
function renderServicePicker() {
  const grid = document.getElementById('srvPicker');
  grid.innerHTML = SERVICIOS.map(s => {
    const active = state.selServicio?.id === s.id ? 'active' : '';
    const durStr = s.dur >= 60 ? `${Math.floor(s.dur/60)}h${s.dur%60?s.dur%60+'m':''}` : `${s.dur}min`;
    return `<div class="srv-mini ${active}" onclick="pickService('${s.id}')">
      <div class="name">${s.icon} ${s.nombre}</div>
      <div class="meta">${durStr} · <span class="price">$${s.precio.toLocaleString('es-CL')}</span></div>
    </div>`;
  }).join('');
}

function pickService(id) {
  state.selServicio = SERVICIOS.find(s => s.id === id);
  state.selHora = null;
  renderServicePicker();
  updateSidebar();
  if (state.selFecha) renderSlots();
  // scroll to booking
  document.getElementById('reservar').scrollIntoView({ behavior: 'smooth' });
}

// ── CALENDAR ──────────────────────────────────────────
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

function renderCalendar() {
  const d = state.calDate;
  const y = d.getFullYear(), m = d.getMonth();
  document.getElementById('calMonth').textContent = `${MESES[m]} ${y}`;

  const grid = document.getElementById('calGrid');
  let html = DIAS.map(d => `<div class="cal-head">${d}</div>`).join('');

  const firstDay = new Date(y, m, 1).getDay();
  for (let i = 0; i < firstDay; i++) html += '<div></div>';

  const today = new Date();
  today.setHours(0,0,0,0);
  const daysInMonth = new Date(y, m+1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(y, m, day);
    const isPast = date < today;
    const isSun = date.getDay() === 0;
    const isSelected = state.selFecha && state.selFecha.getTime() === date.getTime();
    const isToday = date.getTime() === today.getTime();

    let cls = 'cal-day';
    if (isPast || isSun) cls += ' disabled';
    if (isSelected) cls += ' selected';
    if (isToday) cls += ' today';

    const onclick = (isPast || isSun) ? '' : `onclick="pickDate(${y},${m},${day})"`;
    html += `<div class="${cls}" ${onclick}>${day}</div>`;
  }
  grid.innerHTML = html;
}

function changeMonth(dir) {
  state.calDate = new Date(state.calDate.getFullYear(), state.calDate.getMonth() + dir, 1);
  renderCalendar();
}

function pickDate(y, m, d) {
  state.selFecha = new Date(y, m, d);
  state.selHora = null;
  renderCalendar();

  const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  const str = state.selFecha.toLocaleDateString('es-CL', opts);
  document.getElementById('fechaDisplay').textContent = '✓ ' + str.charAt(0).toUpperCase() + str.slice(1);

  if (state.selServicio) renderSlots();
  updateSidebar();
}

// ── SLOTS ─────────────────────────────────────────────
async function renderSlots() {
  const grid = document.getElementById('slotsGrid');
  if (!state.selServicio || !state.selFecha) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--muted);padding:20px;font-size:14px">Selecciona servicio y fecha</p>';
    return;
  }

  // Try to get availability from API
  try {
    const response = await API.getDisponibilidad(
      `${state.selFecha.getFullYear()}-${String(state.selFecha.getMonth()+1).padStart(2,'0')}-${String(state.selFecha.getDate()).padStart(2,'0')}`,
      state.selServicio.id
    );
    if (response.ok && response.disponibilidad) {
      grid.innerHTML = response.disponibilidad.map(s => {
        const active = state.selHora === s ? 'active' : '';
        return `<div class="slot ${active}" onclick="pickSlot('${s}')">${s}</div>`;
      }).join('');
      return;
    }
  } catch(e) {
    console.log('Using demo slots');
  }

  // Fallback to demo slots
  const isSat = state.selFecha.getDay() === 6;
  const endHour = isSat ? 14 : 20;
  const slots = [];
  for (let h = 9; h < endHour; h++) {
    slots.push(`${String(h).padStart(2,'0')}:00`);
    if (h < endHour - 1 || (h === endHour - 1 && !isSat)) {
      slots.push(`${String(h).padStart(2,'0')}:30`);
    }
  }

  // Randomly disable some slots for demo
  const seed = state.selFecha.getDate();
  const available = slots.filter((_, i) => (i * seed + 3) % 5 !== 0);

  grid.innerHTML = available.map(s => {
    const active = state.selHora === s ? 'active' : '';
    return `<div class="slot ${active}" onclick="pickSlot('${s}')">${s}</div>`;
  }).join('');
}

function pickSlot(hora) {
  state.selHora = hora;
  renderSlots();
  updateSidebar();
}

// ── SIDEBAR ───────────────────────────────────────────
function updateSidebar() {
  const cont = document.getElementById('sideResumen');
  if (!state.selServicio) {
    cont.innerHTML = '<p style="color:var(--muted);font-size:13px;text-align:center;padding:16px">Selecciona un servicio para comenzar</p>';
    return;
  }

  const s = state.selServicio;
  const durStr = s.dur >= 60 ? `${Math.floor(s.dur/60)}h${s.dur%60?' '+s.dur%60+'m':''}` : `${s.dur} min`;
  let html = `
    <div class="resumen-item"><span>Servicio</span><strong>${s.nombre}</strong></div>
    <div class="resumen-item"><span>Duración</span><strong>${durStr}</strong></div>
    <div class="resumen-item"><span>Precio</span><strong style="color:var(--gold)">$${s.precio.toLocaleString('es-CL')}</strong></div>`;

  if (state.selFecha) {
    const opts = { weekday:'short', month:'short', day:'numeric' };
    html += `<div class="resumen-item"><span>Fecha</span><strong>${state.selFecha.toLocaleDateString('es-CL',opts)}</strong></div>`;
  }
  if (state.selHora) {
    html += `<div class="resumen-item"><span>Hora</span><strong>${state.selHora}</strong></div>`;
    html += `<button class="btn-gold" style="width:100%;margin-top:14px;justify-content:center" onclick="openBookingModal()">✅ Confirmar Reserva</button>`;
  }
  cont.innerHTML = html;
}

// ── BOOKING MODAL ─────────────────────────────────────
function openBookingModal() {
  if (!state.selServicio || !state.selFecha || !state.selHora) {
    showToast('Selecciona servicio, fecha y hora', 'error');
    return;
  }
  const s = state.selServicio;
  const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  const fechaStr = state.selFecha.toLocaleDateString('es-CL', opts);

  document.getElementById('modalSummary').innerHTML = `
    <div class="row"><span>Servicio</span><strong>${s.nombre}</strong></div>
    <div class="row"><span>Fecha</span><strong>${fechaStr.charAt(0).toUpperCase()+fechaStr.slice(1)}</strong></div>
    <div class="row"><span>Hora</span><strong>${state.selHora}</strong></div>
    <div class="row"><span>Precio</span><strong style="color:var(--gold)">$${s.precio.toLocaleString('es-CL')}</strong></div>`;

  document.getElementById('fTerms').checked = false;
  document.getElementById('btnConfirm').disabled = true;
  document.getElementById('bookingModal').classList.add('open');
}

function closeModal() {
  document.getElementById('bookingModal').classList.remove('open');
}

async function submitBooking() {
  const nombre = document.getElementById('fNombre').value.trim();
  const tel = document.getElementById('fTel').value.trim();
  const email = document.getElementById('fEmail').value.trim();
  const notas = document.getElementById('fNotas').value.trim();

  if (!nombre) return showToast('Ingresa tu nombre','error');
  if (!tel || tel.length < 9) return showToast('Ingresa un teléfono válido','error');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showToast('Ingresa un email válido','error');
  if (!document.getElementById('fTerms').checked) return showToast('Debes aceptar los términos','error');

  // Generate reservation ID
  const resId = 'RES-' + Math.random().toString(36).substring(2,10).toUpperCase();
  const fechaStr = `${state.selFecha.getFullYear()}-${String(state.selFecha.getMonth()+1).padStart(2,'0')}-${String(state.selFecha.getDate()).padStart(2,'0')}`;

  // Save to state
  const reserva = {
    id: resId, nombre, email, tel,
    servicio: state.selServicio.nombre,
    fecha: fechaStr,
    hora: state.selHora,
    estado: 'Confirmada'
  };
  state.reservas.push(reserva);

  // If API is available, send to Google Sheets
  try {
    const response = await API.crearReserva({
      nombre, email, telefono: tel,
      servicio: state.selServicio.id,
      empleado: 'emp_liz',
      fecha: fechaStr,
      hora: state.selHora,
      notas: notas || 'N/A'
    });
    if (response.ok) {
      reserva.id = response.reservaId;
    }
  } catch(e) {
    console.log('API not available, using demo mode');
  }

  closeModal();
  showConfirmation(reserva);
  showToast('¡Reserva confirmada! 🎉','success');
}

function showConfirmation(r) {
  document.getElementById('reservasMain').parentElement.parentElement.style.display = 'none';
  document.getElementById('confScreen').style.display = 'block';
  document.getElementById('confId').textContent = r.id;

  const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  const fecha = new Date(r.fecha + 'T12:00:00');
  const fechaStr = fecha.toLocaleDateString('es-CL', opts);

  document.getElementById('confDetails').innerHTML = `
    <div class="row"><span>Cliente</span><strong>${r.nombre}</strong></div>
    <div class="row"><span>Servicio</span><strong>${r.servicio}</strong></div>
    <div class="row"><span>Fecha</span><strong>${fechaStr.charAt(0).toUpperCase()+fechaStr.slice(1)}</strong></div>
    <div class="row"><span>Hora</span><strong>${r.hora}</strong></div>`;

  document.getElementById('confScreen').scrollIntoView({ behavior: 'smooth' });
}

function resetBooking() {
  state.selServicio = null;
  state.selFecha = null;
  state.selHora = null;

  document.getElementById('fNombre').value = '';
  document.getElementById('fTel').value = '';
  document.getElementById('fEmail').value = '';
  document.getElementById('fNotas').value = '';

  document.getElementById('confScreen').style.display = 'none';
  const sec = document.querySelector('.reservas-section');
  sec.style.display = '';

  renderServicePicker();
  renderCalendar();
  renderSlots();
  updateSidebar();
  document.getElementById('fechaDisplay').textContent = '';
  document.getElementById('reservar').scrollIntoView({ behavior: 'smooth' });
}

// ── ADMIN ─────────────────────────────────────────────
const ADMIN_TOKEN = 'liz2026';

function openAdmin() {
  document.getElementById('adminOverlay').classList.add('open');
  if (!state.adminLogged) {
    renderAdminLogin();
  } else {
    renderAdminDashboard();
  }
}
function closeAdmin() { document.getElementById('adminOverlay').classList.remove('open'); }

function renderAdminLogin() {
  document.getElementById('adminBody').innerHTML = `
    <div class="admin-login">
      <h3 style="font-family:var(--font-display);font-size:24px;margin-bottom:20px;color:var(--gold)">🔐 Acceso Administrador</h3>
      <p style="color:var(--muted);font-size:14px;margin-bottom:20px">Ingresa el token de acceso</p>
      <div>
        <input type="password" id="adminToken" placeholder="Token de acceso">
        <button class="admin-btn" onclick="loginAdmin()">Acceder</button>
      </div>
    </div>`;
}

function loginAdmin() {
  const token = document.getElementById('adminToken').value;
  if (token === ADMIN_TOKEN) {
    state.adminLogged = true;
    renderAdminDashboard();
    showToast('Bienvenida Liz 💅','success');
  } else {
    showToast('Token incorrecto','error');
  }
}

async function renderAdminDashboard() {
  const today = new Date().toISOString().split('T')[0];
  const todayCount = state.reservas.filter(r => r.fecha === today).length;
  const totalRes = state.reservas.length;

  // Try to get real data from API
  try {
    const response = await API.getReservas(ADMIN_TOKEN);
    if (response.ok && response.reservas) {
      state.reservas = response.reservas;
    }
  } catch(e) {
    console.log('Using demo reservations');
  }

  let html = `
    <div class="admin-stats">
      <div class="admin-stat"><div class="num">${todayCount}</div><div class="lbl">Reservas Hoy</div></div>
      <div class="admin-stat"><div class="num">${totalRes}</div><div class="lbl">Total Reservas</div></div>
      <div class="admin-stat"><div class="num">${SERVICIOS.length}</div><div class="lbl">Servicios</div></div>
      <div class="admin-stat"><div class="num">1</div><div class="lbl">Empleados</div></div>
    </div>

    <h3 style="font-family:var(--font-display);font-size:20px;margin-bottom:16px;color:var(--gold)">📅 Reservas</h3>
    <div style="overflow-x:auto;margin-bottom:28px">
      <table class="admin-table">
        <thead><tr><th>ID</th><th>Cliente</th><th>Servicio</th><th>Fecha</th><th>Hora</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>`;

  state.reservas.forEach((r, i) => {
    const badgeCls = r.estado === 'Confirmada' ? 'badge-ok' : r.estado === 'Cancelada' ? 'badge-cancel' : 'badge-pending';
    const canReschedule = canRescheduleCheck(r);
    html += `<tr>
      <td style="font-family:monospace;font-size:12px">${r.id}</td>
      <td>${r.nombre}<br><span style="font-size:11px;color:var(--muted)">${r.email}</span></td>
      <td>${r.servicio}</td>
      <td>${r.fecha}</td>
      <td>${r.hora}</td>
      <td><span class="badge ${badgeCls}">${r.estado}</span></td>
      <td>
        ${r.estado !== 'Cancelada' ? `
          <button class="admin-btn danger" style="margin-right:4px;font-size:11px;padding:4px 10px" onclick="adminCancel(${i})">Cancelar</button>
          ${canReschedule ? `<button class="admin-btn" style="font-size:11px;padding:4px 10px" onclick="adminReschedule(${i})">Reagendar</button>` : ''}
        ` : '<span style="color:var(--muted);font-size:12px">—</span>'}
      </td>
    </tr>`;
  });

  html += `</tbody></table></div>
    <h3 style="font-family:var(--font-display);font-size:20px;margin-bottom:16px;color:var(--gold)">🛎️ Servicios</h3>
    <p style="color:var(--muted);font-size:13px;margin-bottom:12px">Para editar servicios, modifica directamente en la Google Sheet. Cada servicio tiene una celda para link de imagen.</p>

    <button class="admin-btn" style="margin-top:16px" onclick="state.adminLogged=false;renderAdminLogin()">🔒 Cerrar Sesión</button>`;

  document.getElementById('adminBody').innerHTML = html;
}

function canRescheduleCheck(r) {
  const resDate = new Date(r.fecha + 'T' + r.hora);
  const now = new Date();
  const diffHours = (resDate - now) / (1000 * 60 * 60);
  return diffHours > 48;
}

async function adminCancel(i) {
  if (!confirm('¿Cancelar esta reserva? Se enviará un correo de disculpas al cliente.')) return;

  const r = state.reservas[i];
  try {
    const response = await API.cancelarReserva(r.id, ADMIN_TOKEN);
    if (response.ok) {
      state.reservas[i].estado = 'Cancelada';
      showToast(`Reserva cancelada. Correo de disculpas enviado a ${r.email}`, 'success');
      renderAdminDashboard();
    } else {
      showToast(response.error || 'Error al cancelar', 'error');
    }
  } catch(e) {
    // Fallback to demo
    state.reservas[i].estado = 'Cancelada';
    showToast(`Reserva cancelada (demo). Correo simulado enviado a ${r.email}`, 'success');
    renderAdminDashboard();
  }
}

async function adminReschedule(i) {
  const r = state.reservas[i];
  if (!canRescheduleCheck(r)) {
    showToast('No se puede reagendar con menos de 48 horas de anticipación. Se pierde el valor abonado.', 'error');
    return;
  }
  const newDate = prompt('Nueva fecha (YYYY-MM-DD):', r.fecha);
  if (!newDate) return;
  const newHora = prompt('Nueva hora (HH:MM):', r.hora);
  if (!newHora) return;

  try {
    const response = await API.reagendarReserva(r.id, newDate, newHora, ADMIN_TOKEN);
    if (response.ok) {
      state.reservas[i].fecha = newDate;
      state.reservas[i].hora = newHora;
      showToast('Reserva reagendada. Se notificará al cliente por correo.', 'success');
      renderAdminDashboard();
    } else {
      showToast(response.error || 'Error al reagendar', 'error');
    }
  } catch(e) {
    // Fallback to demo
    state.reservas[i].fecha = newDate;
    state.reservas[i].hora = newHora;
    showToast('Reserva reagendada (demo). Correo simulado enviado.', 'success');
    renderAdminDashboard();
  }
}

// ── TERMS ─────────────────────────────────────────────
function openTerms() { document.getElementById('termsModal').classList.add('open'); }
function closeTerms() { document.getElementById('termsModal').classList.remove('open'); }

// ── TOAST ─────────────────────────────────────────────
function showToast(msg, type='error') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + type + ' show';
  setTimeout(() => t.classList.remove('show'), 3500);
}

// ── ESC KEY HANDLERS ──────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeAdmin();
    closeTerms();
  }
});

// Close modals on backdrop click
['bookingModal','adminOverlay','termsModal'].forEach(id => {
  document.getElementById(id)?.addEventListener('click', (e) => {
    if (e.target === document.getElementById(id)) {
      if (id === 'bookingModal') closeModal();
      else if (id === 'adminOverlay') closeAdmin();
      else closeTerms();
    }
  });
});
