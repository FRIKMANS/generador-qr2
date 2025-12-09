// ========== MÓDULO DE COMPARTIR PARA DISPOSITIVOS MÓVILES ==========
// Este archivo extiende la funcionalidad de share.js para móviles

class MobileShareManager {
  constructor(shareManager) {
    this.shareManager = shareManager;
    this.isMobile = this.checkIfMobile();
    this.supportsNativeShare = this.checkNativeShareSupport();
    this.qrFile = null;
    this.qrBlob = null;
    
    if (this.isMobile) {
      this.init();
    }
  }
  
  // Detectar si es dispositivo móvil
  checkIfMobile() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  // Verificar soporte para Web Share API con archivos
  checkNativeShareSupport() {
    return navigator.share && navigator.canShare;
  }
  
  // Inicializar funcionalidades móviles
  init() {
    this.setupMobileUI();
    this.enhanceSharePanel();
    this.setupMobileEventListeners();
    
    console.log('MobileShareManager inicializado', {
      isMobile: this.isMobile,
      supportsNativeShare: this.supportsNativeShare,
      userAgent: navigator.userAgent
    });
  }
  
  // Configurar UI específica para móviles
  setupMobileUI() {
    // Agregar indicador de móvil (solo en desarrollo)
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('github.io')) {
      this.addMobileIndicator();
    }
    
    // Mejorar botones para toques
    this.enhanceTouchTargets();
  }
  
  // Mejorar el panel de compartir para móviles
  enhanceSharePanel() {
    const sharePanel = document.getElementById('sharePanel');
    if (!sharePanel) return;
    
    // Agregar sección móvil al panel
    this.addMobileSectionToPanel(sharePanel);
    
    // Modificar botones existentes para móviles
    this.modifyExistingButtons();
  }
  
  // Agregar sección móvil al panel de compartir
  addMobileSectionToPanel(panel) {
    const mobileSection = document.createElement('div');
    mobileSection.className = 'mobile-share-section';
    mobileSection.innerHTML = `
      <div class="mobile-share-header">
        <i class="fas fa-mobile-alt"></i>
        <h4>Compartir en Móvil</h4>
      </div>
      
      <div class="mobile-share-options">
        ${this.supportsNativeShare ? `
          <button class="mobile-share-btn native-share-btn" onclick="mobileShareManager.shareWithNativePicker()">
            <i class="fas fa-share-alt"></i>
            <span>Compartir con Apps</span>
            <small>Abre el selector de aplicaciones</small>
          </button>
        ` : ''}
        
        <button class="mobile-share-btn download-share-btn" onclick="mobileShareManager.downloadAndShare()">
          <i class="fas fa-download"></i>
          <span>Descargar y Compartir</span>
          <small>Descarga la imagen para compartir</small>
        </button>
        
        <button class="mobile-share-btn whatsapp-mobile-btn" onclick="mobileShareManager.shareToWhatsAppMobile()">
          <i class="fab fa-whatsapp"></i>
          <span>WhatsApp Directo</span>
          <small>Envía directamente a WhatsApp</small>
        </button>
      </div>
      
      <div class="mobile-tips">
        <p><strong>Tips para móvil:</strong></p>
        <ul>
          <li>Presiona prolongadamente la imagen para guardarla</li>
          <li>Comparte desde tu galería de fotos</li>
          <li>WhatsApp acepta imágenes PNG</li>
        </ul>
      </div>
    `;
    
    // Insertar después del título
    const title = panel.querySelector('h3');
    if (title) {
      title.parentNode.insertBefore(mobileSection, title.nextSibling);
    }
  }
  
  // Modificar botones existentes para mejor experiencia móvil
  modifyExistingButtons() {
    // Hacer que todos los botones de compartir sean más grandes en móviles
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(btn => {
      btn.style.minHeight = '44px'; // Tamaño mínimo para toques
      btn.style.padding = '12px 8px';
    });
    
    // Agregar feedback táctil
    this.addTouchFeedback();
  }
  
  // Agregar feedback visual para toques
  addTouchFeedback() {
    document.addEventListener('touchstart', function(e) {
      if (e.target.closest('.share-btn, .mobile-share-btn, button')) {
        e.target.style.transform = 'scale(0.98)';
      }
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
      if (e.target.closest('.share-btn, .mobile-share-btn, button')) {
        e.target.style.transform = 'scale(1)';
      }
    }, { passive: true });
  }
  
  // Mejorar targets de toque
  enhanceTouchTargets() {
    // Asegurar que todos los inputs sean fácilmente tocables
    const inputs = document.querySelectorAll('input, select, button');
    inputs.forEach(el => {
      el.style.minHeight = '44px';
      el.style.fontSize = '16px'; // Previene zoom en iOS
    });
  }
  
  // Agregar indicador de móvil (solo para debug)
  addMobileIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'mobile-indicator';
    indicator.innerHTML = `
      <span>📱 ${this.isMobile ? 'Móvil' : 'Escritorio'}</span>
      ${this.supportsNativeShare ? '<span class="native-share-badge">✓ API Nativa</span>' : ''}
    `;
    indicator.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 5px 10px;
      border-radius: 15px;
      font-size: 11px;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    
    const nativeBadge = indicator.querySelector('.native-share-badge');
    if (nativeBadge) {
      nativeBadge.style.cssText = `
        background: #4CAF50;
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 9px;
      `;
    }
    
    document.body.appendChild(indicator);
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
      indicator.style.opacity = '0.5';
    }, 5000);
  }
  
  // Configurar event listeners para móviles
  setupMobileEventListeners() {
    // Prevenir zoom no deseado en iOS
    document.addEventListener('touchstart', function(e) {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });
    
    // Mejorar scroll en móviles
    this.improveMobileScroll();
    
    // Detectar orientación del dispositivo
    window.addEventListener('orientationchange', () => {
      this.handleOrientationChange();
    });
  }
  
  // Mejorar experiencia de scroll en móviles
  improveMobileScroll() {
    // Prevenir scroll no deseado
    document.body.style.overscrollBehavior = 'none';
    
    // Mejorar toques en inputs
    document.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('touchstart', (e) => {
        e.stopPropagation();
      });
    });
  }
  
  // Manejar cambio de orientación
  handleOrientationChange() {
    console.log('Orientación cambiada:', screen.orientation.type);
    
    // Ajustar UI si es necesario
    setTimeout(() => {
      if (window.shareManager && window.shareManager.isPanelVisible) {
        // Re-posicionar panel si está visible
        const panel = document.getElementById('sharePanel');
        if (panel) {
          panel.style.marginTop = '20px';
        }
      }
    }, 300);
  }
  
  // ========== FUNCIONALIDADES DE COMPARTIR EN MÓVILES ==========
  
  // Capturar el QR como archivo para compartir
  async captureQRAsFile() {
    try {
      if (!this.shareManager || !this.shareManager.qrInstance) {
        throw new Error('No hay QR generado');
      }
      
      // Mostrar estado de carga
      this.showMobileLoading('Capturando QR...');
      
      // Usar el método de la instancia QR para obtener el blob
      const blob = await this.shareManager.qrInstance.getRawData('png');
      
      if (!blob) {
        throw new Error('No se pudo generar la imagen del QR');
      }
      
      // Crear archivo con nombre descriptivo
      const info = this.getQuoteInfo();
      const filename = `QR_Cotizacion_${info.nombre}_${info.movimiento}.png`
        .replace(/\s+/g, '_')
        .replace(/[^\w\-.]/g, '');
      
      this.qrFile = new File([blob], filename, { type: 'image/png' });
      this.qrBlob = blob;
      
      console.log('QR capturado como archivo:', {
        filename,
        size: blob.size,
        type: blob.type
      });
      
      return this.qrFile;
      
    } catch (error) {
      console.error('Error capturando QR:', error);
      throw error;
    } finally {
      this.hideMobileLoading();
    }
  }
  
  // Compartir usando el selector nativo de apps
  async shareWithNativePicker() {
    try {
      if (!this.supportsNativeShare) {
        this.showMobileAlert('Tu navegador no soporta compartir nativo');
        return;
      }
      
      const qrFile = await this.captureQRAsFile();
      const info = this.getQuoteInfo();
      
      // Verificar si se pueden compartir archivos
      const canShareFiles = navigator.canShare && navigator.canShare({ files: [qrFile] });
      
      if (!canShareFiles) {
        // Fallback a compartir solo texto
        return this.shareTextOnly(info);
      }
      
      // Preparar datos para compartir
      const shareData = {
        title: `Cotización: ${info.movimiento} - ${info.vehiculo}`,
        text: this.generateMobileShareText(info, true),
        files: [qrFile]
      };
      
      // Agregar URL si está disponible
      if (this.shareManager.enlaceGenerado) {
        shareData.url = this.shareManager.enlaceGenerado;
      }
      
      console.log('Intentando compartir nativo:', shareData);
      
      // Intentar compartir
      await navigator.share(shareData);
      
      console.log('Compartido exitosamente');
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error compartiendo:', error);
        
        // Fallback según el tipo de error
        if (error.message.includes('Permission') || error.message.includes('not allowed')) {
          this.showMobileAlert('Permiso denegado. Intenta descargar la imagen primero.');
        } else {
          this.downloadAndShare();
        }
      }
    }
  }
  
  // Generar texto para compartir en móviles
  generateMobileShareText(info, includeLink = false) {
    let text = `COTIZACIÓN DE SERVICIO\n\n`;
    
    if (includeLink && this.shareManager.enlaceGenerado) {
      text += `🔗 Enlace para registrar:\n${this.shareManager.enlaceGenerado}\n\n`;
    }
    
    text += `Presenta este código en mostrador para registrar tu cotización.\n\n`;
    
    return text;
  }
  
  // Compartir solo texto (fallback)
  async shareTextOnly(info) {
    try {
      const shareData = {
        title: 'Cotización de Servicio',
        text: this.generateMobileShareText(info, true)
      };
      
      await navigator.share(shareData);
    } catch (error) {
      console.error('Error compartiendo texto:', error);
      this.showMobileAlert('No se pudo compartir. Copia el enlace manualmente.');
    }
  }
  
  // Descargar y luego compartir (fallback robusto)
  async downloadAndShare() {
    try {
      const qrFile = await this.captureQRAsFile();
      const info = this.getQuoteInfo();
      
      // Crear URL para el blob
      const blobUrl = URL.createObjectURL(this.qrBlob);
      
      // Crear enlace de descarga
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = qrFile.name;
      downloadLink.style.display = 'none';
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Mostrar instrucciones
      this.showMobileInstructions(info, blobUrl);
      
      // Limpiar URL después de un tiempo
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 30000);
      
    } catch (error) {
      console.error('Error en downloadAndShare:', error);
      this.showMobileAlert('Error al procesar la imagen. Intenta de nuevo.');
    }
  }
  
  // Mostrar instrucciones después de descargar
  showMobileInstructions(info, blobUrl) {
    const instructions = `
      <div class="mobile-instructions-overlay">
        <div class="mobile-instructions-content">
          <h3><i class="fas fa-check-circle"></i> Imagen Descargada</h3>
          <p>La imagen del QR se ha descargado a tu dispositivo.</p>
          
          <div class="instruction-steps">
            <div class="step">
              <span class="step-number">1</span>
              <p>Abre tu galería de fotos</p>
            </div>
            <div class="step">
              <span class="step-number">2</span>
              <p>Encuentra la imagen "QR_Cotizacion_..."</p>
            </div>
            <div class="step">
              <span class="step-number">3</span>
              <p>Compártela desde allí</p>
            </div>
          </div>
          
          <div class="quick-actions">
            <button onclick="mobileShareManager.previewImage('${blobUrl}')">
              <i class="fas fa-eye"></i> Ver Imagen
            </button>
            <button onclick="mobileShareManager.copyShareText()">
              <i class="fas fa-copy"></i> Copiar Texto
            </button>
          </div>
          
          <button class="close-instructions" onclick="mobileShareManager.closeInstructions()">
            Entendido
          </button>
        </div>
      </div>
    `;
    
    // Remover instrucciones anteriores si existen
    this.closeInstructions();
    
    // Agregar nuevas instrucciones
    const overlay = document.createElement('div');
    overlay.innerHTML = instructions;
    overlay.id = 'mobileInstructions';
    document.body.appendChild(overlay.firstElementChild);
    
    // Agregar estilos si no existen
    this.addInstructionsStyles();
  }
  
  // Previsualizar imagen
  previewImage(blobUrl) {
    const previewWindow = window.open(blobUrl, '_blank');
    if (!previewWindow) {
      this.showMobileAlert('Permite ventanas emergentes para previsualizar');
    }
  }
  
  // Copiar texto para compartir
  copyShareText() {
    const info = this.getQuoteInfo();
    const text = this.generateMobileShareText(info, true);
    
    navigator.clipboard.writeText(text)
      .then(() => {
        this.showMobileToast('Texto copiado al portapapeles');
      })
      .catch(err => {
        console.error('Error copiando texto:', err);
      });
  }
  
  // Cerrar instrucciones
  closeInstructions() {
    const existing = document.getElementById('mobileInstructions');
    if (existing) {
      existing.remove();
    }
  }
  
  // Compartir directamente a WhatsApp (móvil)
  async shareToWhatsAppMobile() {
    try {
      const info = this.getQuoteInfo();
      const text = this.generateMobileShareText(info, true);
      
      // Para Android
      if (/Android/i.test(navigator.userAgent)) {
        window.open(`whatsapp://send?text=${encodeURIComponent(text)}`, '_blank');
      }
      // Para iOS
      else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
      } else {
        // Para otros dispositivos
        window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
      }
      
    } catch (error) {
      console.error('Error compartiendo a WhatsApp:', error);
      this.showMobileAlert('No se pudo abrir WhatsApp. Asegúrate de tenerlo instalado.');
    }
  }
  
  // Agregar estilos para las instrucciones
  addInstructionsStyles() {
    if (document.getElementById('mobileInstructionsStyles')) return;
    
    const styles = `
      .mobile-instructions-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        padding: 20px;
      }
      
      .mobile-instructions-content {
        background: white;
        border-radius: 20px;
        padding: 25px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
      }
      
      .mobile-instructions-content h3 {
        color: var(--morado);
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .instruction-steps {
        margin: 25px 0;
      }
      
      .step {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 10px;
        border-left: 4px solid var(--verde);
      }
      
      .step-number {
        background: var(--morado);
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        margin-right: 15px;
        flex-shrink: 0;
      }
      
      .quick-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin: 20px 0;
      }
      
      .quick-actions button {
        padding: 12px;
        border: none;
        border-radius: 10px;
        background: var(--azul);
        color: white;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
      }
      
      .close-instructions {
        width: 100%;
        padding: 15px;
        background: var(--verde);
        color: white;
        border: none;
        border-radius: 10px;
        font-weight: bold;
        font-size: 16px;
        cursor: pointer;
        margin-top: 10px;
      }
      
      @media (max-width: 480px) {
        .mobile-instructions-content {
          padding: 20px;
          width: 95%;
        }
        
        .quick-actions {
          grid-template-columns: 1fr;
        }
      }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'mobileInstructionsStyles';
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }
  
  // ========== UTILIDADES MÓVILES ==========
  
  // Mostrar loading en móviles
  showMobileLoading(message = 'Procesando...') {
    this.hideMobileLoading(); // Limpiar primero
    
    const loading = document.createElement('div');
    loading.id = 'mobileLoading';
    loading.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      color: white;
    `;
    
    loading.innerHTML = `
      <div class="spinner" style="
        width: 60px;
        height: 60px;
        border: 4px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        border-top-color: var(--verde);
        animation: spin 1s linear infinite;
        margin-bottom: 20px;
      "></div>
      <div style="font-size: 18px; font-weight: bold;">${message}</div>
    `;
    
    // Agregar animación si no existe
    if (!document.getElementById('spinnerAnimation')) {
      const spinStyle = document.createElement('style');
      spinStyle.id = 'spinnerAnimation';
      spinStyle.textContent = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(spinStyle);
    }
    
    document.body.appendChild(loading);
  }
  
  // Ocultar loading
  hideMobileLoading() {
    const loading = document.getElementById('mobileLoading');
    if (loading) {
      loading.remove();
    }
  }
  
  // Mostrar alerta en móviles
  showMobileAlert(message) {
    // Usar alert nativo para móviles
    alert(`📱 ${message}`);
  }
  
  // Mostrar toast (notificación temporal)
  showMobileToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--morado);
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      z-index: 10000;
      font-weight: bold;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      animation: fadeInUp 0.3s ease-out;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Agregar animación si no existe
    if (!document.getElementById('toastAnimation')) {
      const animation = document.createElement('style');
      animation.id = 'toastAnimation';
      animation.textContent = `
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        
        @keyframes fadeOutDown {
          from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          to {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
        }
      `;
      document.head.appendChild(animation);
    }
    
    // Remover después de la duración
    setTimeout(() => {
      toast.style.animation = 'fadeOutDown 0.3s ease-out forwards';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }
  
  // Obtener información de la cotización
  getQuoteInfo() {
    return {
      nombre: document.getElementById('nombre')?.value || '',
      movimiento: document.getElementById('movimiento')?.value || '',
      vehiculo: document.getElementById('vehiculo')?.value || '',
      costo: document.getElementById('costo')?.value || ''
    };
  }
  
  // Limpiar recursos
  cleanup() {
    if (this.qrBlob) {
      this.qrBlob = null;
      this.qrFile = null;
    }
    
    this.closeInstructions();
    this.hideMobileLoading();
    
    // Remover overlay de instrucciones si existe
    const instructions = document.getElementById('mobileInstructions');
    if (instructions) {
      instructions.remove();
    }
  }
}

// Inicializar cuando esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Esperar a que ShareManager se inicialice
  const initMobileShare = () => {
    if (window.shareManager) {
      window.mobileShareManager = new MobileShareManager(window.shareManager);
      console.log('🚀 MobileShareManager inicializado con ShareManager');
    } else {
      // Reintentar después de un tiempo
      setTimeout(initMobileShare, 500);
    }
  };
  
  // Iniciar después de un breve delay
  setTimeout(initMobileShare, 1000);
  
  // Limpiar al cerrar
  window.addEventListener('beforeunload', () => {
    if (window.mobileShareManager) {
      window.mobileShareManager.cleanup();
    }
  });
});

// Exportar funciones globales
window.compartirEnMovil = function() {
  if (window.mobileShareManager) {
    window.mobileShareManager.shareWithNativePicker();
  } else {
    alert('Sistema móvil no cargado. Intenta de nuevo.');
  }
};

window.descargarQRMovil = function() {
  if (window.mobileShareManager) {
    window.mobileShareManager.downloadAndShare();
  }
};