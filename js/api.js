/* ════════════════════════════════════════════════════════════════ */
/* SALÓN DE BELLEZA — js/api.js (v3 — Rutas Relativas)           */
/* ════════════════════════════════════════════════════════════════ */

// CONFIGURACIÓN DESDE GOOGLE APPS SCRIPT
// Reemplaza con tu URL de Google Apps Script
const GAS_URL = "https://script.google.com/macros/s/AKfycbzxA-iymeXXDhX62CgRwKI1-HfsLPw1OxGRSpZxiG7yH2bmaXD8EyC_A0XJEr_NH4bUqg/exec";

const API = {
  
  // ── SERVICIOS ──────────────────────────────────────────────
  getServicios: async function() {
    try {
      const res = await fetch(`${GAS_URL}?action=getServicios`);
      const data = await res.json();
      return data.servicios || [];
    } catch(e) {
      console.error('Error fetching servicios:', e);
      return [];
    }
  },

  // ── EMPLEADOS ──────────────────────────────────────────────
  getEmpleados: async function() {
    try {
      const res = await fetch(`${GAS_URL}?action=getEmpleados`);
      const data = await res.json();
      return data.empleados || [];
    } catch(e) {
      console.error('Error fetching empleados:', e);
      return [];
    }
  },

  // ── DISPONIBILIDAD ──────────────────────────────────────────
  getDisponibilidad: async function(fechaStr, servicioId) {
    try {
      const res = await fetch(
        `${GAS_URL}?action=getDisponibilidad&fecha=${fechaStr}&servicio=${servicioId}`
      );
      const data = await res.json();
      return data.disponibilidad || {};
    } catch(e) {
      console.error('Error fetching disponibilidad:', e);
      return {};
    }
  },

  // ── CREAR RESERVA ──────────────────────────────────────────
  crearReserva: async function(reserva) {
    try {
      const res = await fetch(GAS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          action: 'crearReserva',
          ...reserva
        })
      });
      const data = await res.json();
      return data;
    } catch(e) {
      console.error('Error creating reserva:', e);
      throw e;
    }
  },

  // ── VALIDAR EMAIL ──────────────────────────────────────────
  validarEmail: function(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  // ── VALIDAR TELÉFONO ──────────────────────────────────────
  validarTelefono: function(tel) {
    const regex = /^[\d\s+\-()]+$/;
    return regex.test(tel) && tel.length >= 9;
  }

};

// ── FUNCIONES AUXILIARES ──────────────────────────────────
function mostrarLoader(visible = true, texto = 'Cargando…') {
  const loader = document.getElementById('loader');
  const txt = document.getElementById('loader-txt');
  if (visible) {
    loader.classList.remove('hidden');
    if (txt) txt.textContent = texto;
  } else {
    loader.classList.add('hidden');
  }
}

function mostrarError(mensaje, duracion = 3000) {
  const toast = document.getElementById('toast-error');
  if (!toast) return;
  
  toast.textContent = mensaje;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, duracion);
}

function mostrarExito(mensaje, duracion = 3000) {
  const toast = document.getElementById('toast-error');
  if (!toast) return;
  
  const toastExito = document.createElement('div');
  toastExito.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #27AE60, #229954);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    z-index: 9998;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    animation: slideUp 0.3s ease-out;
  `;
  toastExito.textContent = mensaje;
  
  document.body.appendChild(toastExito);
  
  setTimeout(() => {
    toastExito.style.animation = 'slideDown 0.3s ease-out';
    setTimeout(() => toastExito.remove(), 300);
  }, duracion);
}

// Inyectar keyframes para animaciones de toast
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translate(-50%, 100px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
  
  @keyframes slideDown {
    to {
      opacity: 0;
      transform: translate(-50%, 100px);
    }
  }
`;
document.head.appendChild(style);
