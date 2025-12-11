// ======================================================
// mobile-share.js — integra upload a Cloudinary + compartir
// ======================================================

const CLOUDINARY_CLOUD = 'dh48lsyst';
const CLOUDINARY_UPLOAD_PRESET = 'qrs_publicos';

// Util helpers
const isAndroid = () => /Android/i.test(navigator.userAgent);
const isIOS = () => /iPhone|iPad|iPod/i.test(navigator.userAgent);
const encodeText = (t) => encodeURIComponent(t);

// MobileShareManager
class MobileShareManager {
  constructor() {
    console.log('[MobileShare] inicializando');
  }

  async captureQRBlob() {
    try {
      console.log('[MobileShare] captureQRBlob -> solicitando blob a qrManager');
      if (!window.qrManager) throw new Error('qrManager no definido');
      const blob = await window.qrManager.getBlob();
      console.log('[MobileShare] Blob obtenido (size):', blob.size, 'type:', blob.type);
      return blob;
    } catch (err) {
      console.error('[MobileShare] captureQRBlob error:', err);
      throw err;
    }
  }

  async uploadToCloudinary(blob) {
    try {
      console.log('[MobileShare] Subiendo a Cloudinary...');
      const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`;
      const fd = new FormData();
      fd.append('file', blob);
      fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(url, { method: 'POST', body: fd });
      if (!res.ok) {
        const text = await res.text().catch(()=>null);
        throw new Error('Cloudinary upload failed: ' + (text || res.status));
      }
      const data = await res.json();
      console.log('[MobileShare] Upload OK ->', data.secure_url);
      return data;
    } catch (err) {
      console.error('[MobileShare] uploadToCloudinary error:', err);
      throw err;
    }
  }

  buildShareText(publicUrl) {
    const nombre = document.getElementById('nombre')?.value || '';
    const movimiento = document.getElementById('movimiento')?.value || '';
    const vehiculo = document.getElementById('vehiculo')?.value || '';
    const costo = document.getElementById('costo')?.value || '';

    let text = `COTIZACIÓN DE SERVICIO\n\n`;
    if (nombre) text += `Vendedor: ${nombre}\n`;
    if (movimiento) text += `Movimiento: ${movimiento}\n`;
    if (vehiculo) text += `Vehículo: ${vehiculo}\n`;
    if (costo) text += `Costo: $${costo}\n\n`;
    text += `Escanea o descarga el código QR para registrar la cotización:\n${publicUrl}`;
    return text;
  }

  async tryNavigatorShare(blob, publicUrl, text) {
    try {
      if (!navigator.share) {
        console.log('[MobileShare] navigator.share no soportado');
        return false;
      }
      const filename = `QR_Cotizacion_${Date.now()}.png`;
      const file = new File([blob], filename, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        console.log('[MobileShare] navigator.canShare -> true, compartiendo archivo');
        await navigator.share({ files: [file], title: 'Cotización - QR', text, url: publicUrl });
        return true;
      }

      // si no puede compartir archivos, intentar compartir solo texto+url
      console.log('[MobileShare] navigator.canShare false o no existe -> intentar share text+url');
      await navigator.share({ title: 'Cotización - QR', text, url: publicUrl });
      return true;
    } catch (err) {
      console.warn('[MobileShare] tryNavigatorShare fallo:', err);
      return false;
    }
  }

  openInNewTab(url) {
    const w = window.open(url, '_blank');
    if (!w) {
      alert('Permite ventanas emergentes o descarga manualmente la imagen.');
    }
  }

  openWhatsApp(text) {
    const url = `https://wa.me/?text=${encodeText(text)}`;
    window.open(url, '_blank');
  }

  openTelegram(text) {
    const url = `https://t.me/share/url?url=&text=${encodeText(text)}`;
    window.open(url, '_blank');
  }

  openEmail(subject, body) {
    const mailto = `mailto:?subject=${encodeText(subject)}&body=${encodeText(body)}`;
    window.location.href = mailto;
  }

  openSMS(text) {
    const url = `sms:?body=${encodeText(text)}`;
    window.location.href = url;
  }

  // options: { channel, preferUrlText, shareOnlyUrlIfNeeded }
  async uploadAndShare(options = {}) {
    const { channel, preferUrlText = true, shareOnlyUrlIfNeeded = true } = options;
    console.log('[MobileShare] uploadAndShare options:', options);

    try {
      // 1) capture blob
      const blob = await this.captureQRBlob();

      // 2) upload
      const cloudResp = await this.uploadToCloudinary(blob);
      const publicUrl = cloudResp.secure_url;
      const text = this.buildShareText(publicUrl);

      console.log('[MobileShare] publicUrl:', publicUrl);

      // 3) channel logic
      if (!channel) {
        const tried = await this.tryNavigatorShare(blob, publicUrl, text);
        if (tried) return { ok: true, method: 'navigator.share' };
        this.openInNewTab(publicUrl);
        return { ok: true, method: 'open_preview' };
      }

      if (channel === 'whatsapp') {
        if (isAndroid()) {
          const tried = await this.tryNavigatorShare(blob, publicUrl, text);
          if (tried) return { ok: true, method: 'navigator.share' };
          this.openInNewTab(publicUrl);
          return { ok: true, method: 'open_preview' };
        } else {
          this.openWhatsApp(text);
          return { ok: true, method: 'wa.me' };
        }
      }

      if (channel === 'telegram') {
        if (isAndroid()) {
          const tried = await this.tryNavigatorShare(blob, publicUrl, text);
          if (tried) return { ok: true, method: 'navigator.share' };
          this.openInNewTab(publicUrl);
          return { ok: true, method: 'open_preview' };
        } else {
          this.openTelegram(text);
          return { ok: true, method: 't.me' };
        }
      }

      if (channel === 'email') {
        this.openEmail('Cotización - Código QR', text);
        return { ok: true, method: 'mailto' };
      }

      if (channel === 'sms') {
        this.openSMS(text);
        return { ok: true, method: 'sms' };
      }

      // default fallback
      this.openInNewTab(publicUrl);
      return { ok: true, method: 'open_preview' };

    } catch (err) {
      console.error('[MobileShare] uploadAndShare error:', err);
      alert('Error al compartir. Revisa la consola para más detalles.');
      throw err;
    }
  }
}

// Exponer singleton
window.mobileShareManager = window.mobileShareManager || new MobileShareManager();
console.log('[MobileShare] disponible');
