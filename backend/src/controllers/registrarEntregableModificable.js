import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import pool from '../config/db.js';

export const registrarEntregableModificable = async (req, res) => {
  try {
    const { id } = req.params;
    const { anio, mes } = req.query;

    const id_cliente = id;
    const nombreArchivo = 'Entregable Modificable.pdf';
    const categoria = 8;

    if (!id_cliente || !anio || !mes) {
      return res.status(400).json({ error: 'Faltan datos requeridos: cliente, año o mes' });
    }

    // Obtener nombre de empresa
    const [clientes] = await pool.query('SELECT empresa FROM clientes WHERE id = ?', [id_cliente]);
    if (!clientes.length) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const nombreEmpresa = clientes[0].empresa.trim();
    const rutaBase = process.env.RUTA_ENTREGABLES
      .replace('%EMPRESA%', nombreEmpresa)
      .replace('%ANIO%', anio)
      .replace('%MES%', mes);

    const rutaCompleta = path.resolve(rutaBase, nombreArchivo);

    if (!fs.existsSync(rutaCompleta)) {
      return res.status(404).json({ error: 'Archivo no encontrado en la ruta esperada' });
    }

    // Validar si ya existe
    const [existe] = await pool.query(`
      SELECT id FROM documentos 
      WHERE id_cliente = ? AND id_categoria = ? AND nombre = ? AND anio = ? AND mes = ?
    `, [id_cliente, categoria, nombreArchivo, anio, mes]);

    if (existe.length) {
      return res.status(409).json({ mensaje: 'Este entregable ya fue registrado para ese mes' });
    }

    const stats = fs.statSync(rutaCompleta);
    const tipoArchivo = mime.lookup(rutaCompleta) || 'application/pdf';
    const rutaRelativa = path.relative(process.env.NETWORK_DRIVE_PATH, rutaCompleta).replace(/\\/g, '/');

    // ✅ Inserción en documentos con captura de insertId
    const [result] = await pool.query(`
      INSERT INTO documentos 
      (nombre, descripcion, ruta_archivo, tipo_archivo, tamano_archivo, id_categoria, id_cliente, anio, mes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      nombreArchivo,
      'Documento entregable modificable',
      rutaRelativa,
      tipoArchivo,
      stats.size,
      categoria,
      id_cliente,
      anio,
      mes
    ]);

    const id_documento = result.insertId;

    // 🔄 Registrar en check_docs (si no está duplicado)
    const [checkExist] = await pool.query(`
      SELECT id FROM check_docs WHERE id_documento = ? AND id_cliente = ?
    `, [id_documento, id_cliente]);

    if (checkExist.length === 0) {
      await pool.query(`
        INSERT INTO check_docs (id_documento, id_cliente) VALUES (?, ?)
      `, [id_documento, id_cliente]);
    }

    res.status(201).json({
      message: '✅ Entregable Modificable registrado con éxito',
      id_documento
    });

  } catch (error) {
    console.error('❌ Error al registrar entregable modificable:', error);
    res.status(500).json({ error: 'Error interno', detalle: error.message });
  }
};


export const obtenerEntregableModificable = async (req, res) => {
  try {
    const { id } = req.params;

    const [cliente] = await pool.query('SELECT empresa FROM clientes WHERE id = ?', [id]);
    if (!cliente.length) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const [documentos] = await pool.query(`
      SELECT d.id, d.nombre, d.descripcion, d.ruta_archivo, d.tipo_archivo, d.tamano_archivo, 
             d.fecha_subida, c.nombre AS categoria
      FROM documentos d
      JOIN categorias_documentos c ON d.id_categoria = c.id
      WHERE d.id_cliente = ? AND d.id_categoria = 8
      ORDER BY d.fecha_subida DESC
    `, [id]);

    if (!documentos.length) {
      return res.status(404).json({ error: 'No se encontró el Entregable Modificable para este cliente' });
    }

    res.status(200).json({ cliente: cliente[0].empresa, documentos });
  } catch (error) {
    console.error('❌ Error al obtener el entregable modificable:', error);
    res.status(500).json({ error: 'Error interno', detalle: error.message });
  }
};
