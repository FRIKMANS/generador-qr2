// ======================================================
// share.js — versión simplificada
// ======================================================

class ShareManager {
  constructor() {
    this.qrInstance = null;
    this.initModal();
    console.log("[Share] Inicializado ShareManager (versión simplificada)");
  }

  initModal() {
    if (document.getElementById("shareModal")) return;

    const modal = `
      <div id="shareModal" class="share-modal hidden">
        <div class="share-modal-backdrop" onclick="shareManager.hideModal()"></div>
        <div class="share-modal-content">

          <h2>Compartir</h2>
          <p id="shareMessage" style="display:none;" class="share-warning"></p>

          <div class="share-actions">
            <button class="share-btn" id="btnShare">Compartir</button>
            <button class="share-btn" id="btnDownload">Descargar QR</button>
          </div>

          <button class="share-close" id="btnClose">Cerrar</button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modal);

    document.getElementById("btnShare").addEventListener("click", () => this.onShare());
    document.getElementById("btnDownload").addEventListener("click", () => this.onDownload());
    document.getElementById("btnClose").addEventListener("click", () => this.hideModal());
  }

  updateQRInstance(instance) {
    this.qrInstance = instance;
    console.log("[Share] Instancia QR actualizada");
  }

  showModal() {
    document.getElementById("shareModal").classList.remove("hidden");
  }

  hideModal() {
    document.getElementById("shareModal").classList.add("hidden");
    document.getElementById("shareMessage").style.display = "none";
  }

  showWarning(msg) {
    const el = document.getElementById("shareMessage");
    el.textContent = msg;
    el.style.display = "block";
  }

  async onShare() {
    try {
      console.log("[Share] Compartiendo...");

      if (!navigator.share) {
        this.showWarning("Tu navegador no permite compartir desde aquí.");
        return;
      }

      if (!window.qrManager) {
        this.showWarning("QR no disponible, genera uno primero.");
        return;
      }

      const blob = await window.qrManager.getBlob();
      const file = new File([blob], `QR_Cotizacion.png`, { type: "image/png" });

      const nombre = document.getElementById("nombre").value;
      const movimiento = document.getElementById("movimiento").value;
      const vehiculo = document.getElementById("vehiculo").value;
      const costo = document.getElementById("costo").value;

      const text = `
COTIZACIÓN DE SERVICIO

Vendedor: ${nombre}
Movimiento: ${movimiento}
Vehículo: ${vehiculo}
Costo: $${costo}
      `;

      let shareData;

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        shareData = { files: [file], text: text.trim(), title: "Cotización" };
      } else {
        shareData = { text: text.trim(), title: "Cotización" };
      }

      await navigator.share(shareData);

    } catch (err) {
      console.warn("[Share] No se pudo compartir:", err);
      this.showWarning("No fue posible compartir en este dispositivo.");
    }
  }

  async onDownload() {
    try {
      if (!window.qrManager) {
        this.showWarning("Debes generar un QR primero.");
        return;
      }

      const blob = await window.qrManager.getBlob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "QR_Cotizacion.png";
      a.click();

      setTimeout(() => URL.revokeObjectURL(url), 5000);

    } catch (err) {
      console.error("[Share] Error al descargar:", err);
      this.showWarning("Error al descargar la imagen.");
    }
  }
}

window.shareManager = new ShareManager();
console.log("[Share] shareManager listo");
