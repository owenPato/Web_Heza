import User from '../models/User.js';
import pool from '../config/db.js';

export const getDashboardStats = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para acceder a esta información' });
    }
    
    const connection = await pool.getConnection();
    try {
      const [userRows] = await connection.query(
        'SELECT COUNT(*) as total FROM users WHERE rol != "admin"'
      );
      const totalUsers = userRows[0].total;
      
      const [clientRows] = await connection.query(
        'SELECT COUNT(*) as total FROM users WHERE rol = "cliente" AND activo = 1'
      );
      const activeClients = clientRows[0].total;
      
      const [pendingAccessRows] = await connection.query(
        'SELECT COUNT(*) as total FROM users WHERE activo = 0 AND rol != "admin"'
      );
      const pendingAccessRequests = pendingAccessRows[0].total;
      
      const pendingTasks = pendingAccessRequests;
      
      const [recentClients] = await connection.query(
        `SELECT u.id, u.nombre, u.activo 
         FROM users u 
         WHERE u.rol = "cliente" 
         ORDER BY u.fecha_registro DESC 
         LIMIT 5`
      );
      
      res.json({
        stats: {
          totalUsers,
          activeClients,
          pendingTasks,
          pendingAccessRequests
        },
        recentClients
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas del dashboard' });
  }
};

export const getClientDashboardStats = async (req, res) => {
  try {
    const clientId = req.user.id;
    
    if (req.user.rol !== 'cliente') {
      return res.status(403).json({ error: 'No autorizado para acceder a esta información' });
    }
    
    const connection = await pool.getConnection();
    try {
      const [docRows] = await connection.query(
        'SELECT COUNT(*) as total FROM documentos WHERE cliente_id = ?',
        [clientId]
      );
      const totalDocuments = docRows[0].total;
      
      const [serviceRows] = await connection.query(
        'SELECT COUNT(*) as total FROM servicios WHERE cliente_id = ? AND estado = "activo"',
        [clientId]
      );
      const activeServices = serviceRows[0].total;
      
      const [eventRows] = await connection.query(
        `SELECT id, titulo, fecha, descripcion 
         FROM eventos 
         WHERE fecha >= CURDATE() 
         ORDER BY fecha ASC 
         LIMIT 3`
      );
      
      res.json({
        stats: {
          totalDocuments,
          activeServices,
          upcomingEvents: eventRows.length
        },
        upcomingEvents: eventRows
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error al obtener estadísticas del cliente:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas del cliente' });
  }
};

export const getPendingRequests = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { rol, sede_id } = req.user;

    if (rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // 🚀 Ajustamos el query para filtrar por sede_id
    const [pendingRequests] = await connection.query(
      'SELECT * FROM solicitudes_acceso WHERE estado = "pendiente" AND sede_id = ? ORDER BY fecha_solicitud DESC',
      [sede_id]
    );

    res.json({ pendingRequests });
  } catch (error) {
    console.error('Error al obtener solicitudes pendientes:', error);
    res.status(500).json({ error: 'Error al obtener solicitudes pendientes' });
  } finally {
    connection.release();
  }
};
