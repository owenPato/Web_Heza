import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import pool from '../config/db.js';

export const registrarOpinionIMSS = async (req, res) => {
  try {
    const { id } = req.params;
    const anio = '2025';
    const mes = '05 Mayo';
    const nombre_archivo = 'Opinion imss.pdf';
    const categoria = 5;

    if (!id) {
      return res.status(400).json({ error: 'Falta el id del cliente' });
    }

    const [clientes] = await pool.query('SELECT empresa FROM clientes WHERE id = ?', [id]);
    if (!clientes.length) return res.status(404).json({ error: 'Cliente no encontrado' });

    const empresa = clientes[0].empresa.trim();
    const basePath = process.env.RUTA_CLIENTES || 'P:\\';
    const rutaCompleta = path.join(basePath, empresa, anio, mes, 'Entregable', nombre_archivo);

    if (!fs.existsSync(rutaCompleta)) {
      return res.status(404).json({ error: 'Archivo Opinión IMSS no encontrado' });
    }

    const stats = fs.statSync(rutaCompleta);
    const tipo_archivo = mime.lookup(rutaCompleta) || 'application/pdf';
    const rutaRelativa = path.relative(basePath, rutaCompleta).replace(/\\/g, '/');

    const [result] = await pool.query(
      `INSERT INTO documentos 
       (nombre, descripcion, ruta_archivo, tipo_archivo, tamano_archivo, id_categoria, id_cliente)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre_archivo,
        'Documento Opinión IMSS',
        rutaRelativa,
        tipo_archivo,
        stats.size,
        categoria,
        id
      ]
    );

    res.status(200).json({
      message: 'Opinión IMSS registrada exitosamente',
      id_documento: result.insertId,
      ruta: rutaRelativa
    });

  } catch (error) {
    console.error('❌ Error al registrar Opinión IMSS:', error);
    res.status(500).json({ error: 'Error interno', detalle: error.message });
  }
};

export const obtenerOpinionIMSS = async (req, res) => {
  try {
    const { id } = req.params;

    const [cliente] = await pool.query('SELECT empresa FROM clientes WHERE id = ?', [id]);
    if (!cliente.length) return res.status(404).json({ error: 'Cliente no encontrado' });

    const [documentos] = await pool.query(`
      SELECT d.id, d.nombre, d.descripcion, d.ruta_archivo, d.tipo_archivo, d.tamano_archivo, d.fecha_subida
      FROM documentos d
      WHERE d.id_cliente = ? AND d.id_categoria = 5
      ORDER BY d.fecha_subida DESC
    `, [id]);

    if (!documentos.length) {
      return res.status(404).json({ error: 'No se encontró Opinión IMSS para este cliente' });
    }

    res.status(200).json({
      cliente: cliente[0].empresa,
      opinion_imss: documentos[0]
    });

  } catch (error) {
    console.error('❌ Error al obtener Opinión IMSS:', error);
    res.status(500).json({ error: 'Error interno', detalle: error.message });
  }
};
