import express from 'express';
import { 
  getSolicitudes, 
  getSolicitudesPendientesCount, 
  aprobarSolicitud, 
  rechazarSolicitud 
} from '../controllers/solicitudAccesoController.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rutas protegidas para administradores
router.get('/solicitudes-acceso', verifyToken, verifyAdmin,getSolicitudes);
router.get('/solicitudes-acceso/pendientes/count', verifyToken, verifyAdmin, getSolicitudesPendientesCount);
router.post('/solicitudes-acceso/:id/aprobar', verifyToken, verifyAdmin, aprobarSolicitud);
router.post('/solicitudes-acceso/:id/rechazar', verifyToken, verifyAdmin, rechazarSolicitud);

export default router;