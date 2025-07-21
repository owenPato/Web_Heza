// utils/buildRutaCliente.js
import path from 'path';

const rutasTipo = {
  'estados-cuenta': ['Contable', 'Conciliacion bancaria', 'Estdos Bancarios'],
  'excel-movimientos': ['Contable', 'Conciliacion bancaria'],
  'certificados-sat': ['BD', '1 E Firma'],
  'kit-nomina': ['Laboral', 'Nomina', 'Nuevos Colaboradores']
};

// 🧠 Mes actual como texto (Ej: "05 Mayo")
const getMesActualTexto = () => {
  const meses = ['01 Enero', '02 Febrero', '03 Marzo', '04 Abril', '05 Mayo', '06 Junio', '07 Julio', '08 Agosto', '09 Septiembre', '10 Octubre', '11 Noviembre', '12 Diciembre'];
  const hoy = new Date();
  return meses[hoy.getMonth()];
};

export function buildRutaCliente({
  empresa = 'ESPECIALISTAS, PALAS Y PERFORADORAS, SA DE CV',
  tipo,
  anio = new Date().getFullYear().toString(),
  mes = getMesActualTexto()
}) {
  const base = process.env.RUTA_CLIENTES || '\\\\192.168.11.41\\Clientes';

  if (!rutasTipo[tipo]) {
    throw new Error(`❌ Tipo de ruta no soportado: ${tipo}`);
  }

  const subruta = rutasTipo[tipo];
  const partesRuta = [base, empresa, anio, mes, ...subruta];
  return path.join(...partesRuta);
}
