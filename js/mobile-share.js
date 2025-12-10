// ========== MÓDULO DE COMPARTIR PARA DISPOSITIVOS MÓVILES (CORREGIDO + WORKAROUND WHATSAPP ANDROID) ==========
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
  
  checkIfMobile() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  checkNativeShareSupport() {
    return Boolean(navigator.share && navigator.canShare);
  }
  
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
  
  setupMobileUI() {
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('github.io')) {
      this.addMobileIndicator();
    }
    this.enhanceTouchTargets();
  }
  
  addMobileIndicator() {
    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.bottom = '8px';
    el.style.right = '8px';
    el.style.padding = '6px 10px';
    el.style.background = '#333';
    el.style.color = '#fff';
    el.style.fontSize = '12px';
    el.style.zIndex = '9999';
    el.textContent = 'Mobile share active';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
  
  enhanceSharePanel() {
    const sharePanel = document.getElementById('sharePanel');
    if (!sharePanel) return;
    
    this.addMobileSectionToPanel(sharePanel);
    this.modifyExistingButtons();
  }
  
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
    `;
    
    const title = panel.querySelector('h3');
    if (title) {
      title.parentNode.insertBefore(mobileSection, title.nextSibling);
    } else {
      panel.appendChild(mobileSection);
    }
  }
  
  modifyExistingButtons() {
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(btn => {
      btn.style.minHeight = '44px';
      btn.style.padding = '12px 8px';
    });
    this.addTouchFeedback();
  }
  
  addTouchFeedback() {
    document.addEventListener('touchstart', function(e) {
      const tgt = e.target.closest('.share-btn, .mobile-share-btn, button');
      if (tgt) tgt.style.transform = 'scale(0.98)';
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
      const tgt = e.target.closest('.share-btn, .mobile-share-btn, button');
      if (tgt) tgt.style.transform = 'scale(1)';
    }, { passive: true });
  }
  
  enhanceTouchTargets() {
    const inputs = document.querySelectorAll('input, select, button');
    inputs.forEach(el => {
      el.style.minHeight = '44px';
      el.style.fontSize = '16px';
    });
  }
  
  setupMobileEventListeners() {
    document.addEventListener('touchstart', function(e) {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });
    
    this.improveMobileScroll();
    
    window.addEventListener('orientationchange', () => {
      this.handleOrientationChange();
    });
  }
  
  improveMobileScroll() {
    try {
      document.body.style.overscrollBehavior = 'none';
      document.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('touchstart', (e) => e.stopPropagation());
      });
    } catch (err) {}
  }
  
  handleOrientationChange() {
    setTimeout(() => {
      if (window.shareManager && window.shareManager.isPanelVisible) {
        const panel = document.getElementById('sharePanel');
        if (panel) {
          panel.style.marginTop = '20px';
        }
      }
    }, 300);
  }
  
  // ========== CORRECCIONES CRÍTICAS: getBlob() y File ==========
  async captureQRAsFile() {
    try {
      if (!this.shareManager || !this.shareManager.qrInstance) {
        throw new Error('No hay QR generado');
      }
      
      this.showMobileLoading('Generando imagen...');
      
      // Usar API correcta del QR library
      const blob = await this.shareManager.qrInstance.getBlob();
      if (!blob) throw new Error('getBlob() devolvió un valor inválido');
      
      const info = this.getQuoteInfo();
      const filename = `QR_Cotizacion_${info.nombre}_${info.movimiento}.png`
        .replace(/\s+/g, '_')
        .replace(/[^\w\-.]/g, '');
      
      this.qrFile = new File([blob], filename, { type: 'image/png' });
      this.qrBlob = blob;
      
      return this.qrFile;
    } catch (error) {
      console.error('Error capturando QR:', error);
      throw error;
    } finally {
      this.hideMobileLoading();
    }
  }
  
  // Intento de compartir con selector nativo (si el navegador lo soporta)
  async shareWithNativePicker() {
    try {
      if (!navigator.share) {
        this.showMobileAlert('Tu navegador no soporta compartir nativo');
        return;
      }
      
      const qrFile = await this.captureQRAsFile();
      const info = this.getQuoteInfo();
      
      const shareData = {
        title: `Cotización: ${info.movimiento} - ${info.vehiculo}`,
        text: this.generateMobileShareText(info, true),
        files: [qrFile]
      };
      
      if (this.shareManager.enlaceGenerado) {
        shareData.url = this.shareManager.enlaceGenerado;
      }
      
      await navigator.share(shareData);
    } catch (error) {
      console.error('Error compartiendo nativo:', error);
      this.showMobileAlert('No se pudo compartir desde el navegador. Se descargará la imagen para compartir manualmente.');
      this.downloadAndShare();
    }
  }
  
  generateMobileShareText(info, includeLink = false) {
    let text = `COTIZACIÓN DE SERVICIO\n\n`;
    
    if (includeLink && this.shareManager.enlaceGenerado) {
      text += `🔗 Enlace para registrar:\n${this.shareManager.enlaceGenerado}\n\n`;
    }
    
    text += `Presenta este código en mostrador para registrar tu cotización.\n\n`;
    
    return text;
  }
  
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
  
  async downloadAndShare() {
    try {
      const qrFile = await this.captureQRAsFile();
      const info = this.getQuoteInfo();
      
      const blobUrl = URL.createObjectURL(this.qrBlob);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = qrFile.name;
      downloadLink.style.display = 'none';
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      this.showMobileInstructions(info, blobUrl);
      
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 30000);
      
    } catch (error) {
      console.error('Error en downloadAndShare:', error);
      this.showMobileAlert('Error al procesar la imagen. Intenta de nuevo.');
    }
  }
  
  previewImage(blobUrl) {
    const previewWindow = window.open(blobUrl, '_blank');
    if (!previewWindow) {
      this.showMobileAlert('Permite ventanas emergentes para previsualizar');
    }
  }
  
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
  
  closeInstructions() {
    const existing = document.getElementById('mobileInstructions');
    if (existing) {
      existing.remove();
    }
  }
  
  // ========== WORKAROUND ESPECIAL: intentar compartir imagen directamente en WhatsApp Android ==========
  // 1) Intentamos usar navigator.share con archivos (si está disponible)
  // 2) Si falla, abrimos una ventana nueva con la imagen y en esa ventana intentamos navigator.share() con file,
  //    lo que en Android Chrome normalmente abre el selector que incluye WhatsApp.
  async shareToWhatsAppAndroidWithImage() {
    try {
      if (!/Android/i.test(navigator.userAgent)) {
        throw new Error('No es Android');
      }
      
      const info = this.getQuoteInfo();
      await this.captureQRAsFile(); // genera this.qrFile y this.qrBlob
      
      // Intento directo usando navigator.share (si soporta archivos)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [this.qrFile] })) {
        await navigator.share({
          title: `Cotización: ${info.movimiento} - ${info.vehiculo}`,
          text: this.generateMobileShareText(info, true),
          files: [this.qrFile],
          url: this.shareManager.enlaceGenerado || undefined
        });
        return;
      }
      
      // Si canShare falla, usamos la ventana intermedia:
      const blobUrl = URL.createObjectURL(this.qrBlob);
      await this.openShareWindowWithBlob(blobUrl, this.qrFile.name, this.generateMobileShareText(info, true), this.shareManager.enlaceGenerado);
      
      // revocar URL principal después de un tiempo
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 30000);
      
    } catch (error) {
      console.error('Error en shareToWhatsAppAndroidWithImage:', error);
      throw error;
    }
  }
  
  // Crea una ventana nueva con HTML que carga la imagen blobUrl y ejecuta navigator.share() desde esa ventana
  // Esto permite que el selector nativo (incluyendo WhatsApp) aparezca desde la ventana hija en Android Chrome.
  openShareWindowWithBlob(blobUrl, filename, text, url = '') {
    return new Promise((resolve, reject) => {
      try {
        const popupHtml = `
<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Compartir imagen</title>
  <style>
    body { margin:0; font-family: Arial, Helvetica, sans-serif; display:flex; flex-direction:column; min-height:100vh; }
    .img-wrap { flex:1; display:flex; align-items:center; justify-content:center; background:#f5f5f5; }
    img { max-width:100%; height:auto; border-radius:8px; margin:16px; box-shadow: 0 6px 18px rgba(0,0,0,0.12); }
    .bar { padding:12px; display:flex; gap:8px; justify-content:center; background:#fff; border-top:1px solid #eee; }
    button { padding:10px 14px; border-radius:8px; border:0; background:#0b8043; color:#fff; font-weight:600; }
    .note { font-size:12px; color:#666; text-align:center; padding:8px 12px; }
  </style>
</head>
<body>
  <div class="img-wrap">
    <img id="theImg" src="${blobUrl}" alt="QR">
  </div>
  <div class="note">Si el botón no funciona, presiona el botón del navegador y elige "Compartir" o guarda la imagen y compártela desde tu galería.</div>
  <div class="bar">
    <button id="shareBtn">Compartir imagen</button>
  </div>

  <script>
    (function() {
      const shareBtn = document.getElementById('shareBtn');
      shareBtn.addEventListener('click', async function() {
        try {
          // Fetch blob desde blobUrl
          const resp = await fetch("${blobUrl}");
          const blob = await resp.blob();
          const file = new File([blob], ${JSON.stringify(filename)}, { type: 'image/png' });

          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              text: ${JSON.stringify(text)},
              url: ${JSON.stringify(url || '')}
            });
            window.close();
          } else {
            // Si no puede compartir archivos, intentamos abrir whatsapp con texto (fallback)
            const waUrl = "https://wa.me/?text=" + encodeURIComponent(${JSON.stringify(text + (url ? "\\n\\n" + url : ""))});
            window.location.href = waUrl;
          }
        } catch (err) {
          console.error('Error en la ventana de compartir:', err);
          // fallback a wa.me
          const waUrl = "https://wa.me/?text=" + encodeURIComponent(${JSON.stringify(text + (url ? "\\n\\n" + url : ""))});
          window.location.href = waUrl;
        }
      });

      // Intentar lanzar share automáticamente (sin interacción):
      (async function tryAutoShare() {
        try {
          const resp = await fetch("${blobUrl}");
          const blob = await resp.blob();
          const file = new File([blob], ${JSON.stringify(filename)}, { type: 'image/png' });
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files:[file], text: ${JSON.stringify(text)}, url: ${JSON.stringify(url || '')} });
            window.close();
          }
        } catch(e) { /* no crítico */ }
      })();
    })();
  </script>
</body>
</html>
        `.trim();

        const popup = window.open('', '_blank', 'noopener,noreferrer');
        if (!popup) return reject(new Error('Bloqueador de ventanas emergentes impide abrir la ventana de compartir'));

        popup.document.open();
        popup.document.write(popupHtml);
        popup.document.close();

        // Observamos la ventana para detectar su cierre y resolver la promesa
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            resolve();
          }
        }, 500);

        // También escuchamos mensajes desde la ventana (no obligatorio)
        window.addEventListener('message', function onMsg(e) {
          if (e.source === popup) {
            if (e.data === 'shared') {
              window.removeEventListener('message', onMsg);
              resolve();
            }
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }
  
  async shareToWhatsAppMobile() {
    try {
      const info = this.getQuoteInfo();
      // Intentamos la mejor experiencia: navigator.share con archivo (Android Chrome)
      if (navigator.share && navigator.canShare) {
        try {
          const qrFile = await this.captureQRAsFile();
          if (navigator.canShare({ files: [qrFile] })) {
            await navigator.share({
              files: [qrFile],
              text: this.generateMobileShareText(info, true),
              title: `Cotización: ${info.movimiento} - ${info.vehiculo}`,
              url: this.shareManager.enlaceGenerado || undefined
            });
            return;
          }
        } catch (err) {
          // continue to fallback
        }
      }
      
      // Fallback: abrir preview y mostrar instrucciones (descarga + compartir manual)
      const qrFile = await this.captureQRAsFile();
      const blobUrl = URL.createObjectURL(this.qrBlob);
      this.showMobileInstructions(info, blobUrl);
      
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 30000);
      
    } catch (error) {
      console.error('Error compartiendo a WhatsApp (mobile):', error);
      this.showMobileAlert('No se pudo abrir WhatsApp. Asegúrate de tenerlo instalado o descarga la imagen y compártela desde galería.');
    }
  }
  
  // UTILIDADES
  showMobileLoading(message = 'Procesando...') {
    this.hideMobileLoading();
    
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
  
  hideMobileLoading() {
    const loading = document.getElementById('mobileLoading');
    if (loading) {
      loading.remove();
    }
  }
  
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
    
    setTimeout(() => {
      toast.style.animation = 'fadeOutDown 0.3s ease-out forwards';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }
  
  showMobileAlert(msg) {
    alert(msg);
  }
  
  showMobileInstructions(info, blobUrl) {
    this.closeInstructions();
    
    const instructions = document.createElement('div');
    instructions.id = 'mobileInstructions';
    instructions.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      z-index: 99998;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
    `;
    
    instructions.innerHTML = `
      <div style="background:#fff;padding:18px;border-radius:10px;max-width:420px;width:100%;">
        <h3 style="margin-top:0;">Imagen lista</h3>
        <p>La imagen se descargó o está disponible. Ábrela desde tu galería o usa el botón Compartir del navegador para enviarla a WhatsApp.</p>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;">
          <a id="previewImgLink" href="${blobUrl}" target="_blank" style="padding:8px 12px;background:#eee;border-radius:6px;text-decoration:none;color:#333;">Abrir imagen</a>
          <button id="mobileInstrClose" style="padding:8px 12px;border:0;background:#0b8043;color:#fff;border-radius:6px;">Cerrar</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(instructions);
    document.getElementById('mobileInstrClose').onclick = () => this.closeInstructions();
  }
  
  getQuoteInfo() {
    return {
      nombre: document.getElementById('nombre')?.value || '',
      movimiento: document.getElementById('movimiento')?.value || '',
      vehiculo: document.getElementById('vehiculo')?.value || '',
      costo: document.getElementById('costo')?.value || ''
    };
  }
  
  cleanup() {
    if (this.qrBlob) {
      this.qrBlob = null;
      this.qrFile = null;
    }
    
    this.closeInstructions();
    this.hideMobileLoading();
    
    const instructions = document.getElementById('mobileInstructions');
    if (instructions) {
      instructions.remove();
    }
  }
}

// Inicializar cuando esté listo (reintentos seguros)
document.addEventListener('DOMContentLoaded', () => {
  const initMobileShare = () => {
    if (window.shareManager) {
      window.mobileShareManager = new MobileShareManager(window.shareManager);
      console.log('🚀 MobileShareManager inicializado con ShareManager');
    } else {
      setTimeout(initMobileShare, 300);
    }
  };
  
  setTimeout(initMobileShare, 600);
  
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
  } else {
    alert('Sistema móvil no cargado. Intenta de nuevo.');
  }
};
