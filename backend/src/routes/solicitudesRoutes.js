import express from 'express';
import {
  crearSolicitud,
  obtenerSolicitudesPorCliente
} from '../controllers/solicitudesController.js';

const router = express.Router();

// Crear una nueva solicitud
router.post('/', crearSolicitud);

// Obtener todas las solicitudes de un cliente específico
router.get('/cliente/:clienteId', obtenerSolicitudesPorCliente);

export default router;
