import React, { useEffect, useState } from 'react';
import { Modal, Button, Row, Col, Form } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';

const ModalEditarEmpleado = ({ show, onHide, empleado, onUpdated }) => {
  const [form, setForm] = useState({
    id: '',
    user_id: '',
    fecha_contratacion: '',
    solicitud_id: '',
    departamento_id: '',
    puesto_id: '',
  });

  const [departamentos, setDepartamentos] = useState([]);
  const [puestos, setPuestos] = useState([]);

  useEffect(() => {
   if (empleado) {
  setForm({
    id: empleado.empleado_id,
    user_id: empleado.user_id,
    nombre: empleado.nombre,
    email: empleado.email,
    telefono: empleado.telefono,
    fecha_contratacion: empleado.fecha_contratacion,
    departamento_id: empleado.departamento_id,
    puesto_id: empleado.puesto_id,
  });
}

  }, [empleado]);

  useEffect(() => {
    axios.get('/api/departamento').then(res => setDepartamentos(res.data));
    axios.get('/api/puestos').then(res => setPuestos(res.data));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.put(`/api/empleados/${form.id}`, form);
      Swal.fire({
        title: 'Éxito',
        text: 'Empleado actualizado correctamente',
        icon: 'success',
        confirmButtonColor: '#263D4F'
      });
      onHide();
      onUpdated();
    } catch (error) {
      console.error('Error al actualizar empleado:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el empleado',
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
                    <span className="text-gradient-secondary">datos de empleados</span>
                  </h2>
                </div>
            </Modal.Header>
            <Modal.Body>
                <Row className="mb-3">
                <Col md={4}>
                    <Form.Group >
                    <Form.Label>ID</Form.Label>
                    <Form.Control value={form.id} disabled />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group>
                    <Form.Label>Fecha Contratación</Form.Label>
                    <Form.Control type="date" value={form.fecha_contratacion} disabled />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group>
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control value={form.nombre} disabled />
                    </Form.Group>
                </Col>
                </Row>

                <Row className="mb-3">
                <Col md={6}>
                    <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control name="email" value={form.email || ''} onChange={handleChange} />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control name="telefono" value={form.telefono || ''} onChange={handleChange} />
                    </Form.Group>
                </Col>
                </Row>

                <Row>
                <Col md={6}>
                    <Form.Group>
                    <Form.Label>Departamento</Form.Label>
                    <Form.Select name="departamento_id" value={form.departamento_id || ''} onChange={handleChange}>
                        <option value="">Seleccione...</option>
                        {departamentos.map(dep => (
                        <option key={dep.id} value={dep.id}>{dep.nombre}</option>
                        ))}
                    </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                    <Form.Label>Puesto</Form.Label>
                    <Form.Select name="puesto_id" value={form.puesto_id || ''} onChange={handleChange}>
                        <option value="">Seleccione...</option>
                        {puestos.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                    </Form.Select>
                    </Form.Group>
                </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant="primary" type="submit">Guardar Cambios</Button>
            </Modal.Footer>
      </Form>

    </Modal>
  );
};

export default ModalEditarEmpleado;
