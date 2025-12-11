// ======================================================
// QR Manager — Sistema completo para generar códigos QR
// Compatible con share.js y mobile-share.js
// ======================================================

class QRManager {
  constructor() {
    this.qr = null;
    this.lastData = null;
  }

  // Construir el payload para el QR
  buildURL(data) {
    const baseURL = "https://frikmans.github.io/generador-qr2/formulario-datos.html";
    const params = new URLSearchParams({
      nombre: data.nombre,
      movimiento: data.movimiento,
      vehiculo: data.vehiculo,
      costo: data.costo,
      token: "U2VydmljaW9QYXJhUGF0eQ==" // token original
    });

    return `${baseURL}?${params.toString()}`;
  }

  // Crear configuración visual del QR
  createQRConfig(url) {
    return {
      width: 260,
      height: 260,
      data: url,
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
    };
  }

  // Generar el QR y guardarlo internamente
  generateQR(data) {
    try {
      const url = this.buildURL(data);
      this.lastData = data;

      // limpiar anterior
      this.qr = new QRCodeStyling(this.createQRConfig(url));
      return this.qr;

    } catch (error) {
      console.error("Error creando el QR:", error);
      throw error;
    }
  }

  // Añadir el QR al contenedor HTML
  renderQR(containerId) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error("Contenedor no encontrado");

    container.innerHTML = "";
    this.qr.append(container);
  }

  // Obtener instancia actual del QR
  getQRInstance() {
    return this.qr;
  }

  // Obtener Blob para compartir o descargar
  async getBlob() {
    if (!this.qr) throw new Error("QR no generado todavía");
    return await this.qr.getBlob();
  }
}

// Registrar instancia global
window.qrManager = new QRManager();

