import express from 'express';
import { enviarDiagnostico } from '../controllers/apiController.js';
import { obtenerSucursalesActivas } from '../controllers/sucursalController.js';




const router = express.Router();
router.get('/sucursales', obtenerSucursalesActivas);
router.post(
  '/enviar-diagnostico',
  (req, res, next) => {
    if (!req.body.empresa || !req.body.email) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }
    next();
  },
  enviarDiagnostico
);

export default router;
