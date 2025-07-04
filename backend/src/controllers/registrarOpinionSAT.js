import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import pool from '../config/db.js';

export const registrarOpinionSAT = async (req, res) => {
  try {
    const { id } = req.params;
    const id_cliente = id;
    const anio = '2025';
    const mes = '05 Mayo';
    const nombreArchivo = 'OPINION SAT.pdf';
    const categoria = 6;

    const [clientes] = await pool.query('SELECT empresa FROM clientes WHERE id = ?', [id_cliente]);
    if (!clientes.length) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const empresa = clientes[0].empresa.trim();
    const basePath = process.env.RUTA_CLIENTES || 'P:\\';
    const rutaCompleta = path.join(basePath, empresa, anio, mes, 'Entregable', nombreArchivo);

    if (!fs.existsSync(rutaCompleta)) {
      return res.status(404).json({ error: 'Archivo Opinión SAT no encontrado' });
    }

    const ahora = new Date();
    const anioActual = ahora.getFullYear();
    const mesActual = ahora.getMonth() + 1;

    const [yaExiste] = await pool.query(`
      SELECT id FROM documentos 
      WHERE id_cliente = ? AND id_categoria = ? AND nombre = ?
        AND YEAR(fecha_subida) = ? AND MONTH(fecha_subida) = ?`,
      [id_cliente, categoria, nombreArchivo, anioActual, mesActual]
    );

    if (yaExiste.length) {
      return res.status(409).json({ mensaje: '⚠️ Opinión SAT ya registrada este mes' });
    }

    const stats = fs.statSync(rutaCompleta);
    const tipoArchivo = mime.lookup(rutaCompleta) || 'application/pdf';
    const rutaRelativa = path.relative(basePath, rutaCompleta).replace(/\\/g, '/');

    const [result] = await pool.query(`
      INSERT INTO documentos 
      (nombre, descripcion, ruta_archivo, tipo_archivo, tamano_archivo, id_categoria, id_cliente)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nombreArchivo,
        'Documento Opinión SAT',
        rutaRelativa,
        tipoArchivo,
        stats.size,
        categoria,
        id_cliente
      ]
    );

    await pool.query(`INSERT INTO constancias_docs (id_documento, id_cliente) VALUES (?, ?)`, [result.insertId, id_cliente]);

    res.status(201).json({
      message: '✅ Opinión SAT registrada exitosamente',
      id_documento: result.insertId
    });

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

