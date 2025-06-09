import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, InputGroup, FormControl } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import ModalEditarCliente from './ModalEditarCliente';
import Swal from 'sweetalert2';
import "./admin.css";


const ClientesAdmin = () => {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  useEffect(() => {
    obtenerClientes();
  }, []);

  const obtenerClientes = async () => {
    try {
      const res = await axios.get('/api/clientes');
      setClientes(res.data);
    } catch (err) {
      console.error('Error al obtener clientes:', err);
    }
  };

  const datosExportar = clientes.map(({ cliente_id, empresa, rfc, user_id, email }) => ({
  ID: cliente_id,
  Empresa: empresa,
  RFC: rfc,
  UserID: user_id,
  Email: email
  }));


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
    ID: cliente_id,
    Empresa: empresa,
    RFC: rfc,
    UserID: user_id,
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
      <div className="d-flex justify-content-between mb-3">
        <InputGroup className="w-50">
          <FormControl
            placeholder="Buscar por empresa o RFC"
            onChange={handleBuscar}
          />
        </InputGroup>
        <Button variant="success" className='boton-exportar' onClick={exportarExcel}>
          Exportar Excel
        </Button>
      </div>
      <Table striped bordered hover responsive className="table mt-3 w-100">
      <thead className="table-dark">
        <tr>
          <th>ID</th>
          <th>Empresa</th>
          <th>RFC</th>
          <th>User ID</th>
          <th>Email</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {clientesFiltrados.map(cliente => (
          <tr key={cliente.cliente_id}>
            <td>{cliente.cliente_id}</td>
            <td>{cliente.empresa}</td>
            <td>{cliente.rfc}</td>
            <td>{cliente.user_id || '—'}</td>
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
