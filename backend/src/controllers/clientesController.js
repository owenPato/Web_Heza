import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import pool from '../config/db.js';
import User from '../models/User.js';


const registrarCliente = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { nombre, email, password, telefono, empresa, rfc, sede_id, user_id} = req.body;

  try {
    const [empresaExistente] = await connection.query(
      'SELECT id FROM clientes WHERE empresa = ?',
      [empresa]
    );
    if (empresaExistente.length > 0) {
      return res.status(400).json({ error: 'La empresa ya está registrada' });
    }
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    const rfcRegex = /^[A-Z&Ñ]{3,4}\d{6}[A-V1-9][A-Z1-9][0-9A]$/;
    if (!rfcRegex.test(rfc.toUpperCase())) {
      return res.status(400).json({ error: 'Formato de RFC inválido' });
    }
    const connection = await pool.getConnection();
    try {
      const [existingUsers] = await connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      const [existingRfc] = await connection.query(
        'SELECT * FROM clientes WHERE rfc = ?',
        [rfc]
      );

      if (existingRfc.length > 0) {
        return res.status(400).json({ error: 'El RFC ya está registrado' });
      }

      // ✅ Cifrar la contraseña antes de guardar
      const hashedPassword = await bcrypt.hash(password, 10);

      const userData = {
        nombre,
        email,
        password: hashedPassword, // aquí ya va cifrada
        telefono,
        rol: 'cliente',
        sede_id,
        activo: 1,
        fecha_registro: new Date(),
        username: email,
        user_id
      };

      const clienteData = {
        empresa,
        rfc
      };
      console.log('Hashed password:', userData.password);
      await User.create(userData, clienteData);

      res.status(201).json({ mensaje: 'Cliente registrado exitosamente' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error al registrar cliente:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

const obtenerClientes = async (req, res) => {
  const { sede_id } = req.query;
  const connection = await pool.getConnection();

  try {
    // 🔄 Detectar duplicados: un cliente con rfc pero sin user_id
    // y otro con user_id pero sin rfc (por la misma empresa)
    const [duplicados] = await connection.query(`
      SELECT c1.id AS lleno_id, c2.id AS vacio_id, c2.user_id
      FROM clientes c1
      JOIN clientes c2 ON c1.empresa = c2.empresa AND c1.id <> c2.id
      WHERE c1.user_id IS NULL
        AND c2.user_id IS NOT NULL
        AND c1.rfc IS NOT NULL
        AND c2.rfc IS NULL
    `);

    // 🔁 Resolver duplicados (asignar user_id y eliminar vacío)
    for (const { lleno_id, vacio_id, user_id } of duplicados) {
      await connection.query(
        `UPDATE clientes SET user_id = ? WHERE id = ?`,
        [user_id, lleno_id]
      );
      await connection.query(
        `DELETE FROM clientes WHERE id = ?`,
        [vacio_id]
      );
    }

    // 📦 Query base
    let query = `
     SELECT
      c.id AS cliente_id,
      c.empresa,
      c.rfc,
      c.direccion,
      c.ciudad,
      c.estado,
      c.codigo_postal,
      c.giro,
      c.numero_empleados,
      c.ventas_anuales,
      c.user_id,
      u.email
      FROM clientes c
      LEFT JOIN users u ON u.id = c.user_id
    `;

    const params = [];

    // 🧩 Aplicar filtro por sede si se envía desde frontend
    if (sede_id) {
      query += ` WHERE u.sede_id = ?`;
      params.push(sede_id);
    }

    const [clientes] = await connection.query(query, params);

    connection.release();
    res.json(clientes);
  } catch (error) {
    connection.release();
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
};

const registrarDatosEmpresa = async (req, res) => {
  const {
    empresa,
    rfc,
    direccion,
    ciudad,
    estado,
    codigo_postal,
    giro,
    numero_empleados,
    ventas_anuales
  } = req.body;

  try {
    const connection = await pool.getConnection();

    const [existeRFC] = await connection.query(
      'SELECT id FROM clientes WHERE rfc = ?',
      [rfc]
    );

    if (existeRFC.length > 0) {
      return res.status(400).json({ error: 'El RFC ya está registrado' });
    }

    await connection.query(
      `INSERT INTO clientes 
      (empresa, rfc, direccion, ciudad, estado, codigo_postal, giro, numero_empleados, ventas_anuales)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        empresa,
        rfc,
        direccion,
        ciudad,
        estado,
        codigo_postal,
        giro,
        numero_empleados,
        ventas_anuales
      ]
    );

    connection.release();

    res.status(201).json({ message: 'Datos de empresa registrados correctamente' });
  } catch (error) {
    console.error('Error insertando empresa:', error);
    res.status(500).json({ error: 'Error al insertar empresa' });
  }
};

const editarCliente = async (req, res) => {
  const { id } = req.params;
  const {
    direccion,
    ciudad,
    estado,
    codigo_postal,
    giro,
    numero_empleados,
    ventas_anuales,
    email // 👈 nuevo campo
  } = req.body;

  const connection = await pool.getConnection();

  try {
    // 1️⃣ Actualizar tabla clientes
    await connection.query(
      `UPDATE clientes 
       SET direccion = ?, ciudad = ?, estado = ?, codigo_postal = ?, giro = ?, numero_empleados = ?, ventas_anuales = ? 
       WHERE id = ?`,
      [direccion, ciudad, estado, codigo_postal, giro, numero_empleados, ventas_anuales, id]
    );

    // 2️⃣ Obtener user_id del cliente
    const [[cliente]] = await connection.query(`SELECT user_id FROM clientes WHERE id = ?`, [id]);

    // 3️⃣ Actualizar el email en tabla users (si existe user_id)
    if (cliente && cliente.user_id && email) {
      await connection.query(`UPDATE users SET email = ? WHERE id = ?`, [email, cliente.user_id]);
    }

    connection.release();
    res.json({ message: 'Cliente actualizado correctamente' });
  } catch (error) {
    connection.release();
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
};


const eliminarCliente = async (req, res) => {
  const { id } = req.params;

  const connection = await pool.getConnection();

  try {
    // 1️⃣ Obtener el user_id del cliente
    const [[cliente]] = await connection.query(`SELECT user_id FROM clientes WHERE id = ?`, [id]);

    // 2️⃣ Eliminar cliente
    await connection.query(`DELETE FROM clientes WHERE id = ?`, [id]);

    // 3️⃣ Si existe user_id, eliminar también al usuario
    if (cliente && cliente.user_id) {
      await connection.query(`DELETE FROM users WHERE id = ?`, [cliente.user_id]);
    }

    connection.release();
    res.json({ message: 'Cliente y usuario eliminados correctamente' });
  } catch (error) {
    connection.release();
    console.error('Error al eliminar cliente y usuario:', error);
    res.status(500).json({ error: 'Error al eliminar cliente y usuario' });
  }
};

const obtenerClientePorId = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await pool.getConnection();

    const [[cliente]] = await connection.query(
      `SELECT 
        c.id,
        c.empresa,
        c.rfc,
        c.direccion,
        c.ciudad,
        c.estado,
        c.codigo_postal,
        c.giro,
        c.numero_empleados,
        c.ventas_anuales,
        u.email
      FROM clientes c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?`,
      [id]
    );

    connection.release();

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(cliente);
  } catch (error) {
    console.error('Error al obtener cliente por ID:', error);
    res.status(500).json({ error: 'Error del servidor al obtener cliente' });
  }
};


export { registrarCliente, obtenerClientes, registrarDatosEmpresa,editarCliente, eliminarCliente, obtenerClientePorId};
