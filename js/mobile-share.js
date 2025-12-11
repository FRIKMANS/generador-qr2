class MobileShareManager {
constructor(shareManager) {
this.shareManager = shareManager;
this.isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}


async getQRFile() {
const blob = await this.shareManager.generateQRBlob();
return new File([blob], 'qr.png', { type: 'image/png' });
}


async shareImage() {
try {
const file = await this.getQRFile();


if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
await navigator.share({ files: [file], title: 'Código QR' });
} else {
this.openImageWorkaround();
}
} catch (err) {
console.error('Error sharing image:', err);
}
}


async shareWhatsApp() {
try {
const blob = await this.shareManager.generateQRBlob();
const url = URL.createObjectURL(blob);


// Android workaround
if (/Android/i.test(navigator.userAgent)) {
window.open(url, '_blank');
} else {
// Fallback: only text
window.open(`https://api.whatsapp.com/send?text=Escanea este código QR`, '_blank');
}
} catch (err) {}
}


async shareTelegram() {
window.open(`https://t.me/share/url?url=Escanea%20este%20QR`, '_blank');
}


async shareSMS() {
window.open(`sms:?body=Escanea este código QR`, '_self');
}


async shareEmail() {
window.location.href = `mailto:?subject=Código QR&body=Adjunto el QR.`;
}


async openImageWorkaround() {
const blob = await this.shareManager.generateQRBlob();
const url = URL.createObjectURL(blob);
window.open(url, '_blank');
}
}


window.mobileShareManager = new MobileShareManager(window.shareManager);