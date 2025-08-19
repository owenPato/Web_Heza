import express from 'express';
import db from '../config/db.js';
import {
  registrarCliente,
  obtenerClientes,
  registrarDatosEmpresa,
  editarCliente,
  eliminarCliente,
  obtenerClientePorId,
} from '../controllers/clientesController.js';

const router = express.Router();

router.post('/register', registrarCliente);
router.get('/', obtenerClientes);
router.post('/empresa', registrarDatosEmpresa);
router.put('/:id', editarCliente);
router.delete('/:id', eliminarCliente);
router.get('/por-id/:id', obtenerClientePorId);
// ✅ Ruta para obtener cliente por user_id
router.get('/por-user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [cliente] = await db.query('SELECT * FROM clientes WHERE user_id = ?', [userId]);
    if (!cliente.length) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente[0]);
  } catch (error) {
    console.error('Error al buscar cliente por user_id:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;

