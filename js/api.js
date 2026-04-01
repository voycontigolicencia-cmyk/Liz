/* ================================================================
   BARBERÍA PRO — js/api.js
   ⚠️ EDITA ESTAS LÍNEAS antes de subir a GitHub
   ================================================================ */

const API_URL   = 'https://script.google.com/macros/s/AKfycbyDGJL5w7yoqMVF6oez49COZw-e3QHYhAAmNBJ9LSCE2xUApdiEQe2uGvRE7ur2vMLGtw/exec';
const API_TOKEN = 'barberia-pro-2025-secret';

// Logo: sube tu imagen en https://postimg.cc y pega la URL directa aquí
const LOGO_URL       = 'https://lh3.googleusercontent.com/d/1KegXjaRohFEhnPc-FxlaC-sa8esSI3QV';
const NEGOCIO_NOMBRE = 'Belleza Integral';

async function apiGet(accion, params) {
  try {
    const qs  = new URLSearchParams({ accion, ...params }).toString();
    const res = await fetch(`${API_URL}?${qs}`);
    return res.json();
  } catch(e) { return { ok:false, error:e.message }; }
}

async function apiPost(accion, params) {
  try {
    const res = await fetch(API_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body:    JSON.stringify({ accion, ...params })
    });
    return res.json();
  } catch(e) { return { ok:false, error:e.message }; }
}

async function apiAdmin(accion, params) {
  try {
    const res = await fetch(API_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body:    JSON.stringify({ accion, token: API_TOKEN, ...params })
    });
    return res.json();
  } catch(e) { return { ok:false, error:e.message }; }
}

const API = {
  getServicios:      ()             => apiGet('getServicios', {}),
  getEmpleados:      ()             => apiGet('getEmpleados', {}),
  getDisponibilidad: (fecha, srvID) => apiGet('getDisponibilidad', { fecha, servicioID: srvID }),
  crearReserva:      (payload)      => apiPost('crearReserva', { payload }),
  cancelarReserva:   (reservaID)    => apiPost('cancelarReserva', { reservaID, canceladoPor:'cliente' }),
  getDashboard:      ()             => apiAdmin('getDashboard', {}),
  getReservasPorDia: (fecha)        => apiAdmin('getReservasPorDia', { params:{ fecha } }),
  actualizarEstado:  (rID, estado)  => apiAdmin('actualizarEstado', { params:{ reservaID:rID, estado } }),
  cancelarAdmin:     (reservaID)    => apiAdmin('cancelarReserva', { reservaID, canceladoPor:'admin' }),
};
