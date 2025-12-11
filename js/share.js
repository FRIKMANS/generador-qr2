// ======================================================
// share.js — modal de interfaz y conexión con mobileShareManager
// ======================================================

class ShareManager {
  constructor() {
    this.qrInstance = null; // referencia opcional a instancia QR (no siempre necesaria)
    this.initModal();
    console.log('[Share] Inicializado ShareManager');
  }

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

    console.log('[Share] Modal creado y eventos vinculados');
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

  // allow script.js to pass the QR instance (optional)
  updateQRInstance(qrInstance) {
    this.qrInstance = qrInstance;
    console.log('[Share] updateQRInstance llamado. instancia QR actualizada:', !!qrInstance);
  }

  // Delegadores
  async onShareImage() {
    console.log('[Share] onShareImage');
    try {
      if (!window.mobileShareManager) throw new Error('mobileShareManager no disponible');
      await window.mobileShareManager.uploadAndShare({ channel: undefined, shareOnlyUrlIfNeeded: false });
    } catch (err) {
      console.error('[Share] onShareImage error:', err);
      alert('Error al compartir imagen. Revisa la consola.');
    }
  }

  async onWhatsApp() {
    console.log('[Share] onWhatsApp');
    try {
      if (!window.mobileShareManager) throw new Error('mobileShareManager no disponible');
      await window.mobileShareManager.uploadAndShare({ channel: 'whatsapp', preferUrlText: true });
    } catch (err) {
      console.error('[Share] onWhatsApp error:', err);
      alert('Error al preparar WhatsApp. Revisa la consola.');
    }
  }

  async onTelegram() {
    console.log('[Share] onTelegram');
    try {
      if (!window.mobileShareManager) throw new Error('mobileShareManager no disponible');
      await window.mobileShareManager.uploadAndShare({ channel: 'telegram', preferUrlText: true });
    } catch (err) {
      console.error('[Share] onTelegram error:', err);
      alert('Error al preparar Telegram. Revisa la consola.');
    }
  }

  async onSMS() {
    console.log('[Share] onSMS');
    try {
      if (!window.mobileShareManager) throw new Error('mobileShareManager no disponible');
      await window.mobileShareManager.uploadAndShare({ channel: 'sms', preferUrlText: true });
    } catch (err) {
      console.error('[Share] onSMS error:', err);
      alert('Error al preparar SMS. Revisa la consola.');
    }
  }

  async onEmail() {
    console.log('[Share] onEmail');
    try {
      if (!window.mobileShareManager) throw new Error('mobileShareManager no disponible');
      await window.mobileShareManager.uploadAndShare({ channel: 'email', preferUrlText: true });
    } catch (err) {
      console.error('[Share] onEmail error:', err);
      alert('Error al preparar correo. Revisa la consola.');
    }
  }

  async onDownload() {
    console.log('[Share] onDownload');
    try {
      if (!window.qrManager) throw new Error('qrManager no disponible');
      const blob = await window.qrManager.getBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR_Cotizacion_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (err) {
      console.error('[Share] onDownload error:', err);
      alert('Error al descargar. Revisa la consola.');
    }
  }
}

// Exponer singleton
window.shareManager = window.shareManager || new ShareManager();
console.log('[Share] shareManager disponible');
