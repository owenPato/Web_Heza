import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import pool from '../config/db.js';

export const registrarBuzon = async (req, res) => {
  try {
    const { id } = req.params;
    const { anio, mes } = req.query;  // ← CAMBIO CLAVE: antes estaba en req.body

    const id_cliente = id;
    const nombre_archivo = 'Buzon Tributario.pdf';
    const categoria = 3;

    if (!id_cliente || !anio || !mes) {
      return res.status(400).json({ error: 'Faltan datos requeridos (cliente, año o mes)' });
    }

    const [clientes] = await pool.query('SELECT empresa FROM clientes WHERE id = ?', [id_cliente]);
    if (!clientes.length) return res.status(404).json({ error: 'Cliente no encontrado' });

    const empresa = clientes[0].empresa.trim();
    const basePath = process.env.RUTA_CLIENTES || 'P:\\';
    const rutaCompleta = path.join(basePath, empresa, anio, mes, 'Entregable', nombre_archivo);

    if (!fs.existsSync(rutaCompleta)) {
      return res.status(404).json({ error: 'Archivo Buzón Tributario.pdf no encontrado' });
    }

    // ✅ Validar si ya existe en ese mes
    const [yaExiste] = await pool.query(`
      SELECT id FROM documentos 
      WHERE id_cliente = ? AND id_categoria = ? AND nombre = ?
        AND anio = ? AND mes = ?
    `, [id_cliente, categoria, nombre_archivo, anio, mes]);

    if (yaExiste.length > 0) {
      return res.status(409).json({ mensaje: '⚠️ El documento Buzón Tributario ya fue registrado en ese mes' });
    }

    const stats = fs.statSync(rutaCompleta);
    const tipo_archivo = mime.lookup(rutaCompleta) || 'application/pdf';
    const rutaRelativa = path.relative(basePath, rutaCompleta).replace(/\\/g, '/');

    const [result] = await pool.query(`
      INSERT INTO documentos 
      (nombre, descripcion, ruta_archivo, tipo_archivo, tamano_archivo, id_categoria, id_cliente, anio, mes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      nombre_archivo,
      'Documento Buzón Tributario',
      rutaRelativa,
      tipo_archivo,
      stats.size,
      categoria,
      id_cliente,
      anio,
      mes
    ]);
    await pool.query(
      `INSERT INTO visitables_docs (id_documento, id_cliente) VALUES (?, ?)`,
      [result.insertId, id_cliente]
    );
    res.status(201).json({
      message: '✅ Buzón Tributario registrado exitosamente',
      id_documento: result.insertId,
      ruta: rutaRelativa
    });

  } catch (error) {
    console.error('❌ Error al registrar Buzón Tributario:', error);
    res.status(500).json({ error: 'Error interno', detalle: error.message });
  }
};



export const obtenerBuzon = async (req, res) => {
  try {
    const { id } = req.params;

    const [cliente] = await pool.query('SELECT empresa FROM clientes WHERE id = ?', [id]);
    if (!cliente.length) return res.status(404).json({ error: 'Cliente no encontrado' });

    const [documentos] = await pool.query(`
      SELECT d.id, d.nombre, d.descripcion, d.ruta_archivo, d.tipo_archivo, d.tamano_archivo, d.fecha_subida
      FROM documentos d
      WHERE d.id_cliente = ? AND d.id_categoria = 3
      ORDER BY d.fecha_subida DESC
    `, [id]);

    if (!documentos.length) {
      return res.status(404).json({ error: 'No se encontró Buzón Tributario para este cliente' });
    }

    res.status(200).json({
      cliente: cliente[0].empresa,
      buzon_tributario: documentos[0]
    });

  } catch (error) {
    console.error('❌ Error al obtener Buzón Tributario:', error);
    res.status(500).json({ error: 'Error interno', detalle: error.message });
  }
};
