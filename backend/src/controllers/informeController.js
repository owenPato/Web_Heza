import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mime from 'mime-types';
import pool from '../config/db.js';

export const registrarInformeMensual = async (req, res) => {
  try {
    const { id } = req.params;
    const { anio, mes } = req.query;
    const id_cliente = id;
    const nombre_archivo = 'Informe mensual.pdf';
    const categoria = 4;

    if (!id_cliente || !anio || !mes) {
      return res.status(400).json({ error: 'Faltan datos: id_cliente, anio o mes' });
    }

    const [clientes] = await pool.query('SELECT empresa FROM clientes WHERE id = ?', [id_cliente]);
    if (!clientes.length) return res.status(404).json({ error: 'Cliente no encontrado' });

    const empresa = clientes[0].empresa.trim();

    const rutaBase = process.env.RUTA_ENTREGABLES
      .replace('%EMPRESA%', empresa)
      .replace('%ANIO%', anio)
      .replace('%MES%', mes);

    const rutaCompleta = path.resolve(rutaBase, nombre_archivo);

    if (!fs.existsSync(rutaCompleta)) {
      return res.status(404).json({ error: 'Archivo Informe mensual.pdf no encontrado' });
    }

    // Validar si ya existe el documento para ese cliente, anio y mes
    const [yaExiste] = await pool.query(`
      SELECT id FROM documentos 
      WHERE id_cliente = ? AND id_categoria = ? AND nombre = ?
        AND anio = ? AND mes = ?
    `, [id_cliente, categoria, nombre_archivo, anio, mes]);

    if (yaExiste.length) {
      return res.status(409).json({ mensaje: '⚠️ Informe mensual ya registrado en ese mes para este cliente' });
    }

    const stats = fs.statSync(rutaCompleta);
    const tipo_archivo = mime.lookup(rutaCompleta) || 'application/pdf';
    const rutaRelativa = path.relative(process.env.NETWORK_DRIVE_PATH, rutaCompleta).replace(/\\/g, '/');

    const [result] = await pool.query(`
      INSERT INTO documentos 
      (nombre, descripcion, ruta_archivo, tipo_archivo, tamano_archivo, id_categoria, id_cliente, anio, mes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      nombre_archivo,
      'Documento Informe mensual',
      rutaRelativa,
      tipo_archivo,
      stats.size,
      categoria,
      id_cliente,
      anio,
      mes
    ]);

    await pool.query(`INSERT INTO check_docs (id_documento, id_cliente) VALUES (?, ?)`, [result.insertId, id_cliente]);

    res.status(201).json({
      message: '✅ Informe mensual registrado exitosamente',
      id_documento: result.insertId,
      ruta: rutaRelativa
    });

  } catch (error) {
    console.error('❌ Error al registrar Informe mensual:', error);
    res.status(500).json({ error: 'Error interno', detalle: error.message });
  }
};

export const obtenerInformeMensual = async (req, res) => {
  try {
    const { id } = req.params;

    const [cliente] = await pool.query('SELECT empresa FROM clientes WHERE id = ?', [id]);
    if (!cliente.length) return res.status(404).json({ error: 'Cliente no encontrado' });

    const [documentos] = await pool.query(`
      SELECT d.id, d.nombre, d.descripcion, d.ruta_archivo, d.tipo_archivo, d.tamano_archivo, d.fecha_subida
      FROM documentos d
      WHERE d.id_cliente = ? AND d.id_categoria = 4
      ORDER BY d.fecha_subida DESC
    `, [id]);

    if (!documentos.length) {
      return res.status(404).json({ error: 'No se encontró Informe mensual para este cliente' });
    }

    res.status(200).json({
      cliente: cliente[0].empresa,
      informe_mensual: documentos[0]
    });

  } catch (error) {
    console.error('❌ Error al obtener Informe mensual:', error);
    res.status(500).json({ error: 'Error interno', detalle: error.message });
  }
};

const DRIVE_BASE = process.env.NETWORK_DRIVE_PATH || 'P:\\';

export const procesarInformeMensualDesdeBD = async (req, res) => {
  try {
    const { id } = req.params;
    const id_cliente = parseInt(id, 10);
    if (!id_cliente) {
      return res.status(400).json({ error: 'Falta el ID del cliente' });
    }

    // Buscar el documento ya registrado
    const [docs] = await pool.query(
      `SELECT id, ruta_archivo FROM documentos 
       WHERE id_cliente = ? AND id_categoria = 4 
       ORDER BY fecha_subida DESC LIMIT 1`,
      [id_cliente]
    );

    if (!docs.length) {
      return res.status(404).json({ error: 'No se encontró el documento Informe mensual en BD' });
    }

    const { id: id_documento, ruta_archivo } = docs[0];
    const rutaCompleta = path.join(DRIVE_BASE, ruta_archivo.replace(/\//g, '\\'));

    if (!fs.existsSync(rutaCompleta)) {
      return res.status(404).json({ error: 'Archivo no existe en la ruta compartida' });
    }

    const dataBuffer = fs.readFileSync(rutaCompleta);
    const pdfData = await pdfParse(dataBuffer);
    const texto = pdfData.text;

    // Extracción de datos
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

    // Guardar datos extraídos
    await pool.query(`
  INSERT INTO informes_pdf (
    id_documento, ingresos_2025, ingresos_2024, coeficiente_2025, coeficiente_2024,
    isr, iva, retencion_salarios, ispt_asimilados, retencion_profesionales, retencion_resico,
    compensacion, total_impuestos, cumplimiento_sat, cumplimiento_contabilidad,
    cumplimiento_imss, cumplimiento_infonavit, cumplimiento_nominas
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    ingresos_2025 = VALUES(ingresos_2025),
    ingresos_2024 = VALUES(ingresos_2024),
    coeficiente_2025 = VALUES(coeficiente_2025),
    coeficiente_2024 = VALUES(coeficiente_2024),
    isr = VALUES(isr),
    iva = VALUES(iva),
    retencion_salarios = VALUES(retencion_salarios),
    ispt_asimilados = VALUES(ispt_asimilados),
    retencion_profesionales = VALUES(retencion_profesionales),
    retencion_resico = VALUES(retencion_resico),
    compensacion = VALUES(compensacion),
    total_impuestos = VALUES(total_impuestos),
    cumplimiento_sat = VALUES(cumplimiento_sat),
    cumplimiento_contabilidad = VALUES(cumplimiento_contabilidad),
    cumplimiento_imss = VALUES(cumplimiento_imss),
    cumplimiento_infonavit = VALUES(cumplimiento_infonavit),
    cumplimiento_nominas = VALUES(cumplimiento_nominas)
`,
  [
    id_documento, ingresos_2025, ingresos_2024, coef_2025, coef_2024, isr, iva,
    retencion_salarios, ispt_asimilados, retencion_profesionales, retencion_resico,
    compensacion, total, cumplimiento_sat, cumplimiento_conta,
    cumplimiento_imss, cumplimiento_infonavit, cumplimiento_nominas
  ]
);

    res.status(200).json({
  message: '✅ Informe mensual procesado y guardado desde archivo en BD.',
  datos_extraidos: {
    ingresos_2025,
    ingresos_2024,
    coef_2025,
    coef_2024,
    isr,
    iva,
    retencion_salarios,
    ispt_asimilados,
    retencion_profesionales,
    retencion_resico,
    compensacion,
    total,
    cumplimiento_sat,
    cumplimiento_conta,
    cumplimiento_imss,
    cumplimiento_infonavit,
    cumplimiento_nominas
  }
});

  } catch (err) {
    console.error('❌ Error al procesar informe desde BD:', err);
    res.status(500).json({ error: 'Error al procesar informe', detalle: err.message });
  }
};

// Helpers
function extractNumber(text, regex) {
  const match = text.match(regex);
  return match ? parseFloat(match[1].replace(/,/g, '')) || 0 : 0;
}

function extractTexto(text, regex) {
  const match = text.match(regex);
  return match ? match[1] : null;
}