class ShareManager {
constructor() {
this.qrInstance = null;
this.generatedImageBlob = null;
this.initModal();
}


updateQRInstance(instance) {
this.qrInstance = instance;
}


async generateQRBlob() {
if (!this.qrInstance) throw new Error('QR not initialized');
return await this.qrInstance.getBlob();
}


initModal() {
const modalHtml = `
<div id="shareModal" class="modal hidden">
<div class="modal-content">
<h2>Compartir QR</h2>
<div class="share-buttons">
<button class="btn" onclick="mobileShareManager.shareImage()">Compartir imagen</button>
<button class="btn" onclick="mobileShareManager.shareWhatsApp()">WhatsApp</button>
<button class="btn" onclick="mobileShareManager.shareTelegram()">Telegram</button>
<button class="btn" onclick="mobileShareManager.shareSMS()">SMS</button>
<button class="btn" onclick="mobileShareManager.shareEmail()">Email</button>
</div>
<button class="close-btn" onclick="shareManager.hideModal()">Cerrar</button>
</div>
</div>`;


document.body.insertAdjacentHTML('beforeend', modalHtml);
}


showModal() {
document.getElementById('shareModal').classList.remove('hidden');
}


hideModal() {
document.getElementById('shareModal').classList.add('hidden');
}
}


window.shareManager = new ShareManager();