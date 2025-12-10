// ========== FUNCIONES PRINCIPALES ==========

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
    // Usar QRManager
    if (window.qrManager) {
      const qrData = { nombre, movimiento, vehiculo, costo };
      qrInstance = window.qrManager.generateQR(qrData);
      const enlace = window.qrManager.renderQR('qrContainer');
      
      // Actualizar ShareManager
      if (window.shareManager) {
        window.shareManager.updateGeneratedLink(enlace);
        window.shareManager.updateQRInstance(window.qrManager.getQRInstance());
      }
    } else {
      // Método original (fallback)
      generateQRFallback(nombre, movimiento, vehiculo, costo);
    }
  } catch (error) {
    console.error("Error al generar el QR:", error);
    alert("Hubo un error al generar el código QR.");
  }
}

// Método fallback si falla QRManager
function generateQRFallback(nombre, movimiento, vehiculo, costo) {
  const baseURL = "https://frikmans.github.io/generador-qr2/formulario-datos.html";
  const enlace = `${baseURL}?nombre=${encodeURIComponent(nombre)}&movimiento=${encodeURIComponent(movimiento)}&vehiculo=${encodeURIComponent(vehiculo)}&costo=${encodeURIComponent(costo)}&token=U2VydmljaW9QYXJhUGF0eQ==`;

  console.log("URL generada:", enlace);

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
  
  // Guardar globalmente
  window.qr = qrInstance;
  
  // Actualizar ShareManager si existe
  if (window.shareManager) {
    window.shareManager.updateGeneratedLink(enlace);
    window.shareManager.updateQRInstance(qrInstance);
  }
}

// Función para copiar enlace (fallback)
function copiarEnlace() {
  const nombre = document.getElementById("nombre").value;
  const movimiento = document.getElementById("movimiento").value;
  const vehiculo = document.getElementById("vehiculo").value;
  const costo = document.getElementById("costo").value;
  
  if (!nombre || !movimiento || !vehiculo || !costo) {
    alert("Completa todos los campos primero");
    return;
  }
  
  const enlace = `https://frikmans.github.io/generador-qr2/formulario-datos.html?nombre=${encodeURIComponent(nombre)}&movimiento=${encodeURIComponent(movimiento)}&vehiculo=${encodeURIComponent(vehiculo)}&costo=${encodeURIComponent(costo)}&token=U2VydmljaW9QYXJhUGF0eQ==`;
  
  navigator.clipboard.writeText(enlace)
    .then(() => {
      if (window.shareManager) {
        window.shareManager.showNotification('✅ Enlace copiado al portapapeles');
      } else {
        alert("Enlace copiado al portapapeles");
      }
    })
    .catch(err => {
      console.error("Error al copiar:", err);
      if (window.shareManager) {
        window.shareManager.showNotification('❌ Error al copiar', 'error');
      }
    });
}

// Exportar para uso global
window.generarQR = generarQR;
window.copiarEnlace = copiarEnlace;
