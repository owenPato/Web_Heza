import React, { useState } from 'react';
import { Modal, Form } from 'react-bootstrap';
import '../Cliente.css'; // Asegúrate de crear este archivo CSS

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
      <div className="colaboradores-galeria ">
        {colaboradores.map((colaborador, i) => (
          <div
            key={i}
            className={`colaborador-card ${colaboradorSeleccionado?.nombre === colaborador.nombre ? 'activo' : ''}` }
            onClick={() => abrirModal(colaborador)}
          >
            <div className="colaborador-img specialty-card ">
              <img src={colaborador.imagen} alt={colaborador.nombre} />
            </div>
            <div className="colaborador-info">
              <strong>{colaborador.nombre}</strong>
              <div>{colaborador.puesto}</div>
            </div>
          </div>
        ))}
      </div>

      <Modal show={modalAbierto} onHide={cerrarModal} centered className="modal-whatsapp">
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title className="modal-title-custom text-gradient-primary">Enviar mensaje por WhatsApp</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="mensaje-para">
            Escribe un mensaje para <strong>{colaboradorSeleccionado?.nombre}</strong> ({colaboradorSeleccionado?.puesto})
          </p>
          <Form.Group>
            <Form.Label className="form-label-custom">Mensaje</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              className="input-mensaje"
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="d-flex flex-column gap-2">
          <button className="btn-colaborador" onClick={enviarMensajeIndividual}>
            Enviar al colaborador
          </button>
          <button className="btn-cancelar" onClick={cerrarModal}>
            Cancelar
          </button>
        </Modal.Footer>
      </Modal>

    </>
  );
};

export default ColaboradoresGaleria;
