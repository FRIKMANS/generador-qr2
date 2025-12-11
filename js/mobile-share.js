// Subida a Cloudinary + share flows
const CLOUDINARY_CLOUD = 'dh48lsyst';
const CLOUDINARY_UPLOAD_PRESET = 'qrs_publicos';

// Utilidades
function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}
function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}
function encodeTextForURL(text) {
  return encodeURIComponent(text);
}

// MobileShareManager
class MobileShareManager {
  constructor() {
    // noop
  }

  // Obtiene el blob del QR usando QRManager
  async captureQRBlob() {
    if (!window.qrManager) throw new Error('QRManager no disponible');
    // qrManager.getBlob() debe devolver un Blob PNG
    const blob = await window.qrManager.getBlob();
    if (!blob || !(blob instanceof Blob)) throw new Error('No se pudo obtener blob del QR');
    return blob;
  }

  // Sube blob a Cloudinary
  async uploadToCloudinary(blob) {
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`;
    const fd = new FormData();
    fd.append('file', blob);
    fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(url, {
      method: 'POST',
      body: fd
    });

    if (!res.ok) {
      const text = await res.text().catch(()=>null);
      throw new Error('Cloudinary upload failed: ' + (text || res.status));
    }

    const data = await res.json();
    if (!data.secure_url) throw new Error('Cloudinary response missing secure_url');
    return data;
  }

  // Construye el mensaje estándar
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

  // Intentar compartir vía Web Share API
  async tryNavigatorShare(blob, publicUrl, text) {
    try {
      if (!navigator.share) return false;
      // crear File para navigator.share
      const filename = `QR_Cotizacion_${Date.now()}.png`;
      const file = new File([blob], filename, { type: 'image/png' });

      // comprobar navigator.canShare si existe
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Cotización - QR',
          text,
          url: publicUrl
        });
        return true;
      }
      // Si canShare no existe pero share sí, intentar con url+text
      await navigator.share({ title: 'Cotización - QR', text, url: publicUrl });
      return true;
    } catch (err) {
      // no fatal; retornamos false para que haga fallback
      console.warn('navigator.share failed', err);
      return false;
    }
  }

  // Abre la URL de la imagen en nueva pestaña
  openImageInNewTab(publicUrl) {
    const win = window.open(publicUrl, '_blank');
    if (!win) {
      // bloqueador de popups
      alert('Permite ventanas emergentes para previsualizar la imagen o descarga el QR manualmente.');
    }
  }

  // Abre WhatsApp con texto
  openWhatsAppWithText(text) {

    const url = `https://wa.me/?text=${encodeTextForURL(text)}`;
    window.open(url, '_blank');
  }

  // Abre Telegram share URL
  openTelegramWithText(text) {

    const encoded = encodeTextForURL(text);
    const url = `https://t.me/share/url?url=&text=${encoded}`;
    window.open(url, '_blank');
  }

  // Abre Mailto con subject+body
  openEmailWithBody(subject, body) {
    const mailto = `mailto:?subject=${encodeTextForURL(subject)}&body=${encodeTextForURL(body)}`;
    window.location.href = mailto;
  }

  // Abre sms
  openSMSWithText(text) {

    const url = `sms:?body=${encodeTextForURL(text)}`;

    window.location.href = url;
  }

  // entrada princial: carga y comparte dependendiendo del canal

  async uploadAndShare(options = {}) {
    const { channel, preferUrlText = true, shareOnlyUrlIfNeeded = true } = options;

    // 1) Captura blob
    const blob = await this.captureQRBlob();

    // 2) Sube a Cloudinary
    const cloudResp = await this.uploadToCloudinary(blob);
    const publicUrl = cloudResp.secure_url;

    // 3) Construye mensaje de texto
    const text = this.buildShareText(publicUrl);
    const subject = 'Cotización - Código QR';

    // 4) Lógica específica por canal
    // Si no se proporciona canal, intenta compartir genéricamente (navigator.share) primero en Android/Escritorio
    if (!channel) {
      // intenta compartir con navigator si es posible (archivos + texto)
      const tried = await this.tryNavigatorShare(blob, publicUrl, text);
      if (tried) return { ok: true, method: 'navigator.share' };
      // Fallback: open preview
      this.openImageInNewTab(publicUrl);
      return { ok: true, method: 'open_preview' };
    }

    // canal especificado:
    if (channel === 'whatsapp') {
      // Prefiere usar navigator.share en Android para adjuntar archivo directamente si es compatible   
      if (isAndroid()) {
        const tried = await this.tryNavigatorShare(blob, publicUrl, text);
        if (tried) return { ok: true, method: 'navigator.share' };
        // de lo contrario abre ventana de previsualización donde el usuario puede usar compartir nativo
        this.openImageInNewTab(publicUrl);
        return { ok: true, method: 'open_preview' };
      } else {
        // iOS / escritorio -> usa wa.me con texto + URL
        this.openWhatsAppWithText(text);
        return { ok: true, method: 'wa.me' };
      }
    }

    if (channel === 'telegram') {
      // Telegram tiene soporte limitado desde la web para archivos; comparte vía URL
      // Intenta navigator.share primero (archivos) para Android
      if (isAndroid()) {
        const tried = await this.tryNavigatorShare(blob, publicUrl, text);
        if (tried) return { ok: true, method: 'navigator.share' };
        this.openImageInNewTab(publicUrl);
        return { ok: true, method: 'open_preview' };
      } else {
        this.openTelegramWithText(text);
        return { ok: true, method: 't.me' };
      }
    }

    if (channel === 'email') {
      // mailto con body incluyendo publicUrl (el usuario puede adjuntar manualmente si es necesario)
      const body = text;
      this.openEmailWithBody(subject, body);
      return { ok: true, method: 'mailto' };
    }

    if (channel === 'sms') {
      const tried = await this.tryNavigatorShare(blob, publicUrl, text).catch(()=>false);
      // SMS rara vez soporta archivos; usa texto como alternativa
      this.openSMSWithText(text);
      return { ok: true, method: 'sms' };
    }

    // fallback por defecto
    this.openImageInNewTab(publicUrl);
    return { ok: true, method: 'open_preview' };
  }
}

// Exponer singleton
window.mobileShareManager = window.mobileShareManager || new MobileShareManager();
