import express from 'express';
import db from '../config/db.js';
const router = express.Router();

// ✅ Nueva ruta para verificar si ya existen documentos
router.get('/existen/:idCliente', async (req, res) => {
  try {
    const { idCliente } = req.params;
    const [result] = await db.query(
      'SELECT COUNT(*) AS total FROM documentos WHERE id_cliente = ?',
      [idCliente]
    );

    const existen = result.total > 0;
    res.json({ existen });
  } catch (error) {
    console.error('❌ Error al verificar existencia de documentos:', error);
    res.status(500).json({ error: 'Error en la base de datos' });
  }
});

export default router;
