import React, { useState } from 'react';
import { Modal, Form } from 'react-bootstrap';
import './Cliente.css';

const documentos = [
  { nombre: 'DYP de captura', lista: 'positivo', categoria: 'Federal', fecha: '2025-03-01' },
  { nombre: 'Acuse de Recibo', lista: 'no encontrado', categoria: 'Federal' },
  { nombre: 'RTP pagado', lista: 'positivo', categoria: 'Nominas', fecha: '2025-03-02' },
  { nombre: 'Acuse de Aceptación', lista: 'no encontrado', categoria: 'Federal' },
  { nombre: 'Estados Financieros con notas', lista: 'positivo', categoria: 'Informes', fecha: '2025-03-03' },
];

const PrepararDocumentos = () => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalInfoInicial, setModalInfoInicial] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);

  const abrirModal = (doc) => {
    setDocumentoSeleccionado(doc);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setMensaje('');
    setDocumentoSeleccionado(null);
    setModalAbierto(false);
  };

  const cerrarModalInicial = () => {
    setModalInfoInicial(false);
  };

  const completados = documentos.filter(doc => doc.lista === 'positivo').length;
  const total = documentos.length;

  return (
    <>
      {/* Modal informativo al cargar */}
      <Modal show={modalInfoInicial} onHide={cerrarModalInicial} centered className="modal-whatsapp">
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title className="modal-title-custom text-gradient-primary">
            INFORMACIÓN DE DOCUMENTOS
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mensaje-para">
            Los documentos mostrados corresponden al mes <strong>anterior</strong>.  
            A partir del día <strong>25</strong> del mes en curso, los documentos comenzarán a actualizarse con la información del mes actual.
          </p>
        </Modal.Body>
        <Modal.Footer className="d-flex flex-column gap-2">
          <button className="btn-colaborador" onClick={cerrarModalInicial}>
            Entendido
          </button>
        </Modal.Footer>
      </Modal>

      {/* Contador */}
      <div className="titulo-seccion-checklist text-center mt-4 mb-4">
        <div className="meses-tabs justify-center">
          <button className="tab-btn activo">
            {completados} / {total} documentos listos
          </button>
        </div>
      </div>

      {/* Tarjetas de documentos */}
      <div className="documentos-galeria mb-5 mr-5 d-flex flex-wrap justify-content-center gap-3">
        {documentos.map((doc, index) => {
          const claseEstado = doc.lista === 'positivo' ? 'doc-positivo' : 'doc-no-encontrado';
          return (
            <div
              key={index}
              className={`card-tarjeta-doc ${claseEstado}`}
              style={{ cursor: 'pointer' }}
              onClick={() => abrirModal(doc)}
            >
              <div className="card-body text-center p-3 d-flex flex-column justify-content-between h-100">
                <div>
                  <h6 className="card-title mb-3">{doc.nombre}</h6>
                </div>
                <div>
                  <span className="badge-estado">
                     {doc.lista === 'positivo' ? 'Lista' : 'No encontrado'}
                  </span>

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal individual */}
      <Modal show={modalAbierto} onHide={cerrarModal} centered className="modal-whatsapp">
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title className="modal-title-custom text-gradient-primary">
            Documento: {documentoSeleccionado?.nombre}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mensaje-para">
            Este documento está marcado como: <strong>{documentoSeleccionado?.lista === 'positivo' ? 'Lista' : 'No encontrado'}</strong>
          </p>
          <Form.Group>
            <Form.Label className="form-label-custom">Notas internas (opcional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribe tus observaciones aquí..."
              className="input-mensaje"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="d-flex flex-column gap-2">
          <button className="btn-colaborador" onClick={cerrarModal}>
            Cerrar
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PrepararDocumentos;
