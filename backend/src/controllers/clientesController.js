import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import pool from '../config/db.js';
import User from '../models/User.js';


const registrarCliente = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nombre, email, password, telefono, empresa, rfc, sede_id } = req.body;

  try {
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
        username: email
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
  try {
    const connection = await pool.getConnection();
    const [clientes] = await connection.query('SELECT * FROM clientes');
    connection.release();
    res.json(clientes);
  } catch (error) {
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
    ventas_anuales
  } = req.body;

  try {
    const connection = await pool.getConnection();
    await connection.query(
      `UPDATE clientes SET direccion = ?, ciudad = ?, estado = ?, codigo_postal = ?, giro = ?, numero_empleados = ?, ventas_anuales = ? WHERE id = ?`,
      [direccion, ciudad, estado, codigo_postal, giro, numero_empleados, ventas_anuales, id]
    );
    connection.release();
    res.json({ message: 'Cliente actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
};

const eliminarCliente = async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM clientes WHERE id = ?', [id]);
    connection.release();
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
};

export { registrarCliente, obtenerClientes, registrarDatosEmpresa,editarCliente, eliminarCliente};
