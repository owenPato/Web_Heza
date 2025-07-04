import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import pool from '../config/db.js';

export const registrarEntregableModificable = async (req, res) => {
  try {
    const { id } = req.params;
    const id_cliente = id;
    const anio = '2025'; // puedes volverlo dinámico luego si quieres
    const mes = '05 Mayo';
    const nombreArchivo = 'Entregable Modificable.pdf';
    const categoria = 8;

    if (!id_cliente) {
      return res.status(400).json({ error: 'Falta el ID del cliente' });
    }

    // Obtener nombre de empresa
    const [clientes] = await pool.query('SELECT empresa FROM clientes WHERE id = ?', [id_cliente]);
    if (clientes.length === 0) {
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

    // Obtener fecha actual
    const ahora = new Date();
    const anioActual = ahora.getFullYear();
    const mesActual = ahora.getMonth() + 1;

    // Validar si ya existe este documento para este mes y cliente
    const [existe] = await pool.query(`
      SELECT d.id FROM documentos d
      WHERE d.id_cliente = ? AND d.id_categoria = ? AND d.nombre = ?
        AND YEAR(d.fecha_subida) = ? AND MONTH(d.fecha_subida) = ?
    `, [id_cliente, categoria, nombreArchivo, anioActual, mesActual]);

    if (existe.length) {
      return res.status(409).json({ mensaje: 'Este entregable ya fue registrado este mes' });
    }

    const stats = fs.statSync(rutaCompleta);
    const tipo_archivo = mime.lookup(rutaCompleta) || 'application/pdf';
    const rutaRelativa = path.relative(process.env.NETWORK_DRIVE_PATH, rutaCompleta).replace(/\\/g, '/');

    const [result] = await pool.query(`
      INSERT INTO documentos 
      (nombre, descripcion, ruta_archivo, tipo_archivo, tamano_archivo, id_categoria, id_cliente)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nombreArchivo,
        'Documento entregable modificable',
        rutaRelativa,
        tipo_archivo,
        stats.size,
        categoria,
        id_cliente
      ]
    );
    
    await pool.query(`INSERT INTO check_docs (id_documento, id_cliente) VALUES (?, ?)`, [result.insertId, id_cliente]);

    res.status(201).json({
      message: '✅ Entregable Modificable registrado con éxito',
      id_documento: result.insertId
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
