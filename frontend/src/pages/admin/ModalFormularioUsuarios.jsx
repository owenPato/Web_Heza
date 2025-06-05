import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Form } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';

const ModalFormularioUsuario = ({ show, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    solicitud_id: initialData?.solicitud_id || '',
    puesto: initialData?.puesto || '',
    departamento_id: initialData?.departamento_id || '',
    fecha_contratacion: initialData?.fecha_contratacion || ''
  });
  const [listaDepartamentos, setListaDepartamentos] = useState([]);

useEffect(() => {
  const fetchDepartamentos = async () => {
    try {
      const response = await axios.get('/api/departamento');
      setListaDepartamentos(response.data);
    } catch (error) {
      console.error('Error al cargar los Departamentos', error);
    }
  };
  fetchDepartamentos();
}, []);

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
            <Form.Select
              name="departamento_id"
              value={formData.departamento_id}
              onChange={handleChange}
            >
              <option value="">Selecciona un departamento</option>
              {listaDepartamentos.map((departamento) => (
                <option key={departamento.id} value={departamento.id}>
                  {departamento.nombre}
                </option>
              ))}
            </Form.Select>
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
