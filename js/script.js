let qr;

function generarQR() {
  const nombre = encodeURIComponent(document.getElementById("nombre").value);
  const movimiento = encodeURIComponent(document.getElementById("movimiento").value);
  const costo = encodeURIComponent(document.getElementById("costo").value);

  if (!nombre || !movimiento || !costo) {
    alert("Por favor completa todos los campos.");
    return;
  }

  const baseURL = "https://frikmans.github.io/generador-qr2/formulario-datos.html";
  const enlace = `${baseURL}?nombre=${nombre}&movimiento=${movimiento}&costo=${costo}&token=U2VydmljaW9QYXJhUGF0eQ==`;

  console.log("URL generada:", enlace);

  const contenedor = document.getElementById("qrContainer");
  contenedor.innerHTML = "";
  document.getElementById("qrCard").style.display = "block";

  try {
    qr = new QRCodeStyling({
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

    qr.append(contenedor);
  } catch (error) {
    console.error("Error al generar el QR:", error);
    alert("Hubo un error al generar el código QR.");
  }
}

function copiarEnlace() {
  const nombre = encodeURIComponent(document.getElementById("nombre").value);
  const movimiento = encodeURIComponent(document.getElementById("movimiento").value);
  const costo = encodeURIComponent(document.getElementById("costo").value);
  
  if (!nombre || !movimiento || !costo) {
    alert("Completa los campos primero");
    return;
  }
  
  const enlace = `https://tudominio.com/formulario-datos.html?nombre=${nombre}&movimiento=${movimiento}&costo=${costo}&token=TU_TOKEN_SECRETO`;
  
  navigator.clipboard.writeText(enlace)
    .then(() => alert("Enlace copiado al portapapeles"))
    .catch(err => console.error("Error al copiar:", err));
}
