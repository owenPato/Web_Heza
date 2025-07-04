import express from 'express';
import { obtenerDocumentosClienteAgrupados } from '../controllers/agrupadosDoc.js';

const router = express.Router();

// Ruta principal, recibe el ID del cliente
router.get('/:id_cliente', obtenerDocumentosClienteAgrupados);

export default router;
