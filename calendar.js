/* ════════════════════════════════════════════════════════════════ */
/* SALÓN DE BELLEZA — js/calendar.js (v3)                         */
/* ════════════════════════════════════════════════════════════════ */

let calendarioActual = new Date();
let fechaSeleccionada = null;

function renderCalendario(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const hoy = new Date();
  const año = calendarioActual.getFullYear();
  const mes = calendarioActual.getMonth();

  // Headers del mes
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Limpiar
  container.innerHTML = '';

  // Título del mes
  const titulo = document.createElement('div');
  titulo.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 0 8px;
  `;
  
  const btnPrev = document.createElement('button');
  btnPrev.textContent = '←';
  btnPrev.style.cssText = `
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: var(--gold);
    padding: 8px 12px;
    border-radius: 6px;
    transition: all 0.2s;
  `;
  btnPrev.onmouseover = () => btnPrev.style.background = 'rgba(201, 168, 76, 0.1)';
  btnPrev.onmouseout = () => btnPrev.style.background = 'none';
  btnPrev.onclick = () => {
    calendarioActual = new Date(año, mes - 1, 1);
    renderCalendario(containerId);
  };

  const mes_año = document.createElement('span');
  mes_año.textContent = `${meses[mes]} ${año}`;
  mes_año.style.cssText = `
    font-weight: 700;
    font-size: 15px;
    color: var(--text);
  `;

  const btnNext = document.createElement('button');
  btnNext.textContent = '→';
  btnNext.style.cssText = `
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: var(--gold);
    padding: 8px 12px;
    border-radius: 6px;
    transition: all 0.2s;
  `;
  btnNext.onmouseover = () => btnNext.style.background = 'rgba(201, 168, 76, 0.1)';
  btnNext.onmouseout = () => btnNext.style.background = 'none';
  btnNext.onclick = () => {
    calendarioActual = new Date(año, mes + 1, 1);
    renderCalendario(containerId);
  };

  titulo.appendChild(btnPrev);
  titulo.appendChild(mes_año);
  titulo.appendChild(btnNext);
  container.appendChild(titulo);

  // Grid de días
  const grid = document.createElement('div');
  grid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
  `;

  // Headers días semana
  diasSemana.forEach(dia => {
    const header = document.createElement('div');
    header.textContent = dia;
    header.style.cssText = `
      text-align: center;
      font-size: 12px;
      font-weight: 700;
      color: var(--gold);
      padding: 8px;
    `;
    grid.appendChild(header);
  });

  // Primeros espacios (días del mes anterior)
  const primerDia = new Date(año, mes, 1).getDay();
  for (let i = 0; i < primerDia; i++) {
    const vacio = document.createElement('div');
    grid.appendChild(vacio);
  }

  // Días del mes
  const diasEnMes = new Date(año, mes + 1, 0).getDate();
  for (let dia = 1; dia <= diasEnMes; dia++) {
    const fecha = new Date(año, mes, dia);
    const el = document.createElement('div');
    el.textContent = dia;
    el.className = 'cal-day';

    // Deshabilitados: pasados y domingos/festivos
    if (fecha < hoy && fecha.getDate() === hoy.getDate() && mes === hoy.getMonth()) {
      // Permite hoy
    } else if (fecha < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())) {
      el.classList.add('deshabilitado');
      el.onclick = null;
    } else if (fecha.getDay() === 0) {
      el.classList.add('deshabilitado');
      el.onclick = null;
    } else {
      el.onclick = () => seleccionarFecha(fecha);
    }

    // Marcar seleccionado
    if (
      fechaSeleccionada &&
      fechaSeleccionada.getDate() === dia &&
      fechaSeleccionada.getMonth() === mes &&
      fechaSeleccionada.getFullYear() === año
    ) {
      el.classList.add('seleccionado');
    }

    grid.appendChild(el);
  }

  container.appendChild(grid);
}

function seleccionarFecha(fecha) {
  fechaSeleccionada = fecha;
  state.fechaSel = fecha;

  // Actualizar display
  const display = document.getElementById('fecha-display');
  if (display) {
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fechaStr = fecha.toLocaleDateString('es-CL', opciones);
    display.textContent = `✓ ${fechaStr.charAt(0).toUpperCase() + fechaStr.slice(1)}`;
  }

  // Renderizar calendario de nuevo para mostrar selección
  const container = document.getElementById('calendario');
  if (container) renderCalendario('calendario');

  // Cargar slots disponibles
  if (state.servicioSel) {
    cargarSlotsDisponibles();
  }
}

function formatearFecha(fecha) {
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}

function obtenerHorasDisponibles(fecha, servicioId) {
  // Esto se llama desde app.js después de obtener disponibilidad de la API
  // El formato es: { "empleado_id": { "16:00": true, "16:30": true, ... } }
  
  return {
    horas: [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'
    ],
    disponibles: {}
  };
}
