import express from 'express';
import { registrarCliente, obtenerClientes, registrarDatosEmpresa } from '../controllers/clientesController.js';

const router = express.Router();

router.post('/register', registrarCliente);
router.get('/', obtenerClientes);
router.post('/clientes/empresa', registrarDatosEmpresa);


export default router;
