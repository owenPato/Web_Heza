import pool from '../config/db.js';

export const crearSolicitud = async (req, res) => {
  const { cliente_id, tipo, mensaje } = req.body;

  if (!cliente_id || !tipo) {
    return res.status(400).json({ error: 'cliente_id y tipo son requeridos' });
  }

  try {
    // (Opcional) valida que exista el cliente para evitar FK 1452
    const [clienteRows] = await pool.query(
      'SELECT id FROM clientes WHERE id = ? LIMIT 1',
      [cliente_id]
    );
    if (clienteRows.length === 0) {
      return res.status(404).json({ error: 'El cliente especificado no existe' });
    }

    const [result] = await pool.query(
      `INSERT INTO solicitudes (cliente_id, tipo, mensaje, fecha_creacion)
       VALUES (?, ?, ?, NOW())`,
      [cliente_id, tipo, mensaje || '']
    );

    return res.status(201).json({ mensaje: 'Solicitud creada', id: result.insertId });
  } catch (err) {
    // Manejo FK: MySQL 1452 / mysql2 code 'ER_NO_REFERENCED_ROW_2'
    if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.errno === 1452) {
      return res.status(400).json({ error: 'cliente_id no válido (FK)' });
    }
    console.error('❌ Error al crear solicitud:', err);
    return res.status(500).json({ error: 'Error al guardar la solicitud' });
  }
};

export const obtenerSolicitudesPorCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;

    const [rows] = await pool.query(
      `SELECT *
       FROM solicitudes
       WHERE cliente_id = ?
       ORDER BY fecha_creacion DESC`,
      [clienteId]
    );

    return res.json(rows);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    return res.status(500).json({ error: 'Error al obtener las solicitudes.' });
  }
};