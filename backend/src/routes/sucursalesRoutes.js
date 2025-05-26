import express from 'express';
import { obtenerSucursalesActivas } from '../controllers/sucursalController.js';

const router = express.Router();

router.get('/', obtenerSucursalesActivas);

export default router;
