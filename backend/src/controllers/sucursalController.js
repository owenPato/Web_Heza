import pool from '../config/db.js';

export const obtenerSucursalesActivas = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nombre FROM sucursales WHERE activo = 1');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener sucursales:', error);
    res.status(500).json({ error: 'Error al obtener sucursales activas' });
  }
};