import express from 'express';
import { enviarDiagnostico, getSucursalesActivas } from '../controllers/apiController.js';



const router = express.Router();
router.get('/sucursales', getSucursalesActivas);
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
