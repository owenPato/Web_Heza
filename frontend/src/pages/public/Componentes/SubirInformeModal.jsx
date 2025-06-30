import React, { useState } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';

const SubirInformeModal = ({ show, handleClose }) => {
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const handleFileChange = (e) => {
    setArchivo(e.target.files[0]);
    setMensaje(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo) {
      setMensaje({ tipo: 'danger', texto: 'Selecciona un archivo PDF.' });
      return;
    }

    try {
      setSubiendo(true);
      const formData = new FormData();
      formData.append('archivo', archivo);

      const response = await axios.post('http://localhost:5000/api/informe-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      setMensaje({ tipo: 'success', texto: response.data.message });
      setArchivo(null);
    } catch (error) {
      console.error(error);
      setMensaje({ tipo: 'danger', texto: 'Error al subir el PDF.' });
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Subir Informe PDF</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {mensaje && <Alert variant={mensaje.tipo}>{mensaje.texto}</Alert>}
          <Form.Group>
            <Form.Label>Selecciona un archivo PDF</Form.Label>
            <Form.Control type="file" accept=".pdf" onChange={handleFileChange} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={subiendo}>
            {subiendo ? <Spinner size="sm" animation="border" /> : 'Subir'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default SubirInformeModal;
