import express from 'express';
import { 
  registrarInformeMensual,
  obtenerInformeMensual,
  procesarInformeMensualDesdeBD
} from '../controllers/informeController.js';

const router = express.Router();

router.get('/informe/:id', registrarInformeMensual);        // registra en BD
router.get('/informe/ver/:id', obtenerInformeMensual);      // lista desde BD
router.get('/informe/procesar/:id', procesarInformeMensualDesdeBD); // lee y extrae

export default router;
