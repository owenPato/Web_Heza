import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Form } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';


const ModalFormularioCliente = ({ show, onClose, onSubmit, initialData = {} }) => {
  const [form, setForm] = useState({
    empresa: '',
    rfc: '',
    direccion: '',
    ciudad: '',
    estado: '',
    codigo_postal: '',
    giro: '',
    numero_empleados: '',
    ventas_anuales: '',
    solicitud_id: '',
    ...initialData
  });
  useEffect(() => {
  if (initialData && initialData.solicitud_id) {
    setForm((prev) => ({ ...prev, ...initialData }));
  }
}, [initialData]);

 console.log('🧪 initialData recibido en el modal:', initialData);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('Solicitud ID que llega al modal:', form.solicitud_id);
  try {
    const response = await axios.post('/api/clientes/empresa', form);
    if(form.solicitud_id){
     await axios.post(`/api/admin/solicitudes-acceso/${form.solicitud_id}/aprobar`);
    }
    Swal.fire({
      title: 'Éxito',
      text: response.data.message,
      icon: 'success',
      confirmButtonColor: '#263D4F' // color de tu plantilla (dorado)
    });
    onClose(); // cierra el modal si todo salió bien
  } catch (error) {
    console.error('Error al insertar empresa:', error);
   Swal.fire({
    title: 'Error',
    text: error.response?.data?.error || 'Ocurrió un error en el servidor',
    icon: 'error',
    confirmButtonColor: '#B49C73' // mismo tono dorado que tu plantilla
   });
  }
};

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
      <div className="w-100 text-center">
        <h3 className="display-5 text-dark mb-0">
          <span className="text-gradient-primary">Completar  </span>
          <span className="text-gradient-secondary">datos de empresa</span>
        </h3>
      </div>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            {Object.keys(form).filter(key => key !== 'solicitud_id').map((key) => (
              <Col md={6} key={key}>
                <Form.Group>
                  <Form.Label>{key.replace('_', ' ').toUpperCase()}</Form.Label>
                  <Form.Control
                    type={key.includes('numero') || key.includes('ventas') ? 'number' : 'text'}
                    name={key}
                    value={form[key]}
                    onChange={handleChange}
                    placeholder={`Ingrese ${key.replace('_', ' ')}`}
                  />
                </Form.Group>
              </Col>
            ))}
          </Row>
          <div className="text-end mt-4">
            <Button variant="primary" type="submit">Guardar</Button>
            <Button variant="secondary" className="ms-2" onClick={onClose}>Cancelar</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalFormularioCliente;

