// ═══════════════════════════════════════════════════════════════
// BELLEZA INTEGRAL — App Logic  (V8)
// Fixes: real availability from API, conflict handling, auto-refresh
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
  { id:'s1', nombre:'Corte Profesional', cat:'pelu', desc:'Estilo personalizado con productos premium.', dur:45, precio:15000, img:'', icon:'✂️' },
  { id:'s2', nombre:'Peinado Evento', cat:'pelu', desc:'Look espectacular para ocasiones especiales.', dur:60, precio:25000, img:'', icon:'👰' },
  { id:'s3', nombre:'Coloración', cat:'pelu', desc:'Tonos vibrantes con técnicas de vanguardia.', dur:90, precio:35000, img:'', icon:'🎨' },
  { id:'s4', nombre:'Alisado & Botox Capilar', cat:'pelu', desc:'Cabello liso, sedoso y restaurado.', dur:120, precio:45000, img:'', icon:'🌊' },
  { id:'s5', nombre:'Masaje Capilar', cat:'pelu', desc:'Relax y nutrición para tu cuero cabelludo.', dur:30, precio:12000, img:'', icon:'💆' },
  { id:'s6', nombre:'Lavado Premium', cat:'pelu', desc:'Limpieza profunda con productos de alta gama.', dur:30, precio:8000, img:'', icon:'💧' },
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
  slotsLoading: false,
  reservas: []
};

// ── INIT ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  setTimeout(() => document.getElementById('pageLoader').classList.add('hidden'), 1200);

  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Load services from API
  try {
    const response = await API.getServicios();
    if (response.ok && response.servicios) {
      SERVICIOS.length = 0;
      SERVICIOS.push(...response.servicios);
    }
  } catch(e) {
    console.log('Using demo services data');
  }

  // Load config and update logo
  try {
    const configResponse = await API.getConfig();
    if (configResponse.ok && configResponse.config) {
      updateLogo(configResponse.config.logoUrl);
    }
  } catch(e) {
    console.log('Using default config');
  }

  renderServiceCards();
  renderServicePicker();
  renderCalendar();

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

// ── SLOTS — Fetches real availability from API ────────
async function renderSlots() {
  const grid = document.getElementById('slotsGrid');
  if (!state.selServicio || !state.selFecha) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--muted);padding:20px;font-size:14px">Selecciona servicio y fecha</p>';
    return;
  }

  // Show loading state
  state.slotsLoading = true;
  grid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:32px">
      <div style="display:inline-block;width:28px;height:28px;border:3px solid var(--border);border-top-color:var(--gold);border-radius:50%;animation:spin .8s linear infinite"></div>
      <p style="color:var(--muted);font-size:13px;margin-top:10px">Consultando disponibilidad...</p>
    </div>`;

  const fechaStr = `${state.selFecha.getFullYear()}-${String(state.selFecha.getMonth()+1).padStart(2,'0')}-${String(state.selFecha.getDate()).padStart(2,'0')}`;

  try {
    const response = await API.getDisponibilidad(fechaStr, state.selServicio.id);
    state.slotsLoading = false;

    if (response.ok && response.disponibilidad) {
      const slots = response.disponibilidad;

      if (slots.length === 0) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--muted);padding:24px;font-size:14px">😔 No hay horarios disponibles para esta fecha. Prueba otro día.</p>';
        return;
      }

      grid.innerHTML = slots.map(s => {
        const active = state.selHora === s ? 'active' : '';
        return `<div class="slot ${active}" onclick="pickSlot('${s}')">${s}</div>`;
      }).join('');
      return;
    }
  } catch(e) {
    console.log('API unavailable, generating demo slots');
    state.slotsLoading = false;
  }

  // Fallback to demo slots only if API is not available
  const isSat = state.selFecha.getDay() === 6;
  const endHour = isSat ? 14 : 20;
  const slots = [];
  for (let h = 9; h < endHour; h++) {
    slots.push(`${String(h).padStart(2,'0')}:00`);
    if (h < endHour - 1 || (h === endHour - 1 && !isSat)) {
      slots.push(`${String(h).padStart(2,'0')}:30`);
    }
  }

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

// ── SUBMIT BOOKING — With conflict handling ───────────
async function submitBooking() {
  const nombre = document.getElementById('fNombre').value.trim();
  const tel = document.getElementById('fTel').value.trim();
  const email = document.getElementById('fEmail').value.trim();
  const notas = document.getElementById('fNotas').value.trim();

  if (!nombre) return showToast('Ingresa tu nombre','error');
  if (!tel || tel.length < 9) return showToast('Ingresa un teléfono válido','error');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showToast('Ingresa un email válido','error');
  if (!document.getElementById('fTerms').checked) return showToast('Debes aceptar los términos','error');

  // Disable button and show loading
  const btn = document.getElementById('btnConfirm');
  btn.disabled = true;
  btn.textContent = '⏳ Procesando...';

  const fechaStr = `${state.selFecha.getFullYear()}-${String(state.selFecha.getMonth()+1).padStart(2,'0')}-${String(state.selFecha.getDate()).padStart(2,'0')}`;

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
      const reserva = {
        id: response.reservaId || response.id,
        nombre,
        servicio: response.servicio || state.selServicio.nombre,
        fecha: response.fecha || fechaStr,
        hora: response.hora || state.selHora,
        estado: 'Confirmada'
      };

      closeModal();
      showConfirmation(reserva);
      showToast('¡Reserva confirmada! Revisa tu correo 📧🎉', 'success');
    } else {
      // CONFLICT HANDLING: If slot was taken by someone else
      if (response.conflicto) {
        showToast('⚠️ Ese horario acaba de ser reservado. Actualizando horarios...', 'error');
        closeModal();
        // Re-fetch available slots to show updated availability
        await renderSlots();
        state.selHora = null;
        updateSidebar();
      } else {
        showToast(response.error || 'Error al crear reserva', 'error');
      }
    }
  } catch(e) {
    console.error('Error en submitBooking:', e);
    // Fallback demo mode
    const resId = 'RES-' + Math.random().toString(36).substring(2,10).toUpperCase();
    const reserva = {
      id: resId, nombre,
      servicio: state.selServicio.nombre,
      fecha: fechaStr,
      hora: state.selHora,
      estado: 'Confirmada'
    };
    closeModal();
    showConfirmation(reserva);
    showToast('¡Reserva confirmada (demo)! 🎉', 'success');
  } finally {
    btn.disabled = false;
    btn.textContent = '✅ Confirmar Reserva';
  }
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

// ── TERMS ─────────────────────────────────────────────
function openTerms() { document.getElementById('termsModal').classList.add('open'); }
function closeTerms() { document.getElementById('termsModal').classList.remove('open'); }

// ── TOAST ─────────────────────────────────────────────
function showToast(msg, type='error') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + type + ' show';
  setTimeout(() => t.classList.remove('show'), 4000);
}

// ── LOGO UPDATE ────────────────────────────────────────
function updateLogo(logoUrl) {
  if (logoUrl) {
    const navBrand = document.querySelector('.nav-brand');
    if (navBrand) {
      navBrand.innerHTML = `
        <img src="${logoUrl}" alt="Logo" style="height: 32px; margin-right: 8px; vertical-align: middle;">
        <span class="dot"></span> Belleza Integral
      `;
    }
  }
}

// ── ESC KEY HANDLERS ──────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeTerms();
  }
});

['bookingModal','termsModal'].forEach(id => {
  document.getElementById(id)?.addEventListener('click', (e) => {
    if (e.target === document.getElementById(id)) {
      if (id === 'bookingModal') closeModal();
      else closeTerms();
    }
  });
});
