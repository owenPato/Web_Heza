import User from '../models/User.js';
import pool from '../config/db.js';
import bcrypt from 'bcryptjs'; 

export const getAllClients = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para acceder a esta información' });
    }
    
    const filters = {
      rol: 'cliente',
      search: req.query.search,
      activo: req.query.activo !== undefined ? parseInt(req.query.activo) : undefined
    };
    
    const clients = await User.getAll(filters);
    
    const connection = await pool.getConnection();
    try {
      for (const client of clients) {
        delete client.password;
        
        const [clientRows] = await connection.query(
          'SELECT * FROM clientes WHERE id = ?',
          [client.id]
        );
        
        if (clientRows[0]) {
          Object.assign(client, clientRows[0]);
        }
      }
    } finally {
      connection.release();
    }
    
    res.json({ clients });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al obtener lista de clientes' });
  }
};

export const getClientById = async (req, res) => {
  try {
    const clientId = req.params.id;
    
    if (req.user.rol !== 'admin' && req.user.id !== parseInt(clientId)) {
      return res.status(403).json({ error: 'No autorizado para acceder a esta información' });
    }
    
    const client = await User.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    if (client.rol !== 'cliente') {
      return res.status(404).json({ error: 'Usuario no es un cliente' });
    }
    
    delete client.password;
    
    res.json({ client });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ error: 'Error al obtener información del cliente' });
  }
};

export const createClient = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para crear clientes' });
    }

    const clientData = {
      ...req.body,
      rol: 'cliente'
    };

    // Validar si el correo ya existe
    const existingUser = await User.findByEmail(clientData.email);
    if (existingUser) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    // ✅ Cifrar la contraseña
    const hashedPassword = await bcrypt.hash(clientData.password, 10);
    clientData.password = hashedPassword;

    const clientId = await User.create(clientData);
    const client = await User.findById(clientId);

    delete client.password;

    res.status(201).json({ client });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
};

export const updateClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    
    if (req.user.rol !== 'admin' && req.user.id !== parseInt(clientId)) {
      return res.status(403).json({ error: 'No autorizado para modificar este cliente' });
    }
    
    const client = await User.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    if (client.rol !== 'cliente') {
      return res.status(404).json({ error: 'Usuario no es un cliente' });
    }
    
    const clientData = req.body;
    
    if (req.user.rol !== 'admin') {
      delete clientData.rol;
      delete clientData.activo;
    }
    
    await User.update(clientId, clientData);
    
    const updatedClient = await User.findById(clientId);
    
    delete updatedClient.password;
    
    res.json({ client: updatedClient });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
};

export const deleteClient = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para eliminar clientes' });
    }
    
    const clientId = req.params.id;
    
    const client = await User.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    if (client.rol !== 'cliente') {
      return res.status(404).json({ error: 'Usuario no es un cliente' });
    }
    
    await User.delete(clientId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
};

export const getClientServices = async (req, res) => {
  try {
    const clientId = req.params.id || req.user.id;
    
    if (req.user.rol !== 'admin' && req.user.id !== parseInt(clientId)) {
      return res.status(403).json({ error: 'No autorizado para acceder a esta información' });
    }
    
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT cs.*, s.nombre, s.descripcion
         FROM cliente_servicio cs
         JOIN servicios s ON cs.id_servicio = s.id
         WHERE cs.id_cliente = ?`,
        [clientId]
      );
      
      res.json({ services: rows });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error al obtener servicios del cliente:', error);
    res.status(500).json({ error: 'Error al obtener servicios del cliente' });
  }
};