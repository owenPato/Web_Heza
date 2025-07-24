import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import pool from '../config/db.js';

export const registrarReporteEFOS = async (req, res) => {
  try {
    const { id } = req.params;
    const { anio, mes } = req.query;
    const id_cliente = id;
    const nombreArchivo = 'Reporte efos.pdf';
    const categoria = 7;

    if (!anio || !mes) {
      return res.status(400).json({ error: 'Faltan anio o mes en la consulta' });
    }

    // 🔍 Obtener nombre de la empresa
    const [clientes] = await pool.query('SELECT empresa FROM clientes WHERE id = ?', [id_cliente]);
    if (!clientes.length) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const empresa = clientes[0].empresa.trim();

    // 🧱 Construir ruta base
    const rutaBase = process.env.RUTA_ENTREGABLES
      .replace('%EMPRESA%', empresa)
      .replace('%ANIO%', anio)
      .replace('%MES%', mes);

    const rutaCompleta = path.resolve(rutaBase, nombreArchivo);

    // 🧪 Validar existencia del archivo
    if (!fs.existsSync(rutaCompleta)) {
      return res.status(404).json({ error: 'Archivo Reporte efos.pdf no encontrado' });
    }

    // 🚫 Validar si ya existe en documentos (por año, mes, cliente y categoría)
    const [yaExiste] = await pool.query(`
      SELECT id FROM documentos 
      WHERE id_cliente = ? AND id_categoria = ? AND nombre = ? AND anio = ? AND mes = ?
    `, [id_cliente, categoria, nombreArchivo, anio, mes]);

    if (yaExiste.length > 0) {
      return res.status(409).json({ mensaje: '⚠️ El Reporte EFOS ya fue registrado en ese mes' });
    }

    // 📦 Metadata del archivo
    const stats = fs.statSync(rutaCompleta);
    const tipoArchivo = mime.lookup(rutaCompleta) || 'application/pdf';
    const rutaRelativa = path.relative(process.env.NETWORK_DRIVE_PATH, rutaCompleta).replace(/\\/g, '/');

    // ✅ Insertar en documentos
    const [result] = await pool.query(`
      INSERT INTO documentos 
      (nombre, descripcion, ruta_archivo, tipo_archivo, tamano_archivo, id_categoria, id_cliente, anio, mes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      nombreArchivo,
      'Reporte de EFOS',
      rutaRelativa,
      tipoArchivo,
      stats.size,
      categoria,
      id_cliente,
      anio,
      mes
    ]);

    const id_documento = result.insertId;

    // 🔄 Validar que no exista ya en check_docs
    const [checkExist] = await pool.query(`
      SELECT id FROM check_docs WHERE id_documento = ? AND id_cliente = ?
    `, [id_documento, id_cliente]);

    if (checkExist.length === 0) {
      await pool.query(`
        INSERT INTO check_docs (id_documento, id_cliente) VALUES (?, ?)
      `, [id_documento, id_cliente]);
    }

    // 🎉 Respuesta final
    res.status(201).json({
      message: '✅ Reporte EFOS registrado exitosamente',
      id_documento
    });

  } catch (err) {
    console.error('❌ Error Reporte EFOS:', err);
    res.status(500).json({ error: 'Error interno', detalle: err.message });
  }
};


export const obtenerReporteEFOS = async (req, res) => {
  try {
    const { id } = req.params;

    const [cliente] = await pool.query('SELECT empresa FROM clientes WHERE id = ?', [id]);
    if (!cliente.length) return res.status(404).json({ error: 'Cliente no encontrado' });

    const [documentos] = await pool.query(`
      SELECT * FROM documentos
      WHERE id_cliente = ? AND id_categoria = 7
      ORDER BY fecha_subida DESC
    `, [id]);

    if (!documentos.length) return res.status(404).json({ error: 'No se encontró Reporte EFOS' });

    res.status(200).json({ cliente: cliente[0].empresa, reporte_efos: documentos[0] });
  } catch (err) {
    console.error('❌ Error al obtener Reporte EFOS:', err);
    res.status(500).json({ error: 'Error interno', detalle: err.message });
  }
};
