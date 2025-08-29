import express from 'express';
import {
  obtenerEmpleados,
  editarEmpleado,
  eliminarEmpleado,
  obtenerColaboradorPorId,
  obtenerSolicitudesColaborador
} from '../controllers/empleadosController.js';

const router = express.Router();

router.get('/', obtenerEmpleados);
router.put('/:id', editarEmpleado);
router.delete('/:id', eliminarEmpleado);
router.get('/:id', obtenerColaboradorPorId); // nuevo
router.get('/:id/solicitudes', obtenerSolicitudesColaborador); // nuevo

export default router; // 👈 NECESARIO PARA PODER USAR "import empleado from ..."

