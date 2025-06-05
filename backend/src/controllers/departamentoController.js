import pool from '../config/db.js';

export const getDepartamento = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [departamentos] = await connection.query('SELECT id, nombre FROM departamento');
    connection.release();
    res.json(departamentos);
  } catch (error) {
    console.error('Error al obtener departamentos:', error);
    res.status(500).json({ error: 'Error al obtener departamentos' });
  }
};
