import pool from '../config/db.js';

export const getPuestos = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [puestos] = await connection.query('SELECT id, nombre FROM puestos');
    connection.release();
    res.json(puestos);
  } catch (error) {
    console.error('Error al obtener puestos:', error);
    res.status(500).json({ error: 'Error al obtener puestos' });
  }
};