export function construirRutaEntregable({ empresa, anio, mes }) {
  const plantilla = process.env.RUTA_ENTREGABLES;
  if (!plantilla) {
    throw new Error('❌ RUTA_ENTREGABLES no definida en el entorno');
  }

  return plantilla
    .replace('%EMPRESA%', empresa)
    .replace('%ANIO%', anio)
    .replace('%MES%', mes);
}

