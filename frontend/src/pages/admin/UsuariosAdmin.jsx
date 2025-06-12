import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, FormControl } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import ModalEditarEmpleado from './ModalEditarEmpleado';
import './admin.css';
import SelectHeza from './SelectHeza'; 

const EmpleadosAdmin = () => {
  const [empleados, setEmpleados] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [sedes, setSedes] = useState([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState('');

  useEffect(() => {
    axios.get('/api/sucursales')
    .then(res => setSedes(res.data))
    .catch(err => console.error('Error al cargar sedes', err));
    obtenerEmpleados();
  }, []);

  useEffect(() => {
    obtenerEmpleados();
  }, [sedeSeleccionada]);

  const obtenerEmpleados = async () => {
    try {
      const res = await axios.get('/api/empleados', {
        params: sedeSeleccionada ? { sede_id: sedeSeleccionada } : {}
      });
      setEmpleados(res.data);
    } catch (err) {
      console.error('Error al obtener empleados:', err);
    }
  };

  const handleBuscar = (e) => {
    setFiltro(e.target.value.toLowerCase());
  };

  const handleEditar = (empleado) => {
    setEmpleadoSeleccionado(empleado);
    setModalShow(true);
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar empleado?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#263D4F',
      cancelButtonColor: '#A5A5A5'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/empleados/${id}`);
        await obtenerEmpleados();
        Swal.fire('Eliminado', 'Empleado eliminado correctamente.', 'success');
      } catch (error) {
        console.error('Error al eliminar empleado:', error);
        Swal.fire('Error', 'No se pudo eliminar el empleado.', 'error');
      }
    }
  };

  const exportarExcel = () => {
    const datos = empleados.map(({ empleado_id, nombre, email, puesto_nombre, departamento_nombre }) => ({
      ID: empleado_id,
      Nombre: nombre,
      Email: email,
      Puesto: puesto_nombre,
      Departamento: departamento_nombre
    }));
    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Empleados');
    XLSX.writeFile(libro, 'empleados.xlsx');
  };

  const empleadosFiltrados = empleados.filter(e =>
    e.nombre?.toLowerCase().includes(filtro) ||
    e.email?.toLowerCase().includes(filtro)
  );

  return (
    <div className="container mt-4">
      <h2 className="display-5 text-dark mb-4">
        <span className="text-gradient-primary">Empleados </span> 
        <span className="text-gradient-secondary">Registrados</span>
      </h2>

      <div className="filtros-clientes">
        <FormControl
          placeholder="Buscar por nombre"
          className="filtro-heza input-heza"
          onChange={handleBuscar}
        />
        <SelectHeza
          options={[{ label: 'Todas las sedes', value: '' }, ...sedes.map(s => ({
            label: s.nombre,
            value: s.id
          }))]}
          value={
            sedes.length
              ? {
                  label: sedes.find(s => s.id === sedeSeleccionada)?.nombre || 'Todas las sedes',
                  value: sedeSeleccionada
                }
              : ''
          }
          onChange={(selected) => setSedeSeleccionada(selected.value)}
        />
        <button className="filtro-heza boton-exportar" onClick={exportarExcel}>
          Exportar Excel
        </button>
      </div>

      <Table striped bordered hover responsive className="table table-con-sombra mt-3">
        <thead className="table-dark">
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Puesto</th>
            <th>Departamento</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleadosFiltrados.map(emp => (
            <tr key={emp.empleado_id}>
              <td>{emp.nombre}</td>
              <td>{emp.email}</td>
              <td>{emp.puesto_nombre}</td>
              <td>{emp.departamento_nombre}</td>
              <td>
                <Button className="boton-heza me-2 mb-2" onClick={() => handleEditar(emp)}>
                  Editar
                </Button>
                <Button className="boton-heza-outline" onClick={() => handleEliminar(emp.empleado_id)}>
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {modalShow && empleadoSeleccionado && (
        <ModalEditarEmpleado
          empleado={empleadoSeleccionado}
          show={modalShow}
          onHide={() => setModalShow(false)}
          onUpdated={obtenerEmpleados}
        />
      )}
    </div>
  );
};

export default EmpleadosAdmin;
