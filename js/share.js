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
  
  // Crear notificación flotante
  createNotification() {
    if (!document.getElementById('notification')) {
      const notification = document.createElement('div');
      notification.id = 'notification';
      notification.className = 'notification';
      document.body.appendChild(notification);
    }
  }
  
  // Mostrar notificación
  showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = 'notification';
    
    if (type === 'error') {
      notification.classList.add('error');
    }
    
    notification.style.display = 'block';
    
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }
  
  // Crear panel de compartir
  createSharePanel() {
    const panelHTML = `
      <div class="share-panel" id="sharePanel">
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
              <small>Envía ambos (solo correo)</small>
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
  
  // Obtener tipo de compartir seleccionado
  getShareType() {
    const selected = document.querySelector('input[name="shareType"]:checked');
    return selected ? selected.value : 'link';
  }
  
  // Generar blob del QR
  async generateQRBlob() {
    if (!this.qrInstance) {
      throw new Error('No hay instancia de QR disponible');
    }
    
    try {
      // Obtener blob del QR
      const blob = await this.qrInstance.getRawData('png');
      this.qrBlob = blob;
      this.qrImageUrl = URL.createObjectURL(blob);
      
      // Mostrar vista previa
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
  
  // Obtener información de la cotización
  getQuoteInfo() {
    const nombre = document.getElementById('nombre')?.value || '';
    const movimiento = document.getElementById('movimiento')?.value || '';
    const vehiculo = document.getElementById('vehiculo')?.value || '';
    const costo = document.getElementById('costo')?.value || '';
    
    return { nombre, movimiento, vehiculo, costo };
  }
  
  // Generar mensaje para compartir
  generateShareMessage(includeLink = true) {
    const { nombre, movimiento, vehiculo, costo } = this.getQuoteInfo();
    
    let message = `*COTIZACIÓN DE SERVICIO*\n\n`;
    
    if (includeLink) {
      message += `🔗 *Presenta este código en mostrador*\n${this.enlaceGenerado}\n\n`;
    }
    
    message += `_Escanea el código QR para registrar la cotización_`;
    
    return message;
  }
  
  // Compartir por WhatsApp
  async shareWhatsApp() {
    try {
      const shareType = this.getShareType();
      const message = this.generateShareMessage(shareType !== 'image');
      
      if (shareType === 'image' || shareType === 'both') {
        // WhatsApp Web no permite compartir imágenes directamente desde JS
        // Solo podemos compartir el enlace
        this.showNotification('WhatsApp solo puede compartir enlaces desde web', 'error');
        shareType = 'link'; // Cambiar a solo enlace
      }
      
      const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
      this.showNotification('WhatsApp abierto para compartir');
      
    } catch (error) {
      console.error('Error compartiendo por WhatsApp:', error);
      this.showNotification('Error al compartir', 'error');
    }
  }
  
  // Compartir por correo (con imagen adjunta)
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
      
      if (shareType !== 'image') {
        body += `Para registrar esta cotización, accede al siguiente enlace:\n`;
        body += `${this.enlaceGenerado}\n\n`;
      }
      
      body += `Adjunto encontrarás el código QR para escanear.\n`;
      body += `Saludos,\nSistema de Cotizaciones`;
      
      if (shareType === 'image' || shareType === 'both') {
        // Para correo necesitamos generar el QR primero
        await this.generateQRBlob();
        
        // Crear un formulario temporal para enviar el correo
        this.showNotification('Para adjuntar imágenes necesita backend', 'info');
        
        // Fallback a solo enlace
        const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = url;
      } else {
        // Solo enlace
        const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = url;
      }
      
      this.showNotification('Cliente de correo abierto');
      
    } catch (error) {
      console.error('Error compartiendo por correo:', error);
      this.showNotification('Error al compartir', 'error');
    }
  }
  
  // Compartir por Telegram
  async shareTelegram() {
    try {
      const shareType = this.getShareType();
      let message = this.generateShareMessage(shareType !== 'image');
      
      if (shareType === 'image' || shareType === 'both') {
        // Telegram Web no permite subir imágenes directamente desde JS
        this.showNotification('Telegram web no permite subir imágenes', 'info');
        
        // Alternativa: Crear un mensaje con vista previa del enlace
        message += `\n\n*Imagen del QR disponible para descargar*`;
      }
      
      const url = `https://t.me/share/url?url=${encodeURIComponent(this.enlaceGenerado)}&text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
      this.showNotification('Telegram abierto para compartir');
      
    } catch (error) {
      console.error('Error compartiendo por Telegram:', error);
      this.showNotification('Error al compartir', 'error');
    }
  }
  
  // Compartir por SMS
  async shareSMS() {
    try {
      const shareType = this.getShareType();
      
      if (shareType === 'image' || shareType === 'both') {
        this.showNotification('SMS no soporta imágenes', 'info');
        shareType = 'link'; // Cambiar a solo enlace
      }
      
      const message = this.generateShareMessage(true);
      
      // Para dispositivos móviles
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.location.href = `sms:?body=${encodeURIComponent(message)}`;
      } else {
        // Para escritorio
        const url = `sms:?body=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
      }
      
      this.showNotification('Preparado para enviar SMS');
      
    } catch (error) {
      console.error('Error compartiendo por SMS:', error);
      this.showNotification('Error al compartir', 'error');
    }
  }
  
  // Compartir imagen del QR directamente
  async shareImageDirectly() {
    try {
      if (!this.qrInstance) {
        this.showNotification('Primero genera un QR', 'error');
        return;
      }
      
      // Generar blob del QR
      await this.generateQRBlob();
      
      // Crear un enlace de descarga
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
      
      this.showNotification('Imagen del QR lista para compartir');
      
    } catch (error) {
      console.error('Error compartiendo imagen:', error);
      this.showNotification('Error al generar imagen', 'error');
    }
  }
  
  // Método para compartir usando Web Share API
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
        // Generar blob del QR
        await this.generateQRBlob();
        
        // Convertir blob a File
        const filename = `QR_Cotizacion_${nombre}_${movimiento}_${vehiculo}.png`
          .replace(/\s+/g, '_')
          .replace(/[^\w\-.]/g, '');
        
        const file = new File([this.qrBlob], filename, { type: 'image/png' });
        shareData.files = [file];
      }
      
      if (shareType !== 'image') {
        shareData.url = this.enlaceGenerado;
      }
      
      await navigator.share(shareData);
      this.showNotification('Compartido exitosamente');
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error compartiendo:', error);
        this.showNotification('Error al compartir', 'error');
      }
    }
  }
  
  // Botón para compartir nativo
  setupNativeShareButton() {
    const sharePanel = document.getElementById('sharePanel');
    if (sharePanel && navigator.share) {
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
  
  // Mostrar panel de compartir
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
      
      // Actualizar vista previa si ya hay imagen
      if (this.qrImageUrl) {
        const previewImg = document.getElementById('qrPreviewImage');
        if (previewImg) {
          previewImg.src = this.qrImageUrl;
          previewImg.style.display = 'block';
        }
      }
      
      // Configurar botón de compartir nativo si está disponible
      this.setupNativeShareButton();
    }
  }
  
  // Ocultar panel de compartir
  hideSharePanel() {
    const panel = document.getElementById('sharePanel');
    if (panel) {
      panel.style.display = 'none';
      this.isPanelVisible = false;
    }
  }
  
  // Copiar enlace al portapapeles
  copyLink() {
    if (!this.enlaceGenerado) {
      this.showNotification('Primero genera un QR', 'error');
      return;
    }
    
    navigator.clipboard.writeText(this.enlaceGenerado)
      .then(() => {
        this.showNotification('Enlace copiado al portapapeles');
      })
      .catch(err => {
        // Método alternativo
        const textArea = document.createElement('textarea');
        textArea.value = this.enlaceGenerado;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showNotification('Enlace copiado');
      });
  }
  
  // Copiar desde el input
  copyLinkInput() {
    const input = document.getElementById('shareLinkInput');
    if (!input) return;
    
    input.select();
    input.setSelectionRange(0, 99999);
    
    try {
      navigator.clipboard.writeText(input.value)
        .then(() => {
          this.showNotification('Enlace copiado al portapapeles');
          input.blur();
        })
        .catch(err => {
          document.execCommand('copy');
          this.showNotification('Enlace copiado');
          input.blur();
        });
    } catch (err) {
      this.showNotification('No se pudo copiar', 'error');
    }
  }
  
  // Descargar QR
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
      
      this.showNotification('QR descargado correctamente');
      
    } catch (error) {
      console.error('Error al descargar:', error);
      this.showNotification('Error al descargar', 'error');
    }
  }
  
  // Actualizar enlace generado
  updateGeneratedLink(link) {
    this.enlaceGenerado = link;
  }
  
  // Actualizar instancia QR
  updateQRInstance(qr) {
    this.qrInstance = qr;
    
    // Limpiar URL anterior si existe
    if (this.qrImageUrl) {
      URL.revokeObjectURL(this.qrImageUrl);
      this.qrImageUrl = null;
      this.qrBlob = null;
    }
  }
  
  // Configurar event listeners
  setupEventListeners() {
    // Cerrar panel al hacer clic fuera
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
    
    // Cerrar con tecla ESC
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isPanelVisible) {
        this.hideSharePanel();
      }
    });
    
    // Limpiar URLs cuando se cierre la página
    window.addEventListener('beforeunload', () => {
      if (this.qrImageUrl) {
        URL.revokeObjectURL(this.qrImageUrl);
      }
    });
  }
  
  // Sobrescribir funciones globales
  overrideGlobalFunctions() {
    // Guardar referencia a función original
    const originalGenerarQR = window.generarQR;
    
    // Sobrescribir generarQR
    window.generarQR = function() {
      originalGenerarQR();
      
      // Actualizar enlace en ShareManager
      const nombre = encodeURIComponent(document.getElementById("nombre").value);
      const movimiento = encodeURIComponent(document.getElementById("movimiento").value);
      const vehiculo = encodeURIComponent(document.getElementById("vehiculo").value);
      const costo = encodeURIComponent(document.getElementById("costo").value);
      
      const enlace = `https://frikmans.github.io/generador-qr2/formulario-datos.html?nombre=${nombre}&movimiento=${movimiento}&vehiculo=${vehiculo}&costo=${costo}&token=U2VydmljaW9QYXJhUGF0eQ==`;
      
      if (window.shareManager) {
        window.shareManager.updateGeneratedLink(enlace);
        
        // Actualizar instancia QR después de un breve delay
        setTimeout(() => {
          if (window.qr) {
            window.shareManager.updateQRInstance(window.qr);
          }
        }, 100);
      }
    };
    
    // Sobrescribir copiarEnlace
    const originalCopiarEnlace = window.copiarEnlace;
    window.copiarEnlace = function() {
      if (window.shareManager) {
        window.shareManager.copyLink();
      } else if (originalCopiarEnlace) {
        originalCopiarEnlace();
      }
    };
    
    // Sobrescribir funciones del panel
    window.mostrarPanelCompartir = () => {
      if (window.shareManager) {
        window.shareManager.showSharePanel();
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
      }
    };
    
    // Nueva función para compartir imagen
    window.compartirImagenQR = () => {
      if (window.shareManager) {
        window.shareManager.shareImageDirectly();
      }
    };
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.shareManager = new ShareManager();
});