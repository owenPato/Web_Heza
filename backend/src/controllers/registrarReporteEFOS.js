import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import pool from '../config/db.js';

export const registrarReporteEFOS = async (req, res) => {
  try {
    const { id } = req.params;
    const anio = '2025';
    const mes = '05 Mayo';
    const nombreArchivo = 'Reporte efos.pdf';
    const categoria = 7;

    const [clientes] = await pool.query('SELECT empresa FROM clientes WHERE id = ?', [id]);
    if (!clientes.length) return res.status(404).json({ error: 'Cliente no encontrado' });

    const empresa = clientes[0].empresa.trim();
    const basePath = process.env.RUTA_CLIENTES || 'P:\\';
    const rutaCompleta = path.join(basePath, empresa, anio, mes, 'Entregable', nombreArchivo);

    if (!fs.existsSync(rutaCompleta)) {
      return res.status(404).json({ error: 'Archivo Reporte efos.pdf no encontrado' });
    }

    const stats = fs.statSync(rutaCompleta);
    const tipoArchivo = mime.lookup(rutaCompleta) || 'application/pdf';
    const rutaRelativa = path.relative(basePath, rutaCompleta).replace(/\\/g, '/');

    const [result] = await pool.query(`
      INSERT INTO documentos 
      (nombre, descripcion, ruta_archivo, tipo_archivo, tamano_archivo, id_categoria, id_cliente)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombreArchivo, 'Documento Reporte EFOS', rutaRelativa, tipoArchivo, stats.size, categoria, id]
    );

    res.status(200).json({ message: 'Reporte EFOS registrado exitosamente', id_documento: result.insertId });
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
