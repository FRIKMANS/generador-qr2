// ======================================================
// script.js 
// ======================================================

let qrInstance = null;

function generarQR() {
  const nombre = document.getElementById("nombre").value;
  const movimiento = document.getElementById("movimiento").value;
  const vehiculo = document.getElementById("vehiculo").value;
  const costo = document.getElementById("costo").value;

  if (!nombre || !movimiento || !vehiculo || !costo) {
    alert("Por favor completa TODOS los campos.");
    return;
  }

  try {
    console.log('[Script] generarQR -> datos:', { nombre, movimiento, vehiculo, costo });

    if (window.qrManager) {
      const qrData = { nombre, movimiento, vehiculo, costo };

      // Generar QR mediante QRManager
      qrInstance = window.qrManager.generateQR(qrData);

      // Renderizar en contenedor
      window.qrManager.renderQR('qrContainer');

      // Mostrar tarjeta QR
      const qrCard = document.getElementById("qrCard");
      if (qrCard) qrCard.style.display = "block";

      // Actualizar ShareManager con la instancia correcta
      if (window.shareManager && typeof window.shareManager.updateQRInstance === 'function') {
        try {
          window.shareManager.updateQRInstance(window.qrManager.getQRInstance());
          console.log('[Script] shareManager.updateQRInstance llamado correctamente');
        } catch (err) {
          console.warn('[Script] shareManager.updateQRInstance fallo:', err);
        }
      } else {
        console.warn('[Script] shareManager o updateQRInstance no disponible');
      }
    } else {
      console.warn('[Script] qrManager no disponible, usando fallback');
      generateQRFallback(nombre, movimiento, vehiculo, costo);
    }
  } catch (error) {
    console.error('[Script] Error al generar QR:', error);
    alert("Hubo un error al generar el código QR. Revisa la consola.");
  }
}

function generateQRFallback(nombre, movimiento, vehiculo, costo) {
  try {
    const baseURL = "https://frikmans.github.io/generador-qr2/formulario-datos.html";
    const enlace = `${baseURL}?nombre=${encodeURIComponent(nombre)}&movimiento=${encodeURIComponent(movimiento)}&vehiculo=${encodeURIComponent(vehiculo)}&costo=${encodeURIComponent(costo)}&token=U2VydmljaW9QYXJhUGF0eQ==`;

    console.log('[Script] generateQRFallback -> enlace:', enlace);

    const contenedor = document.getElementById("qrContainer");
    contenedor.innerHTML = "";
    document.getElementById("qrCard").style.display = "block";

    qrInstance = new QRCodeStyling({
      width: 260,
      height: 260,
      data: enlace,
      image: "img/logo.jpg",
      dotsOptions: { color: "#733298", type: "rounded" },
      backgroundOptions: { color: "#ffffff" },
      cornersSquareOptions: { color: "#44ABA8", type: "extra-rounded" },
      cornersDotOptions: { color: "#733298" }
    });

    qrInstance.append(contenedor);
    window.qr = qrInstance;

    if (window.shareManager && typeof window.shareManager.updateQRInstance === 'function') {
      window.shareManager.updateQRInstance(qrInstance);
      console.log('[Script] Fallback: shareManager.updateQRInstance actualizado');
    }
  } catch (err) {
    console.error('[Script] generateQRFallback error:', err);
  }
}

function descargarQR() {
  try {
    if (!qrInstance) {
      alert("Genera un código QR primero.");
      return;
    }
    console.log('[Script] descargarQR -> iniciando descarga');
    qrInstance.download({ name: "QR_Cotizacion", extension: "png" });
  } catch (err) {
    console.error('[Script] descargarQR error:', err);
    alert('Error al descargar QR. Revisa la consola.');
  }
}

// Exportar globalmente
window.generarQR = generarQR;
window.descargarQR = descargarQR;

console.log('[Script] cargado');
