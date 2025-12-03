
function doPost(e) {
  try {
    const data = e.parameter;
    const sheet = SpreadsheetApp.openById('TU_ID_DE_HOJA').getActiveSheet();
    
    // Validar token de seguridad
    if (data.token !== 'TU_TOKEN_SECRETO') {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Acceso no autorizado'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Registrar datos
    sheet.appendRow([
      new Date(),
      data.nombre,
      data.movimiento,
      data.costo,
      data.estado || 'pendiente'
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Datos registrados correctamente'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Función para obtener registros (opcional, para verificar)
function doGet(e) {
  // Solo permitir acceso con token
  if (e.parameter.token !== 'TU_TOKEN_SECRETO') {
    return ContentService.createTextOutput('Acceso denegado');
  }
  
  const sheet = SpreadsheetApp.openById('TU_ID_DE_HOJA').getActiveSheet();
  const data = sheet.getDataRange().getValues();
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}