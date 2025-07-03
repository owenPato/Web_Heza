import express from 'express';
import { registrarInformeMensual,  obtenerInformeMensual, procesarInformeMensualDesdeBD } from '../controllers/informeController.js';

const router = express.Router();


router.get('/informe/:id', registrarInformeMensual);       
router.get('/informe/ver/:id', obtenerInformeMensual);     
router.get('/informe/procesar/:id', procesarInformeMensualDesdeBD);

export default router;
