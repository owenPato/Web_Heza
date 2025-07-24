import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import pool from '../config/db.js';
import { construirRutaEntregable } from '../utils/rutaEntregables.js';

export const registrarOpinionIMSS = async (req, res) => {
  try {
    const { id } = req.params;
    const { anio, mes } = req.query;

    if (!anio || !mes) {
      return res.status(400).json({ error: 'Falta año o mes en la consulta' });
    }

    const id_cliente = id;
    const nombreArchivo = 'Opinion imss.pdf';
    const categoria = 5;

    // Buscar empresa
    const [clientes] = await pool.query('SELECT empresa FROM clientes WHERE id = ?', [id_cliente]);
    if (!clientes.length) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const empresa = clientes[0].empresa.trim();

    // Construir ruta dinámica
    const rutaBase = construirRutaEntregable({ empresa, anio, mes });
    const rutaCompleta = path.join(rutaBase, nombreArchivo);

    if (!fs.existsSync(rutaCompleta)) {
      return res.status(404).json({ error: 'Archivo Opinión IMSS no encontrado' });
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
      return res.status(409).json({ mensaje: '⚠️ Opinión IMSS ya registrada este mes' });
    }

    const stats = fs.statSync(rutaCompleta);
    const tipoArchivo = mime.lookup(rutaCompleta) || 'application/pdf';
    const rutaRelativa = path.relative(process.env.RUTA_CLIENTES, rutaCompleta).replace(/\\/g, '/');

  const [result] = await pool.query(`
  INSERT INTO documentos 
  (nombre, descripcion, ruta_archivo, tipo_archivo, tamano_archivo, id_categoria, id_cliente, anio, mes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`, [
  nombreArchivo,
  'Documento Opinión IMSS',
  rutaRelativa,
  tipoArchivo,
  stats.size,
  categoria,
  id_cliente,
  anio,
  mes
]);


    await pool.query(`INSERT INTO constancias_docs (id_documento, id_cliente) VALUES (?, ?)`, [result.insertId, id_cliente]);

    res.status(201).json({
      message: '✅ Opinión IMSS registrada exitosamente',
      id_documento: result.insertId
    });

  } catch (err) {
    console.error('❌ Error Opinión IMSS:', err);
    res.status(500).json({ error: 'Error interno', detalle: err.message });
  }
};
export const obtenerOpinionIMSS = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Buscar empresa
    const [cliente] = await pool.query('SELECT empresa FROM clientes WHERE id = ?', [id]);
    if (!cliente.length) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // 2. Buscar últimos documentos categoría 5 (Opinión IMSS)
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
      opinion_imss: documentos[0]  // ← último documento subido
    });

  } catch (error) {
    console.error('❌ Error al obtener Opinión IMSS:', error);
    res.status(500).json({ error: 'Error interno', detalle: error.message });
  }
};
