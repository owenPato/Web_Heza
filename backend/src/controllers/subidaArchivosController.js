// controllers/subirArchivosController.js
import fs from 'fs';
import path from 'path';
import { buildRutaCliente } from '../utils/buildRutaCliente.js';
import pool from '../config/db.js';

export const subirArchivoGenerico = async (req, res) => {
  try {
    const { id_cliente, tipo } = req.params;
    const archivo = req.file;

    if (!archivo) return res.status(400).json({ error: 'Archivo no enviado' });

    // 📌 Validación de tipo
    const tiposPermitidos = ['estados-cuenta', 'excel-movimientos', 'certificados-sat', 'kit-nomina'];
    if (!tiposPermitidos.includes(tipo)) {
      return res.status(400).json({ error: `Tipo de archivo inválido: ${tipo}` });
    }

    // 📌 1. Obtener nombre de empresa
    const [[cliente]] = await pool.query('SELECT empresa FROM clientes WHERE id = ?', [id_cliente]);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

    // 📌 2. Obtener mes y año activo
    const [[{ anio, mes }]] = await pool.query(`
      SELECT anio, mes FROM meses_entregables ORDER BY id DESC LIMIT 1
    `);

    // 📌 3. Construir ruta en red
    const rutaDestino = buildRutaCliente({ empresa: cliente.empresa, anio, mes, tipo });

    if (!fs.existsSync(rutaDestino)) {
      fs.mkdirSync(rutaDestino, { recursive: true });
    }

    const nombreArchivo = archivo.originalname;
    const destinoCompleto = path.join(rutaDestino, nombreArchivo);

    fs.writeFileSync(destinoCompleto, archivo.buffer);

    // ✅ 4. Guardar registro en DB
    await pool.query(`
      INSERT INTO documentos (nombre, ruta_archivo, tipo_archivo, tamano_archivo, id_cliente)
      VALUES (?, ?, ?, ?, ?)
    `, [
      nombreArchivo,
      path.relative(process.env.RUTA_CLIENTES, destinoCompleto).replace(/\\/g, '/'),
      archivo.mimetype,
      archivo.size,
      id_cliente
    ]);

    res.status(201).json({ mensaje: `📥 Archivo subido con éxito para tipo: ${tipo}` });

  } catch (err) {
    console.error('❌ Error al subir archivo:', err);
    res.status(500).json({ error: 'Error al guardar archivo', detalles: err.message });
  }
};
