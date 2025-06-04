import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Form } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';

const ModalFormularioUsuario = ({ show, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    solicitud_id: initialData?.solicitud_id || '',
    puesto: initialData?.puesto || '',
    departamento: initialData?.departamento || '',
    fecha_contratacion: initialData?.fecha_contratacion || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Completar Datos del Usuario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Puesto</Form.Label>
            <Form.Control
              type="text"
              name="puesto"
              value={formData.puesto}
              onChange={handleChange}
              placeholder="Ingrese el puesto"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Departamento</Form.Label>
            <Form.Control
              type="text"
              name="departamento"
              value={formData.departamento}
              onChange={handleChange}
              placeholder="Ingrese el departamento"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Fecha de Contratación</Form.Label>
            <Form.Control
              type="date"
              name="fecha_contratacion"
              value={formData.fecha_contratacion}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalFormularioUsuario;
