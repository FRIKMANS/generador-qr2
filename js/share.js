// ========== MÓDULO DE COMPARTIR ==========
class ShareManager {
  constructor() {
    this.enlaceGenerado = '';
    this.qrInstance = null;
    this.isPanelVisible = false;
    
    this.init();
  }
  
  init() {
    this.createNotification();
    this.createSharePanel();
    this.setupEventListeners();
    
    // Sobrescribir funciones globales
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
        <h3>Compartir Cotización</h3>
        
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
      </div>
    `;
    
    const container = document.getElementById('sharePanelContainer');
    if (container) {
      container.innerHTML = panelHTML;
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
  
  // Compartir por WhatsApp
  shareWhatsApp() {
    if (!this.enlaceGenerado) return;
    
    const nombre = document.getElementById('nombre')?.value || '';
    const movimiento = document.getElementById('movimiento')?.value || '';
    const vehiculo = document.getElementById('vehiculo')?.value || '';
    const costo = document.getElementById('costo')?.value || '';
    
    const message = `Muestra este código al llegar\n` +
                   `${this.enlaceGenerado}`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    this.showNotification('WhatsApp abierto para compartir');
  }
  
  // Compartir por correo
  shareEmail() {
    if (!this.enlaceGenerado) return;
    
    const nombre = document.getElementById('nombre')?.value || '';
    const movimiento = document.getElementById('movimiento')?.value || '';
    const vehiculo = document.getElementById('vehiculo')?.value || '';
    const costo = document.getElementById('costo')?.value || '';
    
    const subject = `Cotización: ${movimiento} - ${vehiculo}`;
    const body = `COTIZACIÓN DE SERVICIO\n\n` +
                `Vendedor: ${nombre}\n` +
                `Tipo de movimiento: ${movimiento}\n` +
                `Vehículo: ${vehiculo}\n` +
                `Costo: $${costo}\n\n` +
                `Para registrar esta cotización, accede al siguiente enlace:\n` +
                `${this.enlaceGenerado}\n\n` +
                `O escanea el código QR adjunto.`;
    
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
    this.showNotification('Cliente de correo abierto');
  }
  
  // Compartir por Telegram
  shareTelegram() {
    if (!this.enlaceGenerado) return;
    
    const nombre = document.getElementById('nombre')?.value || '';
    const movimiento = document.getElementById('movimiento')?.value || '';
    const vehiculo = document.getElementById('vehiculo')?.value || '';
    const costo = document.getElementById('costo')?.value || '';
    
    const message = `Enlace para registrar: ${this.enlaceGenerado}`;
    
    const url = `https://t.me/share/url?url=${encodeURIComponent(this.enlaceGenerado)}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    this.showNotification('Telegram abierto para compartir');
  }
  
  // Compartir por SMS
  shareSMS() {
    if (!this.enlaceGenerado) return;
    
    const nombre = document.getElementById('nombre')?.value || '';
    const movimiento = document.getElementById('movimiento')?.value || '';
    const vehiculo = document.getElementById('vehiculo')?.value || '';
    const costo = document.getElementById('costo')?.value || '';
    
    const message = `COTIZACIÓN:\nVendedor: ${nombre}\nMovimiento: ${movimiento}\nVehículo: ${vehiculo}\nCosto: $${costo}\n\nRegistrar: ${this.enlaceGenerado}`;
    
    // Para dispositivos móviles
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = `sms:?body=${encodeURIComponent(message)}`;
    } else {
      // Para escritorio
      const url = `sms:?body=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
    
    this.showNotification('Preparado para enviar SMS');
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
  downloadQR() {
    if (!this.qrInstance) {
      this.showNotification('Primero genera un QR', 'error');
      return;
    }
    
    const nombre = document.getElementById('nombre')?.value?.replace(/\s+/g, '_') || 'Vendedor';
    const movimiento = document.getElementById('movimiento')?.value?.replace(/\s+/g, '_') || 'Movimiento';
    const vehiculo = document.getElementById('vehiculo')?.value?.replace(/\s+/g, '_') || 'Vehiculo';
    
    const filename = `QR_Cotizacion_${nombre}_${movimiento}_${vehiculo}.png`;
    
    this.qrInstance.download({
      name: filename,
      extension: "png"
    }).then(() => {
      this.showNotification('QR descargado correctamente');
    }).catch(error => {
      console.error('Error al descargar:', error);
      this.showNotification('Error al descargar', 'error');
    });
  }
  
  // Actualizar enlace generado
  updateGeneratedLink(link) {
    this.enlaceGenerado = link;
  }
  
  // Actualizar instancia QR
  updateQRInstance(qr) {
    this.qrInstance = qr;
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
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.shareManager = new ShareManager();
});