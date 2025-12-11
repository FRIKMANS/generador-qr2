// Modal de compartir (interfaz). No hace upload; delega en mobileShareManager.

class ShareManager {
  constructor() {
    this.qrReady = false;
    this.initModal();
  }

  // Inicializar modal en DOM
  initModal() {
    if (document.getElementById('shareModal')) return;

    const modalHtml = `
      <div id="shareModal" class="share-modal hidden" role="dialog" aria-modal="true" aria-labelledby="shareTitle">
        <div class="share-modal-backdrop" onclick="shareManager.hideModal()"></div>
        <div class="share-modal-content" role="document">
          <h2 id="shareTitle">Compartir Cotización</h2>
          <div id="shareNotice" class="share-notice" style="display:none;"></div>

          <div class="share-actions">
            <button class="share-btn" id="btnShareImage">Compartir imagen</button>
            <button class="share-btn" id="btnWhatsApp">WhatsApp</button>
            <button class="share-btn" id="btnTelegram">Telegram</button>
            <button class="share-btn" id="btnSMS">SMS</button>
            <button class="share-btn" id="btnEmail">Email</button>
            <button class="share-btn" id="btnDownload">Descargar QR</button>
          </div>

          <div style="margin-top:12px; text-align:center;">
            <button class="share-close" id="btnClose">Cerrar</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Bind events
    document.getElementById('btnClose').addEventListener('click', () => this.hideModal());
    document.getElementById('btnShareImage').addEventListener('click', () => this.onShareImage());
    document.getElementById('btnWhatsApp').addEventListener('click', () => this.onWhatsApp());
    document.getElementById('btnTelegram').addEventListener('click', () => this.onTelegram());
    document.getElementById('btnSMS').addEventListener('click', () => this.onSMS());
    document.getElementById('btnEmail').addEventListener('click', () => this.onEmail());
    document.getElementById('btnDownload').addEventListener('click', () => this.onDownload());

    this.injectMinimalStyles();
  }

  injectMinimalStyles() {
    if (document.getElementById('shareModalStyles')) return;
    const css = `
      .share-modal.hidden { display: none; }
      .share-modal { position: fixed; inset: 0; z-index: 3000; display: flex; align-items: center; justify-content: center; }
      .share-modal-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.5); }
      .share-modal-content { position: relative; background: #fff; border-radius: 10px; padding: 18px; width: 92%; max-width: 420px; box-shadow: 0 8px 30px rgba(0,0,0,0.2); z-index: 2; }
      .share-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; }
      .share-btn { padding: 10px; border-radius: 8px; border: 0; background: #733298; color: white; font-weight: 600; cursor: pointer; }
      .share-btn:active { transform: scale(0.98); }
      .share-close { margin-top: 6px; padding: 9px 12px; border-radius: 8px; border: 0; background: #444; color: #fff; cursor: pointer; }
      .share-notice { padding: 8px; border-radius: 6px; background: #f5f5f5; margin-bottom: 8px; font-size: 14px; }
    `;
    const style = document.createElement('style');
    style.id = 'shareModalStyles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  showNotification(msg, timeout = 3000) {

    let container = document.getElementById('globalShareNotification');
    if (!container) {
      container = document.createElement('div');
      container.id = 'globalShareNotification';
      container.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:4000;padding:10px 14px;border-radius:8px;background:#222;color:#fff;font-weight:600;display:none;';
      document.body.appendChild(container);
    }
    container.textContent = msg;
    container.style.display = 'block';
    setTimeout(() => { container.style.display = 'none'; }, timeout);
  }

  showModal() {
    const modal = document.getElementById('shareModal');
    if (!modal) return;
    modal.classList.remove('hidden');
  }

  hideModal() {
    const modal = document.getElementById('shareModal');
    if (!modal) return;
    modal.classList.add('hidden');
  }


  async onShareImage() {
    try {
      if (!window.mobileShareManager) {
        this.showNotification('Módulo móvil no disponible');
        return;
      }
      this.showNotification('Procesando imagen...');
      await window.mobileShareManager.uploadAndShare({ shareOnlyUrlIfNeeded: false });
      this.showNotification('Operación finalizada', 2000);
    } catch (err) {
      console.error('onShareImage error', err);
      this.showNotification('Error al compartir imagen', 3000);
    }
  }

  async onWhatsApp() {
    try {
      if (!window.mobileShareManager) {
        this.showNotification('Módulo móvil no disponible');
        return;
      }
      this.showNotification('Preparando WhatsApp...');
      await window.mobileShareManager.uploadAndShare({ channel: 'whatsapp', preferUrlText: false });
    } catch (err) {
      console.error('WhatsApp share error', err);
      this.showNotification('Error preparando WhatsApp', 3000);
    }
  }

  async onTelegram() {
    try {
      if (!window.mobileShareManager) {
        this.showNotification('Módulo móvil no disponible');
        return;
      }
      this.showNotification('Preparando Telegram...');
      await window.mobileShareManager.uploadAndShare({ channel: 'telegram' });
    } catch (err) {
      console.error('Telegram share error', err);
      this.showNotification('Error preparando Telegram', 3000);
    }
  }

  async onSMS() {
    try {
      if (!window.mobileShareManager) {
        this.showNotification('Módulo móvil no disponible');
        return;
      }
      this.showNotification('Preparando SMS...');
      await window.mobileShareManager.uploadAndShare({ channel: 'sms' });
    } catch (err) {
      console.error('SMS share error', err);
      this.showNotification('Error preparando SMS', 3000);
    }
  }

  async onEmail() {
    try {
      if (!window.mobileShareManager) {
        this.showNotification('Módulo móvil no disponible');
        return;
      }
      this.showNotification('Preparando correo...');
      await window.mobileShareManager.uploadAndShare({ channel: 'email' });
    } catch (err) {
      console.error('Email share error', err);
      this.showNotification('Error preparando correo', 3000);
    }
  }

  async onDownload() {
    try {
      if (!window.qrManager) {
        this.showNotification('QRManager no disponible', 3000);
        return;
      }
      // obtener blob desde qrManager y activar descarga
      const blob = await window.qrManager.getBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // usa nombre de archivo con marca de tiempo para evitar colisiones
      a.download = `QR_Cotizacion_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      this.showNotification('Descarga iniciada', 2000);
    } catch (err) {
      console.error('download error', err);
      this.showNotification('Error al descargar', 3000);
    }
  }
}

// Exponer singleton
window.shareManager = window.shareManager || new ShareManager();
