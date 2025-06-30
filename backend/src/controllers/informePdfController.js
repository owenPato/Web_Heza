import fs from 'fs';
import pdfParse from 'pdf-parse';
import db from '../config/db.js';

export const subirInformePDF = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No se subió ningún archivo.' });
    }

    // ✅ Leer el PDF como buffer
    const dataBuffer = fs.readFileSync(file.path);
    const pdfData = await pdfParse(dataBuffer);
    const texto = pdfData.text;

    // ✅ Extraer datos con regex
    const ingresos_2025 = extractNumber(texto, /Ingresos facturados\s+acumulados\s+([\d,]+)/);
    const ingresos_2024 = extractNumber(texto, /acumulados\s+[\d,]+\s+([\d,]+)/);
    const coef_2025 = extractNumber(texto, /Coeficiente de utilidad\s+([\d.]+)/);
    const coef_2024 = extractNumber(texto, /Coeficiente de utilidad\s+[\d.]+\s+([\d.]+)/);
    const isr = extractNumber(texto, /ISR\s+([\d,]+)/);
    const iva = extractNumber(texto, /IVA\s+([\d,]+)/);
    const retencion_salarios = extractNumber(texto, /Retencion Salarios\s+([\d,]+)/);
    const ispt_asimilados = extractNumber(texto, /I\.S\.P\.T\. Asimilados\s+([\d,]+)/);
    const retencion_profesionales = extractNumber(texto, /Retencion servicios profesionales\s+([\d,]+)/);
    const retencion_resico = extractNumber(texto, /Retencion RESICO\s+([\d,]+)/);
    const compensacion = extractNumber(texto, /Compensación\s+([\d,]+)/);
    const total = extractNumber(texto, /Total\s+([\d,]+)/);

    const cumplimiento_sat = extractTexto(texto, /IMPUESTOS FEDERALES \(SAT\)\s+(\w+)/);
    const cumplimiento_conta = extractTexto(texto, /CONTABILIDAD ELECTRÓNICA\s+(\w+)/);
    const cumplimiento_imss = extractTexto(texto, /IMSS\s+(\w+)/);
    const cumplimiento_infonavit = extractTexto(texto, /INFONAVIT\s+(\w+)/);
    const cumplimiento_nominas = extractTexto(texto, /IMPUESTO SOBRE NÓMINAS\s+(\w+)/);

    // ✅ Guardar archivo en tabla documentos
    const [docResult] = await db.query(`
      INSERT INTO documentos (
        nombre, descripcion, ruta_archivo, tipo_archivo, tamano_archivo,
        id_categoria, id_cliente, id_empleado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        file.originalname,
        'Informe mensual automatizado',
        file.path,
        file.mimetype,
        file.size,
        1, 1, 1
      ]
    );

    const id_documento = docResult.insertId;

    // ✅ Guardar análisis en informes_pdf
    await db.query(`
      INSERT INTO informes_pdf (
        id_documento, ingresos_2025, ingresos_2024, coeficiente_2025, coeficiente_2024,
        isr, iva, retencion_salarios, ispt_asimilados, retencion_profesionales, retencion_resico,
        compensacion, total_impuestos, cumplimiento_sat, cumplimiento_contabilidad,
        cumplimiento_imss, cumplimiento_infonavit, cumplimiento_nominas
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_documento, ingresos_2025, ingresos_2024, coef_2025, coef_2024, isr, iva, retencion_salarios,
        ispt_asimilados, retencion_profesionales, retencion_resico, compensacion, total,
        cumplimiento_sat, cumplimiento_conta, cumplimiento_imss, cumplimiento_infonavit, cumplimiento_nominas
      ]
    );

    res.status(201).json({ message: 'Informe procesado y guardado con éxito.' });

  } catch (error) {
    console.error('Error al procesar PDF:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// 📌 Funciones auxiliares
function extractNumber(text, regex) {
  const match = text.match(regex);
  if (!match || !match[1]) return 0;
  return parseFloat(match[1].replace(/,/g, '')) || 0;
}

function extractTexto(text, regex) {
  const match = text.match(regex);
  return match ? match[1] : null;
}
