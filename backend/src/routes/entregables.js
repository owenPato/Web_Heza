import express from 'express';
import { registrarBuzon, obtenerBuzon } from '../controllers/registrarBuzonTributario.js';
import { registrarOpinionIMSS, obtenerOpinionIMSS } from '../controllers/registrarOpinionIMSS.js';
import { registrarOpinionSAT, obtenerOpinionSAT } from '../controllers/registrarOpinionSAT.js';
import { registrarReporteEFOS, obtenerReporteEFOS } from '../controllers/registrarReporteEFOS.js';
import { registrarEntregableModificable, obtenerEntregableModificable } from '../controllers/registrarEntregableModificable.js';



const router = express.Router();

// Para usarlo así: http://localhost:5000/api/entregables/buzon/1
router.get('/buzon/:id', registrarBuzon);
router.get('/buzon/ver/:id', obtenerBuzon); // 👈 Nuevo

// Opinión IMSS
router.get('/imss/:id', registrarOpinionIMSS);
router.get('/imss/ver/:id', obtenerOpinionIMSS);


// 🟢 Opinión SAT
router.get('/sat/:id', registrarOpinionSAT);
router.get('/sat/ver/:id', obtenerOpinionSAT);

router.get('/efos/:id', registrarReporteEFOS);
router.get('/efos/ver/:id', obtenerReporteEFOS);

router.get('/modificable/:id', registrarEntregableModificable);         // Procesa y guarda el documento
router.get('/modificable/ver/:id', obtenerEntregableModificable);       // Obtiene desde la BD
export default router;

