import express from 'express';
import { registrarCliente, obtenerClientes, registrarDatosEmpresa, editarCliente,
  eliminarCliente} from '../controllers/clientesController.js';

const router = express.Router();

router.post('/register', registrarCliente);
router.get('/', obtenerClientes);
router.post('/clientes/empresa', registrarDatosEmpresa);
router.put('/:id', editarCliente);
router.delete('/:id', eliminarCliente);

export default router;
