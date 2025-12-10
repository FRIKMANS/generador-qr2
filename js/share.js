// ========== MÓDULO DE COMPARTIR CON IMAGEN ==========
class ShareManager {
  constructor() {
    this.enlaceGenerado = '';
    this.qrInstance = null;
    this.isPanelVisible = false;
    this.qrImageUrl = null;
    this.qrBlob = null;

    this.init();
  }

  init() {
    this.createNotification();
    this.createSharePanel();
    this.setupEventListeners();
    this.overrideGlobalFunctions();
  }

  createNotification() {
    if (!document.getElementById('notification')) {
      const notification = document.createElement('div');
      notification.id = 'notification';
      notification.className = 'notification';
      document.body.appendChild(notification);
    }
  }

  showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;

    notification.textContent = message;
    notification.className = 'notification';

    if (type === 'error') {
      notification.classList.add('error');
    } else if (type === 'info') {
      notification.classList.add('info');
    }

    notification.style.display = 'block';

    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }

  createSharePanel() {
    const panelHTML = `
      <div class="share-panel" id="sharePanel" style="display:none;">
        <button class="close-share" onclick="shareManager.hideSharePanel()">
          <i class="fas fa-times"></i>
        </button>
        <h3>📤 Compartir Cotización</h3>

        <div class="share-options">
          <div class="share-option">
            <input type="radio" id="shareLink" name="shareType" value="link" checked>
            <label for="shareLink">
              <i class="fas fa-link"></i>
              <span>Compartir enlace</span>
              <small>Solo el enlace de la cotización</small>
            </label>
          </div>

          <div class="share-option">
            <input type="radio" id="shareImage" name="shareType" value="image">
            <label for="shareImage">
              <i class="fas fa-image"></i>
              <span>Compartir imagen QR</span>
              <small>Envía la imagen del código QR</small>
            </label>
          </div>

          <div class="share-option">
            <input type="radio" id="shareBoth" name="shareType" value="both">
            <label for="shareBoth">
              <i class="fas fa-images"></i>
              <span>Enlace + Imagen QR</span>
              <small>Envía ambos (solo correo o Web Share)</small>
            </label>
          </div>
        </div>

        <div class="share-buttons">
          <button class="share-btn whatsapp" onclick="shareManager.shareWhatsApp()">
            <i class="fab fa-whatsapp"></i>
            <span>WhatsApp</span>
          </button>

          <button class="share-btn email" onclick="shareManager.shareEmail()">
            <i class="fas fa-envelope"></i>
            <span>Correo</span>
          </button>

          <button class="share-btn telegram" onclick="shareManager.shareTelegram()">
            <i class="fab fa-telegram"></i>
            <span>Telegram</span>
          </button>

          <button class="share-btn sms" onclick="shareManager.shareSMS()">
            <i class="fas fa-sms"></i>
            <span>SMS</span>
          </button>

          <button class="share-btn copy" onclick="shareManager.copyLink()">
            <i class="fas fa-copy"></i>
            <span>Copiar</span>
          </button>

          <button class="share-btn download" onclick="shareManager.downloadQR()">
            <i class="fas fa-download"></i>
            <span>Descargar</span>
          </button>
        </div>

        <div class="share-link">
          <input type="text" id="shareLinkInput" readonly placeholder="Enlace de la cotización">
          <button onclick="shareManager.copyLinkInput()">
            <i class="fas fa-copy"></i>
          </button>
        </div>

        <div class="qr-preview" id="qrPreview">
          <p><strong>Vista previa del QR:</strong></p>
          <img id="qrPreviewImage" src="" alt="QR Code Preview" style="max-width: 150px; display: none;">
          <p id="qrPreviewText" style="font-size: 12px; color: #666; margin-top: 5px;">
            La imagen del QR se generará al compartir
          </p>
        </div>
      </div>
    `;

    const container = document.getElementById('sharePanelContainer');
    if (container) {
      container.innerHTML = panelHTML;
    }
  }

  getShareType() {
    const selected = document.querySelector('input[name="shareType"]:checked');
    return selected ? selected.value : 'link';
  }

  async generateQRBlob() {
    if (!this.qrInstance) {
      throw new Error('No hay instancia de QR disponible');
    }

    try {
      const blob = await this.qrInstance.getRawData('png');
      this.qrBlob = blob;
      this.qrImageUrl = URL.createObjectURL(blob);

      const previewImg = document.getElementById('qrPreviewImage');
      if (previewImg) {
        previewImg.src = this.qrImageUrl;
        previewImg.style.display = 'block';
      }

      return blob;
    } catch (error) {
      console.error('Error generando blob del QR:', error);
      throw error;
    }
  }

  getQuoteInfo() {
    const nombre = document.getElementById('nombre')?.value || '';
    const movimiento = document.getElementById('movimiento')?.value || '';
    const vehiculo = document.getElementById('vehiculo')?.value || '';
    const costo = document.getElementById('costo')?.value || '';

    return { nombre, movimiento, vehiculo, costo };
  }

  generateShareMessage(includeLink = true) {
    const { nombre, movimiento, vehiculo, costo } = this.getQuoteInfo();

    let message = `*COTIZACIÓN DE SERVICIO*\n\n`;

    if (includeLink && this.enlaceGenerado) {
      message += `🔗 *Presenta este código en mostrador*\n${this.enlaceGenerado}\n\n`;
    }

    message += `_Escanea el código QR para registrar la cotización_`;

    return message;
  }

  async shareWhatsApp() {
    try {
      let shareType = this.getShareType();
      const message = this.generateShareMessage(shareType !== 'image');

      if (shareType === 'image' || shareType === 'both') {
        this.showNotification('WhatsApp (web) solo puede compartir enlaces y texto desde el navegador.', 'info');
        shareType = 'link';
      }

      const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
      this.showNotification('WhatsApp abierto para compartir', 'success');
    } catch (error) {
      console.error('Error compartiendo por WhatsApp:', error);
      this.showNotification('Error al compartir por WhatsApp', 'error');
    }
  }

  async shareEmail() {
    try {
      const shareType = this.getShareType();
      const { nombre, movimiento, vehiculo, costo } = this.getQuoteInfo();

      const subject = `Cotización: ${movimiento} - ${vehiculo}`;
      let body = `COTIZACIÓN DE SERVICIO\n\n`;
      body += `Vendedor: ${nombre}\n`;
      body += `Tipo de movimiento: ${movimiento}\n`;
      body += `Vehículo: ${vehiculo}\n`;
      body += `Costo: $${costo}\n\n`;

      if (shareType !== 'image' && this.enlaceGenerado) {
        body += `Para registrar esta cotización, accede al siguiente enlace:\n`;
        body += `${this.enlaceGenerado}\n\n`;
      }

      body += `Adjunto encontrarás el código QR para escanear (si aplica).\n\nSaludos,\nSistema de Cotizaciones`;

      if (shareType === 'image' || shareType === 'both') {
        // Intentamos generar la imagen, pero sin backend solo mostramos mailto y sugerimos adjuntar manualmente
        try {
          await this.generateQRBlob();
          this.showNotification('Se generó la imagen. Para adjuntarla al correo, descárgala primero.', 'info');
        } catch (err) {
          // no fatal: caemos al mailto
        }
      }

      const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = url;

      this.showNotification('Cliente de correo abierto', 'success');
    } catch (error) {
      console.error('Error compartiendo por correo:', error);
      this.showNotification('Error al intentar enviar correo', 'error');
    }
  }

  async shareTelegram() {
    try {
      let shareType = this.getShareType();
      let message = this.generateShareMessage(shareType !== 'image');

      if (shareType === 'image' || shareType === 'both') {
        this.showNotification('Telegram web no permite adjuntar imágenes automáticamente desde JS. Se compartirá enlace/texto.', 'info');
        shareType = 'link';
      }

      // Construimos la URL con texto y enlace
      const url = `https://t.me/share/url?url=${encodeURIComponent(this.enlaceGenerado)}&text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
      this.showNotification('Telegram abierto para compartir', 'success');
    } catch (error) {
      console.error('Error compartiendo por Telegram:', error);
      this.showNotification('Error al compartir por Telegram', 'error');
    }
  }

  async shareSMS() {
    try {
      let shareType = this.getShareType();

      if (shareType === 'image' || shareType === 'both') {
        this.showNotification('SMS no soporta imágenes. Se compartirá enlace/texto.', 'info');
        shareType = 'link';
      }

      const message = this.generateShareMessage(true);

      // Para dispositivos móviles usar sms con body
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.location.href = `sms:?body=${encodeURIComponent(message)}`;
      } else {
        // En escritorio abrimos nueva ventana con URL sms (puede no funcionar)
        const url = `sms:?body=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
      }

      this.showNotification('Preparado para enviar SMS', 'success');
    } catch (error) {
      console.error('Error compartiendo por SMS:', error);
      this.showNotification('Error al compartir por SMS', 'error');
    }
  }

  async shareImageDirectly() {
    try {
      if (!this.qrInstance) {
        this.showNotification('Primero genera un QR', 'error');
        return;
      }

      await this.generateQRBlob();

      const link = document.createElement('a');
      link.href = this.qrImageUrl;

      const { nombre, movimiento, vehiculo } = this.getQuoteInfo();
      const filename = `QR_Cotizacion_${nombre}_${movimiento}_${vehiculo}.png`
        .replace(/\s+/g, '_')
        .replace(/[^\w\-.]/g, '');

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.showNotification('Imagen del QR lista para compartir/descargar', 'success');
    } catch (error) {
      console.error('Error compartiendo imagen:', error);
      this.showNotification('Error al generar imagen', 'error');
    }
  }

  async shareWithWebShare() {
    try {
      if (!navigator.share) {
        this.showNotification('Tu navegador no soporta compartir nativo', 'error');
        return;
      }

      const shareType = this.getShareType();
      const { nombre, movimiento, vehiculo, costo } = this.getQuoteInfo();

      const shareData = {
        title: `Cotización: ${movimiento} - ${vehiculo}`,
        text: this.generateShareMessage(shareType !== 'image')
      };

      if (shareType === 'image' || shareType === 'both') {
        try {
          await this.generateQRBlob();
          const filename = `QR_Cotizacion_${nombre}_${movimiento}_${vehiculo}.png`
            .replace(/\s+/g, '_')
            .replace(/[^\w\-.]/g, '');

          const file = new File([this.qrBlob], filename, { type: 'image/png' });
          shareData.files = [file];
        } catch (err) {
          // si no se puede generar la imagen, seguimos sin archivos
          console.warn('No se pudo generar archivo para Web Share:', err);
        }
      }

      if (shareType !== 'image' && this.enlaceGenerado) {
        shareData.url = this.enlaceGenerado;
      }

      await navigator.share(shareData);
      this.showNotification('Compartido exitosamente', 'success');
    } catch (error) {
      if (error && error.name === 'AbortError') {
        // usuario canceló, no mostrar error
        return;
      }
      console.error('Error compartiendo:', error);
      this.showNotification('Error al compartir', 'error');
    }
  }

  setupNativeShareButton() {
    const sharePanel = document.getElementById('sharePanel');
    if (sharePanel && navigator.share) {
      // evitar duplicados
      if (!sharePanel.querySelector('.share-btn.native')) {
        const nativeShareBtn = document.createElement('button');
        nativeShareBtn.className = 'share-btn native';
        nativeShareBtn.innerHTML = '<i class="fas fa-share-alt"></i><span>Compartir</span>';
        nativeShareBtn.onclick = () => this.shareWithWebShare();

        const shareButtons = sharePanel.querySelector('.share-buttons');
        if (shareButtons) {
          shareButtons.insertBefore(nativeShareBtn, shareButtons.firstChild);
        }
      }
    }
  }

  showSharePanel() {
    if (!this.enlaceGenerado) {
      this.showNotification('Primero genera un QR', 'error');
      return;
    }

    const panel = document.getElementById('sharePanel');
    const input = document.getElementById('shareLinkInput');

    if (panel && input) {
      panel.style.display = 'block';
      input.value = this.enlaceGenerado;
      this.isPanelVisible = true;

      if (this.qrImageUrl) {
        const previewImg = document.getElementById('qrPreviewImage');
        if (previewImg) {
          previewImg.src = this.qrImageUrl;
          previewImg.style.display = 'block';
        }
      }

      this.setupNativeShareButton();
    }
  }

  hideSharePanel() {
    const panel = document.getElementById('sharePanel');
    if (panel) {
      panel.style.display = 'none';
      this.isPanelVisible = false;
    }
  }

  copyLink() {
    if (!this.enlaceGenerado) {
      this.showNotification('Primero genera un QR', 'error');
      return;
    }

    navigator.clipboard.writeText(this.enlaceGenerado)
      .then(() => {
        this.showNotification('Enlace copiado al portapapeles', 'success');
      })
      .catch(err => {
        const textArea = document.createElement('textarea');
        textArea.value = this.enlaceGenerado;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showNotification('Enlace copiado', 'success');
      });
  }

  copyLinkInput() {
    const input = document.getElementById('shareLinkInput');
    if (!input) return;

    input.select();
    input.setSelectionRange(0, 99999);

    try {
      navigator.clipboard.writeText(input.value)
        .then(() => {
          this.showNotification('Enlace copiado al portapapeles', 'success');
          input.blur();
        })
        .catch(err => {
          document.execCommand('copy');
          this.showNotification('Enlace copiado', 'success');
          input.blur();
        });
    } catch (err) {
      this.showNotification('No se pudo copiar', 'error');
    }
  }

  async downloadQR() {
    try {
      if (!this.qrInstance) {
        this.showNotification('Primero genera un QR', 'error');
        return;
      }

      const { nombre, movimiento, vehiculo } = this.getQuoteInfo();
      const filename = `QR_Cotizacion_${nombre}_${movimiento}_${vehiculo}.png`
        .replace(/\s+/g, '_')
        .replace(/[^\w\-.]/g, '');

      await this.qrInstance.download({
        name: filename,
        extension: "png"
      });

      this.showNotification('QR descargado correctamente', 'success');
    } catch (error) {
      console.error('Error al descargar:', error);
      this.showNotification('Error al descargar', 'error');
    }
  }

  updateGeneratedLink(link) {
    this.enlaceGenerado = link;
  }

  updateQRInstance(qr) {
    this.qrInstance = qr;

    if (this.qrImageUrl) {
      URL.revokeObjectURL(this.qrImageUrl);
      this.qrImageUrl = null;
      this.qrBlob = null;
    }
  }

  setupEventListeners() {
    document.addEventListener('click', (event) => {
      const panel = document.getElementById('sharePanel');
      const shareBtn = document.querySelector('.btn-share');

      if (this.isPanelVisible &&
          panel &&
          !panel.contains(event.target) &&
          !shareBtn?.contains(event.target)) {
        this.hideSharePanel();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isPanelVisible) {
        this.hideSharePanel();
      }
    });

    window.addEventListener('beforeunload', () => {
      if (this.qrImageUrl) {
        URL.revokeObjectURL(this.qrImageUrl);
      }
    });
  }

  overrideGlobalFunctions() {
    // Guardamos referencia al generarQR actual
    const originalGenerarQR = window.generarQR || null;

    // Sobrescribimos generarQR
    window.generarQR = () => {
      // Llamar al original si existe
      if (typeof originalGenerarQR === 'function') {
        try {
          originalGenerarQR();
        } catch (err) {
          console.warn('originalGenerarQR fallo:', err);
        }
      } else {
        // Si no hay original, intentamos ejecutar lógica local mínima
        console.warn('originalGenerarQR no definido al sobrescribir desde ShareManager');
      }

      const nombre = encodeURIComponent(document.getElementById("nombre")?.value || '');
      const movimiento = encodeURIComponent(document.getElementById("movimiento")?.value || '');
      const vehiculo = encodeURIComponent(document.getElementById("vehiculo")?.value || '');
      const costo = encodeURIComponent(document.getElementById("costo")?.value || '');

      const enlace = `https://frikmans.github.io/generador-qr2/formulario-datos.html?nombre=${nombre}&movimiento=${movimiento}&vehiculo=${vehiculo}&costo=${costo}&token=U2VydmljaW9QYXJhUGF0eQ==`;

      if (window.shareManager) {
        window.shareManager.updateGeneratedLink(enlace);

        // Actualizar instancia QR cuando exista
        setTimeout(() => {
          if (window.qr) {
            window.shareManager.updateQRInstance(window.qr);
          }
        }, 150);
      }
    };

    // Sobrescribir copiarEnlace
    const originalCopiarEnlace = window.copiarEnlace || null;
    window.copiarEnlace = function() {
      if (window.shareManager) {
        window.shareManager.copyLink();
      } else if (typeof originalCopiarEnlace === 'function') {
        originalCopiarEnlace();
      } else {
        // fallback ligero
        const enlace = window.location.href;
        navigator.clipboard.writeText(enlace).then(() => {
          alert('Enlace copiado');
        });
      }
    };

    // Funciones del panel
    window.mostrarPanelCompartir = () => {
      if (window.shareManager) {
        window.shareManager.showSharePanel();
      } else {
        alert('Sistema de compartir no disponible.');
      }
    };

    window.ocultarPanelCompartir = () => {
      if (window.shareManager) {
        window.shareManager.hideSharePanel();
      }
    };

    window.descargarQR = () => {
      if (window.shareManager) {
        window.shareManager.downloadQR();
      } else if (window.qr && window.qr.download) {
        // fallback mínimo
        window.qr.download({ name: 'QR', extension: 'png' });
      }
    };

    window.compartirImagenQR = () => {
      if (window.shareManager) {
        window.shareManager.shareImageDirectly();
      }
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.shareManager = new ShareManager();
});
