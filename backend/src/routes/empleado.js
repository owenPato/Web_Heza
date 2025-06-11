import express from 'express';
import {
  obtenerEmpleados,
  editarEmpleado,
  eliminarEmpleado
} from '../controllers/empleadosController.js';

const router = express.Router();

router.get('/', obtenerEmpleados);
router.put('/:id', editarEmpleado);
router.delete('/:id', eliminarEmpleado);

export default router; // 👈 NECESARIO PARA PODER USAR "import empleado from ..."

