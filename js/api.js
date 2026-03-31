// ═══════════════════════════════════════════════════════════════
// BELLEZA INTEGRAL — API Functions
// ═══════════════════════════════════════════════════════════════

const API = {
  baseUrl: 'https://script.google.com/macros/s/AKfycbzr1-o8Z9_4tt4ntXKLT9WCBHIULpAl09Eg5ffWBZecy0sK7FhmPbFvIfrtBAbLvPnz/exec', // Replace with your deployed GAS URL

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

  // Get availability for a date and employee (usa el nuevo endpoint)
  async getDisponibilidad(fecha, empleadoId) {
    const res = await fetch(`${this.baseUrl}?action=disponibilidad&fecha=${encodeURIComponent(fecha)}&empleado=${encodeURIComponent(empleadoId)}`);
    return res.json();
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
  },

  // Obtener horas disponibles para una fecha y empleado
  async getDisponibilidadSimplificada(fecha, empleadoId) {
    const res = await fetch(`${this.baseUrl}?action=disponibilidad&fecha=${encodeURIComponent(fecha)}&empleado=${encodeURIComponent(empleadoId)}`);
    return res.json();
  },

  // Crear reserva con JSON (POST)
  async crearReservaJSON(data) {
    // Valores por defecto
    data.servicio = data.servicio || "General";
    data.telefono = data.telefono || "";

    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: "crearReserva",
        data: data
      })
    });

    return res.json();
  },

  // Obtener todas las reservas (dashboard admin)
  async getReservasDashboard() {
    return await this.call('reservas');
  }
};
