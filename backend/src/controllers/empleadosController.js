import pool from '../config/db.js';

// 📥 GET - Obtener todos los empleados
const obtenerEmpleados = async (req, res) => {
  const { sede_id } = req.query;

  try {
    const connection = await pool.getConnection();

    const query = `
      SELECT 
        e.id AS empleado_id,
        u.id AS user_id,
        u.nombre,
        u.email,
        u.telefono,
        e.fecha_contratacion,
        e.solicitud_id,
        e.departamento_id,
        e.puesto_id,
        p.nombre AS puesto_nombre,
        d.nombre AS departamento_nombre
      FROM empleados e
      LEFT JOIN users u ON u.id = e.user_id
      LEFT JOIN puestos p ON p.id = e.puesto_id
      LEFT JOIN departamento d ON d.id = e.departamento_id
      ${sede_id ? 'WHERE u.sede_id = ?' : ''}
    `;

    const [empleados] = await connection.query(query, sede_id ? [sede_id] : []);
    connection.release();

    res.json(empleados);

  } catch (error) {
    console.error("Error al obtener empleados:", error);
    res.status(500).json({ error: "Error al obtener empleados" });
  }
};

// 🗑️ DELETE - Eliminar empleado + su usuario
const eliminarEmpleado = async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await pool.getConnection();

    // Obtener user_id antes de eliminar
    const [[empleado]] = await connection.query(`SELECT user_id FROM empleados WHERE id = ?`, [id]);

    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    await connection.query(`DELETE FROM empleados WHERE id = ?`, [id]);
    await connection.query(`DELETE FROM users WHERE id = ?`, [empleado.user_id]);

    connection.release();
    res.json({ message: 'Empleado y usuario eliminados correctamente' });
  } catch (error) {
    console.error("Error al eliminar empleado:", error);
    res.status(500).json({ error: "Error al eliminar empleado" });
  }
};

// ✏️ PUT - Editar empleado
const editarEmpleado = async (req, res) => {
  const { id } = req.params;
  const {
    email,
    telefono,
    departamento_id,
    puesto_id
  } = req.body;

  try {
    const connection = await pool.getConnection();

    // 1. Obtener el user_id del empleado
    const [result] = await connection.query(
      `SELECT user_id FROM empleados WHERE id = ?`,
      [id]
    );

    if (result.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    const user_id = result[0].user_id;

    // 2. Actualizar datos en tabla users
    await connection.query(
      `UPDATE users SET email = ?, telefono = ? WHERE id = ?`,
      [email, telefono, user_id]
    );

    // 3. Actualizar datos en tabla empleados
    await connection.query(
      `UPDATE empleados 
       SET departamento_id = ?, puesto_id = ?
       WHERE id = ?`,
      [departamento_id, puesto_id, id]
    );

    connection.release();
    res.json({ message: 'Empleado actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    res.status(500).json({ error: 'Error al actualizar empleado' });
  }
};
// Obtener empleados por Id..
const obtenerColaboradorPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await pool.getConnection();

    const [[colaborador]] = await connection.query(`
      SELECT 
        u.id, u.nombre, u.email, u.telefono,
        e.id AS empleado_id, e.fecha_contratacion,
        d.nombre AS departamento, p.nombre AS puesto
      FROM users u
      JOIN empleados e ON u.id = e.user_id
      LEFT JOIN departamento d ON e.departamento_id = d.id
      LEFT JOIN puestos p ON e.puesto_id = p.id
      WHERE u.id = ?
    `, [id]);

    connection.release();

    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador no encontrado' });
    }

    res.json(colaborador);
  } catch (error) {
    console.error("Error al obtener colaborador:", error);
    res.status(500).json({ error: "Error interno" });
  }
};
//Solicitudes por colaborador
const obtenerSolicitudesColaborador = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await pool.getConnection();

    const [solicitudes] = await connection.query(`
      SELECT s.*, c.empresa
      FROM solicitudes s
      JOIN clientes c ON s.cliente_id = c.id
      WHERE s.empleado_id = ?
      ORDER BY s.fecha_creacion DESC
    `, [id]);

    connection.release();

    res.json(solicitudes);
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    res.status(500).json({ error: "Error interno" });
  }
};



export {obtenerEmpleados,  eliminarEmpleado,  editarEmpleado, obtenerColaboradorPorId,obtenerSolicitudesColaborador};
