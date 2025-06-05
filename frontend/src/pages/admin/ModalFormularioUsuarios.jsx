import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Form } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';

const ModalFormularioUsuario = ({ show, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    solicitud_id: initialData?.solicitud_id || '',
    puesto_id: initialData?.puesto_id || '',
    departamento_id: initialData?.departamento_id || '',
    fecha_contratacion: initialData?.fecha_contratacion || ''
  });
  const [listaDepartamentos, setListaDepartamentos] = useState([]);
  const [listaPuestos, setListaPuestos] = useState([]);

  useEffect(() => {
    const fetchPuestos = async () => {
      try {
        const response = await axios.get('/api/puestos');
        setListaPuestos(response.data);
      } catch (error) {
        console.error('Error al cargar los puestos', error);
      }
    };
    fetchPuestos();
  }, []);

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
            <Form.Select
              name="puesto_id"
              value={formData.puesto_id}
              onChange={handleChange}
            >
              <option value="">Selecciona un puesto</option>
              {listaPuestos.map((puesto) => (
                <option key={puesto.id} value={puesto.id}>
                  {puesto.nombre}
                </option>
              ))}
            </Form.Select>
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
