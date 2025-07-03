import express from 'express';
import { registrarCSFDesdeRuta, obtenerCSFporCliente } from '../controllers/csfController.js';

const router = express.Router();

router.post('/csf/:id_cliente', registrarCSFDesdeRuta); // Para registrar desde disco

router.get('/csf/:id', obtenerCSFporCliente);

export default router;
