import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import pool from '../config/db.js';

export const registrarOpinionSAT = async (req, res) => {
  try {
    const { id } = req.params;
    const anio = '2025';
    const mes = '05 Mayo';
    const nombre_archivo = 'OPINION SAT.pdf';
    const categoria = 6;

    if (!id) return res.status(400).json({ error: 'Falta el ID del cliente' });

    const [clientes] = await pool.query('SELECT empresa FROM clientes WHERE id = ?', [id]);
    if (!clientes.length) return res.status(404).json({ error: 'Cliente no encontrado' });

    const empresa = clientes[0].empresa.trim();
    const basePath = process.env.RUTA_CLIENTES || 'P:\\';
    const rutaCompleta = path.join(basePath, empresa, anio, mes, 'Entregable', nombre_archivo);

    if (!fs.existsSync(rutaCompleta)) {
      return res.status(404).json({ error: 'Archivo OPINION SAT.pdf no encontrado' });
    }

    const stats = fs.statSync(rutaCompleta);
    const tipo_archivo = mime.lookup(rutaCompleta) || 'application/pdf';
    const rutaRelativa = path.relative(basePath, rutaCompleta).replace(/\\/g, '/');

    const [result] = await pool.query(`
      INSERT INTO documentos 
      (nombre, descripcion, ruta_archivo, tipo_archivo, tamano_archivo, id_categoria, id_cliente)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre_archivo,
        'Documento Opinión SAT',
        rutaRelativa,
        tipo_archivo,
        stats.size,
        categoria,
        id
      ]
    );

    res.status(200).json({ message: 'Opinión SAT registrada exitosamente', id_documento: result.insertId });

  } catch (err) {
    console.error('❌ Error Opinión SAT:', err);
    res.status(500).json({ error: 'Error interno', detalle: err.message });
  }
};

export const obtenerOpinionSAT = async (req, res) => {
  try {
    const { id } = req.params;

    const [cliente] = await pool.query('SELECT empresa FROM clientes WHERE id = ?', [id]);
    if (!cliente.length) return res.status(404).json({ error: 'Cliente no encontrado' });

    const [documentos] = await pool.query(`
      SELECT * FROM documentos
      WHERE id_cliente = ? AND id_categoria = 6
      ORDER BY fecha_subida DESC
    `, [id]);

    if (!documentos.length) return res.status(404).json({ error: 'No se encontró Opinión SAT' });

    res.status(200).json({ cliente: cliente[0].empresa, opinion_sat: documentos[0] });

  } catch (err) {
    console.error('❌ Error al obtener Opinión SAT:', err);
    res.status(500).json({ error: 'Error interno', detalle: err.message });
  }
};

