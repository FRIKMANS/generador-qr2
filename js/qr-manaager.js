// ========== GESTOR DE QR ==========

class QRManager {
  constructor() {
    this.qrInstance = null;
    this.qrData = null;
  }
  
  // Generar QR
  generateQR(data) {
    const { nombre, movimiento, vehiculo, costo } = data;
    
    if (!nombre || !movimiento || !vehiculo || !costo) {
      throw new Error('Todos los campos son requeridos');
    }
    
    const baseURL = "https://frikmans.github.io/generador-qr2/formulario-datos.html";
    const enlace = `${baseURL}?nombre=${encodeURIComponent(nombre)}&movimiento=${encodeURIComponent(movimiento)}&vehiculo=${encodeURIComponent(vehiculo)}&costo=${encodeURIComponent(costo)}&token=U2VydmljaW9QYXJhUGF0eQ==`;
    
    this.qrData = {
      enlace,
      nombre,
      movimiento,
      vehiculo,
      costo
    };
    
    return this.createQRInstance(enlace);
  }
  
  // Crear instancia de QR
  createQRInstance(enlace) {
    try {
      this.qrInstance = new QRCodeStyling({
        width: 260,
        height: 260,
        data: enlace,
        image: "img/logo.jpg",
        dotsOptions: {
          color: "#733298",
          type: "rounded"
        },
        backgroundOptions: {
          color: "#ffffff"
        },
        cornersSquareOptions: {
          color: "#44ABA8",
          type: "extra-rounded"
        },
        cornersDotOptions: {
          color: "#733298"
        }
      });
      
      return this.qrInstance;
    } catch (error) {
      console.error("Error al crear QR:", error);
      throw error;
    }
  }
  
  // Renderizar QR en contenedor
  renderQR(containerId) {
    if (!this.qrInstance) {
      throw new Error('Primero genera el QR');
    }
    
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Contenedor ${containerId} no encontrado`);
    }
    
    container.innerHTML = '';
    this.qrInstance.append(container);
    
    // Mostrar tarjeta QR
    const qrCard = document.getElementById('qrCard');
    if (qrCard) {
      qrCard.style.display = 'block';
    }
    
    // Guardar en ventana global
    window.qr = this.qrInstance;
    
    return this.qrData.enlace;
  }
  
  // Descargar QR
  downloadQR(filename = null) {
    if (!this.qrInstance) {
      throw new Error('Primero genera el QR');
    }
    
    const nombre = this.qrData?.nombre?.replace(/\s+/g, '_') || 'Vendedor';
    const movimiento = this.qrData?.movimiento?.replace(/\s+/g, '_') || 'Movimiento';
    const vehiculo = this.qrData?.vehiculo?.replace(/\s+/g, '_') || 'Vehiculo';
    
    const finalFilename = filename || `QR_Cotizacion_${nombre}_${movimiento}_${vehiculo}.png`;
    
    return this.qrInstance.download({
      name: finalFilename,
      extension: "png"
    });
  }
  
  // Obtener datos del QR
  getQRData() {
    return this.qrData;
  }
  
  // Obtener instancia QR
  getQRInstance() {
    return this.qrInstance;
  }
}

// Inicializar cuando esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.qrManager = new QRManager();
});
