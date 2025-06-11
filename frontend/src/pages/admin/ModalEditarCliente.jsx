import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Form } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';

const ModalEditarCliente = ({ show, onHide, cliente, onUpdated }) => {
  const [form, setForm] = useState({
    id: '',
    empresa: '',
    rfc: '',
    direccion: '',
    ciudad: '',
    estado: '',
    codigo_postal: '',
    giro: '',
    numero_empleados: '',
    ventas_anuales: '',
    email:''
  });

  useEffect(() => {
    if (cliente) {
      setForm(cliente);
    }
  }, [cliente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/clientes/${form.id}`, form);
      Swal.fire({
        title: 'Éxito',
        text: 'Cliente actualizado correctamente',
        icon: 'success',
        confirmButtonColor: '#263D4F'
      });
      onHide();
      onUpdated(); // para recargar lista
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el cliente',
        icon: 'error'
      });
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Form className='formulario-usuario-label' onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <div className="w-100 text-center">
            <h2 className="display-5 text-dark mb-0">
              <span className="text-gradient-primary">Editar </span>
              <span className="text-gradient-secondary">datos de empresa</span>
            </h2>
          </div>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>ID</Form.Label>
                <Form.Control value={form.id} disabled />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Empresa</Form.Label>
                <Form.Control value={form.empresa} disabled />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>RFC</Form.Label>
                <Form.Control value={form.rfc} disabled />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Dirección</Form.Label>
                <Form.Control name="direccion" value={form.direccion} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Ciudad</Form.Label>
                <Form.Control name="ciudad" value={form.ciudad} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Estado</Form.Label>
                <Form.Control name="estado" value={form.estado} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Código Postal</Form.Label>
                <Form.Control name="codigo_postal" value={form.codigo_postal} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Giro</Form.Label>
                <Form.Control name="giro" value={form.giro} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Número de Empleados</Form.Label>
                <Form.Control type="number" name="numero_empleados" value={form.numero_empleados} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Ventas Anuales</Form.Label>
                <Form.Control type="number" step="0.01" name="ventas_anuales" value={form.ventas_anuales} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>
         <Row className="mt-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
         </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalEditarCliente;
