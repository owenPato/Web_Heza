// backend/src/routes/firmasRoutes.js
import express from 'express';
import {
  crearFirma,
  listarFirmasPorDocumento,
  listarFirmasPorCliente,
  existeFirma
} from '../controllers/firmasController.js';

const router = express.Router();

// Registrar firma
router.post('/', crearFirma);

// Consultas
router.get('/documento/:idDocumento', listarFirmasPorDocumento);
router.get('/cliente/:idCliente', listarFirmasPorCliente);
router.get('/existe/:idDocumento/:idCliente', existeFirma);

export default router;
