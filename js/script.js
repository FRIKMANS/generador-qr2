let qrInstance = null;

// Función principal para generar QR
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
    if (window.qrManager) {
      const qrData = { nombre, movimiento, vehiculo, costo };

      // Generar QR mediante QRManager
      qrInstance = window.qrManager.generateQR(qrData);

      // Mostrar en contenedor
      window.qrManager.renderQR('qrContainer');

      // Mostrar tarjeta QR
      document.getElementById("qrCard").style.display = "block";

      // Actualizar ShareManager con la instancia correcta
      if (window.shareManager) {
        window.shareManager.updateQRInstance(window.qrManager.getQRInstance());
      }
    } else {
      generateQRFallback(nombre, movimiento, vehiculo, costo);
    }
  } catch (error) {
    console.error("Error al generar QR:", error);
    alert("Hubo un error al generar el código QR.");
  }
}

// Fallback sin QRManager
function generateQRFallback(nombre, movimiento, vehiculo, costo) {
  const baseURL = "https://frikmans.github.io/generador-qr2/formulario-datos.html";
  const enlace = `${baseURL}?nombre=${encodeURIComponent(nombre)}&movimiento=${encodeURIComponent(movimiento)}&vehiculo=${encodeURIComponent(vehiculo)}&costo=${encodeURIComponent(costo)}&token=U2VydmljaW9QYXJhUGF0eQ==`;

  const contenedor = document.getElementById("qrContainer");
  contenedor.innerHTML = "";
  document.getElementById("qrCard").style.display = "block";

  qrInstance = new QRCodeStyling({
    width: 260,
    height: 260,
    data: enlace,
    image: "img/logo.jpg",
    dotsOptions: {
      color: "#733298",
      type: "rounded"
    },
    backgroundOptions: {
      color: "#ffffff"
    },
    cornersSquareOptions: {
      color: "#44ABA8",
      type: "extra-rounded"
    },
    cornersDotOptions: {
      color: "#733298"
    }
  });

  qrInstance.append(contenedor);

  // Actualizar ShareManager
  if (window.shareManager) {
    window.shareManager.updateQRInstance(qrInstance);
  }
}

// Descargar QR como archivo
function descargarQR() {
  if (!qrInstance) {
    alert("Genera un código QR primero.");
    return;
  }

  qrInstance.download({ name: "QR_Cotizacion", extension: "png" });
}

// Exponer funciones globales
window.generarQR = generarQR;
window.descargarQR = descargarQR;
