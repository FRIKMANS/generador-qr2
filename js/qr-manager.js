// ======================================================
// qr-manager.js
// QR Manager — sistema robusto para generar códigos QR
// Incluye método universal getBlob() con múltiples fallbacks
// ======================================================

class QRManager {
  constructor() {
    this.qr = null;
    this.lastData = null;
  }

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

  generateQR(data) {
    try {
      console.log('[QRManager] Generando QR con datos:', data);
      const url = this.buildURL(data);
      this.lastData = data;

      // Crear nueva instancia (reemplaza la anterior)
      this.qr = new QRCodeStyling(this.createQRConfig(url));
      console.log('[QRManager] Instancia QR creada');
      return this.qr;
    } catch (error) {
      console.error('[QRManager] Error creando QR:', error);
      throw error;
    }
  }

  renderQR(containerId) {
    try {
      console.log('[QRManager] Renderizando QR en contenedor:', containerId);
      const container = document.getElementById(containerId);
      if (!container) throw new Error("Contenedor no encontrado: " + containerId);
      container.innerHTML = '';
      this.qr.append(container);
      console.log('[QRManager] QR renderizado correctamente');
    } catch (err) {
      console.error('[QRManager] renderQR error:', err);
      throw err;
    }
  }

  getQRInstance() {
    return this.qr;
  }

  // Método universal para obtener un Blob PNG del QR
  async getBlob() {
    if (!this.qr) {
      throw new Error('QR no generado todavía');
    }

    console.log('[QRManager] Obteniendo Blob del QR (universal)...');

    // 1) Intentar getBlob (API moderna)
    try {
      if (typeof this.qr.getBlob === 'function') {
        const blob = await this.qr.getBlob();
        if (blob instanceof Blob) {
          console.log('[QRManager] getBlob() funcionó');
          return blob;
        }
      }
    } catch (err) {
      console.warn('[QRManager] getBlob() falló:', err);
    }

    // 2) Intentar getRawData (algunas versiones antiguas)
    try {
      if (typeof this.qr.getRawData === 'function') {
        const raw = await this.qr.getRawData('png');
        if (raw instanceof Blob) {
          console.log('[QRManager] getRawData() devolvió Blob');
          return raw;
        } else if (typeof raw === 'string' && raw.startsWith('data:')) {
          // es dataURL
          const res = await fetch(raw);
          const blob = await res.blob();
          console.log('[QRManager] getRawData() devolvió dataURL -> transformado a Blob');
          return blob;
        }
      }
    } catch (err) {
      console.warn('[QRManager] getRawData() falló:', err);
    }

    // 3) Intentar getImage (base64/dataURL)
    try {
      if (typeof this.qr.getImage === 'function') {
        const imgData = await this.qr.getImage();
        if (typeof imgData === 'string' && imgData.startsWith('data:')) {
          const res = await fetch(imgData);
          const blob = await res.blob();
          console.log('[QRManager] getImage() -> dataURL -> transformado a Blob');
          return blob;
        }
      }
    } catch (err) {
      console.warn('[QRManager] getImage() falló:', err);
    }

    // 4) Intentar getCanvas() y canvas.toBlob
    try {
      if (typeof this.qr.getCanvas === 'function') {
        const canvas = await this.qr.getCanvas();
        if (canvas && typeof canvas.toBlob === 'function') {
          const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
          if (blob) {
            console.log('[QRManager] getCanvas() -> canvas.toBlob() funcionó');
            return blob;
          }
        }
      }
    } catch (err) {
      console.warn('[QRManager] getCanvas() falló:', err);
    }

    // 5) As último recurso intentar extraer la etiqueta img dentro del contenedor
    try {
      const container = document.querySelector('#qrContainer');
      if (container) {
        const img = container.querySelector('img');
        if (img && img.src && img.src.startsWith('data:')) {
          const res = await fetch(img.src);
          const blob = await res.blob();
          console.log('[QRManager] Extraído dataURL desde <img> del contenedor -> Blob');
          return blob;
        }
      }
    } catch (err) {
      console.warn('[QRManager] Fallback extraer <img> falló:', err);
    }

    throw new Error('No se pudo obtener Blob del QR con ninguno de los métodos disponibles');
  }
}

// Registrar globalmente
window.qrManager = window.qrManager || new QRManager();
console.log('[QRManager] Inicializado y expuesto en window.qrManager');
