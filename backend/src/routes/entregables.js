import express from 'express';
import { registrarBuzon, obtenerBuzon } from '../controllers/registrarBuzonTributario.js';

const router = express.Router();

// Para usarlo así: http://localhost:5000/api/entregables/buzon/1
router.get('/buzon/:id', registrarBuzon);
router.get('/buzon/ver/:id', obtenerBuzon); // 👈 Nuevo

export default router;
