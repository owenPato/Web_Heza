import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import pool from '../config/db.js';

export const registrarCSFDesdeRuta = async (req, res) => {
  const { id_cliente } = req.params;

  try {
    // 1. Buscar nombre de empresa con ese id
    const [clientes] = await pool.query(
      'SELECT empresa FROM clientes WHERE id = ?',
      [id_cliente]
    );

    if (!clientes.length) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const nombreEmpresa = clientes[0].empresa;
    const rutaCSF = path.join(
      process.env.RUTA_CLIENTES || 'P:\\',
      nombreEmpresa,
      'BD',
      'CONSTANCIA DE SITUACIÓN FISCAL',
      'CSF.pdf'
    );

    if (!fs.existsSync(rutaCSF)) {
      return res.status(404).json({ error: 'Archivo CSF.pdf no encontrado para el cliente' });
    }

    const stats = fs.statSync(rutaCSF);
    const tamano_archivo = stats.size;
    const tipo_archivo = mime.lookup(rutaCSF) || 'application/pdf';
    const nombre_archivo = 'CSF.pdf';

    // Revisar si ya está registrado (opcional)
    const [existe] = await pool.query(
      `SELECT id FROM documentos 
       WHERE id_cliente = ? AND id_categoria = ? AND nombre = ?`,
      [id_cliente, process.env.CATEGORIA_CSF || 2, nombre_archivo]
    );

    if (existe.length) {
      return res.status(409).json({ mensaje: 'CSF ya registrada previamente para este cliente' });
    }

    // Insertar
    const rutaRelativa = path.relative(process.env.RUTA_CLIENTES || 'P:\\', rutaCSF).replace(/\\/g, '/');

    const [result] = await pool.query(
      `INSERT INTO documentos 
        (nombre, descripcion, ruta_archivo, tipo_archivo, tamano_archivo, id_categoria, id_cliente) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre_archivo,
        'Constancia de situación fiscal desde archivo en red',
        rutaRelativa,
        tipo_archivo,
        tamano_archivo,
        process.env.CATEGORIA_CSF || 2,
        id_cliente
      ]
    );

    res.status(201).json({
      mensaje: 'CSF registrada correctamente',
      id_documento: result.insertId
    });

  } catch (err) {
    console.error('❌ Error al registrar CSF:', err);
    res.status(500).json({ error: 'Error interno', detalles: err.message });
  }
};

export const obtenerCSFporCliente = async (req, res) => {
  const id_cliente = req.params.id;

  try {
    // 1. Obtener nombre de empresa
    const [clientes] = await pool.query('SELECT empresa FROM clientes WHERE id = ?', [id_cliente]);
    if (!clientes.length) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const nombreEmpresa = clientes[0].empresa;
    const basePath = process.env.RUTA_CLIENTES || 'P:\\';
    const rutaRelativa = path.join(nombreEmpresa, 'BD', 'CONSTANCIA DE SITUACIÓN FISCAL', 'CSF.pdf');
    const rutaCompleta = path.join(basePath, rutaRelativa);

    // 2. Verificar si existe archivo CSF.pdf
    if (!fs.existsSync(rutaCompleta)) {
      return res.status(404).json({ error: 'Archivo CSF.pdf no encontrado para este cliente' });
    }

    // 3. Verificar si ya está en la BD
    const [existente] = await pool.query(`
      SELECT * FROM documentos 
      WHERE id_cliente = ? AND id_categoria = ? 
      AND nombre = 'CSF.pdf'
    `, [id_cliente, process.env.CATEGORIA_CSF || 2]);

    if (existente.length > 0) {
      return res.json({ message: 'CSF ya registrada', documento: existente[0] });
    }

    // 4. Insertar si no existe
    const stats = fs.statSync(rutaCompleta);
    const tamano_archivo = stats.size;
    const tipo_archivo = mime.lookup(rutaCompleta) || 'application/pdf';

    const [resultado] = await pool.query(`
      INSERT INTO documentos 
        (nombre, descripcion, ruta_archivo, tipo_archivo, tamano_archivo, id_categoria, id_cliente) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'CSF.pdf',
        'Constancia de situación fiscal',
        rutaRelativa.replace(/\\/g, '/'),
        tipo_archivo,
        tamano_archivo,
        process.env.CATEGORIA_CSF || 2,
        id_cliente
      ]
    );

    const id_documento = resultado.insertId;

    res.status(200).json({
      message: 'CSF registrada exitosamente',
      id_documento,
      ruta: rutaRelativa
    });

  } catch (err) {
    console.error('❌ Error al obtener o registrar CSF:', err);
    res.status(500).json({ error: 'Error interno', detalles: err.message });
  }
};

