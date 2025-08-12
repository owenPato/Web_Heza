import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const colaboradores = [
  {
    nombre: 'Laura Méndez',
    puesto: 'Contadora',
    imagen: '/img/colaboradores/laura.jpg',
    telefono: '523328140365',
  },
  {
    nombre: 'Carlos Ríos',
    puesto: 'Asistente Fiscal',
    imagen: '/img/colaboradores/carlos.jpg',
    telefono: '523339019563',
  },
  {
    nombre: 'Owen Hurto',
    puesto: 'Desarrollador',
    imagen: '/img/colaboradores/owenhuer.jpg',
    telefono: '523316078595',
  },
  {
    nombre: 'Gilberto Gonzalez',
    puesto: 'Desarrollador',
    imagen: '/img/colaboradores/gilberto.jpg',
    telefono: '523921213634',
  },
];

const ColaboradoresGaleria = () => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [colaboradorSeleccionado, setColaboradorSeleccionado] = useState(null);

  const abrirModal = (colaborador) => {
    setColaboradorSeleccionado(colaborador);
    setModalAbierto(true);
  };

  const enviarMensajeIndividual = () => {
    if (colaboradorSeleccionado && mensaje.trim() !== '') {
      const url = `https://wa.me/${colaboradorSeleccionado.telefono}?text=${encodeURIComponent(mensaje)}`;
      window.open(url, '_blank');
      cerrarModal();
    }
  };

  const enviarMensajeGrupo = () => {
    if (mensaje.trim() !== '') {
      const linkGrupo = 'https://chat.whatsapp.com/HrOM1UXyLtM4357m3y6X60';
      window.open(linkGrupo, '_blank');
      cerrarModal();
    }
  };

  const cerrarModal = () => {
    setMensaje('');
    setColaboradorSeleccionado(null);
    setModalAbierto(false);
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {colaboradores.map((colaborador, i) => (
          <div
            key={i}
            onClick={() => abrirModal(colaborador)}
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              width: 100,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                overflow: 'hidden',
                margin: '0 auto',
                border: '2px solid #263D4F',
              }}
            >
              <img
                src={colaborador.imagen}
                alt={colaborador.nombre}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
            <div>
              <strong style={{ fontSize: 12 }}>{colaborador.nombre}</strong>
              <div style={{ fontSize: 11 }}>{colaborador.puesto}</div>
            </div>
          </div>
        ))}
      </div>

      <Modal show={modalAbierto} onHide={cerrarModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Enviar mensaje por WhatsApp</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Escribe un mensaje para <strong>{colaboradorSeleccionado?.nombre}</strong> ({colaboradorSeleccionado?.puesto})
          </p>
          <Form.Group>
            <Form.Label>Mensaje</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={enviarMensajeIndividual}>
            Enviar al colaborador
          </Button>
          <Button variant="info" onClick={enviarMensajeGrupo}>
            Enviar al grupo de soporte
          </Button>
          <Button variant="secondary" onClick={cerrarModal}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ColaboradoresGaleria;
