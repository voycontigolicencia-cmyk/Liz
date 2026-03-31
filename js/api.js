// ═══════════════════════════════════════════════════════════════
// BELLEZA INTEGRAL — API Functions
// ═══════════════════════════════════════════════════════════════

const API = {
  baseUrl: 'https://script.google.com/macros/s/AKfycbx28pbfPBLyfo9BcHz3Vafjrf14R6E3jvGTT-dRgr---1Wr7cCgxiq2d-4nGIsmzjui8w/exec', // Replace with your deployed GAS URL

  async call(action, params = {}) {
    const url = new URL(this.baseUrl);
    url.searchParams.set('accion', action); // Use 'accion' as per backend fix
    Object.keys(params).forEach(key => {
      url.searchParams.set(key, params[key]);
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(params)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Get services
  async getServicios() {
    return await this.call('getServicios');
  },

  // Get config
  async getConfig() {
    return await this.call('getConfig');
  },

  // Get employees
  async getEmpleados() {
    return await this.call('getEmpleados');
  },

  // Get availability for a date and service
  async getDisponibilidad(fecha, servicio) {
    return await this.call('getDisponibilidad', { fecha, servicio });
  },

  // Create reservation
  async crearReserva(datos) {
    return await this.call('crearReserva', {
      nombre: datos.nombre,
      email: datos.email,
      telefono: datos.telefono,
      servicio: datos.servicio,
      empleado: datos.empleado,
      fecha: datos.fecha,
      hora: datos.hora,
      notas: datos.notas
    });
  },

  // Admin functions
  async cancelarReserva(reservaId, token) {
    return await this.call('cancelarReserva', { reservaId, token });
  },

  async reagendarReserva(reservaId, nuevaFecha, nuevaHora, token) {
    return await this.call('reagendarReserva', { reservaId, nuevaFecha, nuevaHora, token });
  },

  async getReservas(token) {
    return await this.call('getReservas', { token });
  },

  async toggleServicio(servicioId, token) {
    return await this.call('toggleServicio', { servicioId, token });
  }
};
