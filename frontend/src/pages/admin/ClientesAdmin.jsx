import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, FormControl } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import ModalEditarCliente from './ModalEditarCliente';
import Swal from 'sweetalert2';
import "./admin.css";
import SelectHeza from './SelectHeza'; 


const ClientesAdmin = () => {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [sedes, setSedes] = useState([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState('');

  useEffect(() => {
    axios.get('/api/sucursales')
    .then(res => setSedes(res.data))
    .catch(err => console.error('Error al cargar sedes', err));
    obtenerClientes();
  }, []);

  const obtenerClientes = async () => {
  try {
    const res = await axios.get('/api/clientes', {
      params: sedeSeleccionada ? { sede_id: sedeSeleccionada } : {}
    });
    setClientes(res.data);
  } catch (err) {
    console.error('Error al obtener clientes:', err);
  }
};
useEffect(() => {
  obtenerClientes();
}, [sedeSeleccionada]);

  const handleBuscar = (e) => setFiltro(e.target.value.toLowerCase());

  const handleEditar = (cliente) => {
    setClienteSeleccionado(cliente);
    setModalShow(true);
  };

  const handleEliminar = async (id) => {
  const result = await Swal.fire({
    title: '¿Eliminar cliente?',
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
      await axios.delete(`/api/clientes/${id}`);
      await obtenerClientes();
      Swal.fire({
        title: 'Eliminado',
        text: 'Cliente eliminado correctamente.',
        icon: 'success',
        confirmButtonColor: '#263D4F' // o tu color dorado, etc.
      });
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el cliente.',
        icon: 'error'
      });
    }
  }
};
 const exportarExcel = () => {
  const datosExportar = clientes.map(({ cliente_id, empresa, rfc, user_id, email }) => ({
    Empresa: empresa,
    RFC: rfc,  
    Email: email
  }));
  const hoja = XLSX.utils.json_to_sheet(datosExportar);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Clientes');
  XLSX.writeFile(libro, 'clientes.xlsx');
};

 const clientesFiltrados = clientes
  .filter(c => c.empresa && c.rfc) // <-- solo si tiene empresa y RFC
  .filter(c =>
    c.empresa.toLowerCase().includes(filtro) ||
    c.rfc.toLowerCase().includes(filtro)
  );


  return (
    <div className="container mt-4">
      <h2 className="display-5 text-dark mb-4">
        <span className="text-gradient-primary">Clientes </span> 
        <span className="text-gradient-secondary"> Registrados</span>
      </h2>    
      <div className="filtros-clientes ">
          <FormControl
            placeholder="Buscar por empresa"
            className="filtro-heza input-heza "
            onChange={handleBuscar}
          />
         <SelectHeza
            options={[{ label: 'Todas las sedes', value: '' }, ...sedes.map(s => ({
              label: s.nombre,
              value: s.id
            }))]}
            value={sedes.length ? { label: sedes.find(s => s.id == sedeSeleccionada)?.nombre || 'Todas las sedes', value: sedeSeleccionada } : ''}
            onChange={(selected) => setSedeSeleccionada(selected.value)}
          />
          <button className="filtro-heza boton-exportar" onClick={exportarExcel}>
            Exportar Excel
          </button>
       </div>
    <Table striped bordered hover responsive className="table table-con-sombra mt-3 ">
      <thead className="table-dark">
        <tr>
          <th>Empresa</th>
          <th>RFC</th>
          <th>Email</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {clientesFiltrados.map(cliente => (
          <tr key={cliente.cliente_id}>
            <td>{cliente.empresa}</td>
            <td>{cliente.rfc}</td>
            <td>{cliente.email || '—'}</td>
            <td>
            <Button className="boton-heza me-2 mb-2" onClick={() => handleEditar(cliente)}>
              Editar
            </Button>
            <Button className="boton-heza-outline" onClick={() => handleEliminar(cliente.cliente_id)}>
              Eliminar
            </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
      {modalShow && clienteSeleccionado && (
        <ModalEditarCliente
          cliente={clienteSeleccionado}
          show={modalShow}
          onHide={() => setModalShow(false)}
          onUpdated={obtenerClientes}
        />
      )}
    </div>
  );
};

export default ClientesAdmin;
