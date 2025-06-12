import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Card, Row, Col, Badge } from 'react-bootstrap';
import axios from 'axios';
import ImageUploader from '../../components/ImageUploader';
import MultiImageUploader from '../../components/MultiImageUploader';
import TimeInput from '../../components/Time/TimeInput';
import './admin.css';

const EventosAdmin = () => {
  const [showModal, setShowModal] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [nuevoEvento, setNuevoEvento] = useState({
    titulo: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: '18:00',
    ubicacion: '',
    tipo: 'Próximo',
    descripcion: '',
    imagen: '',
    galeria: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const fetchEventos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data && response.data.events) {
        setEventos(response.data.events);
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      let response;
      if (editMode && currentId) {
        response = await axios.put(`/api/events/${currentId}`, nuevoEvento, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        response = await axios.post('/api/events', nuevoEvento, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      if (response.data) {
        await fetchEventos();
        setShowModal(false);
        setNuevoEvento({
          titulo: '',
          fecha: new Date().toISOString().split('T')[0],
          hora: '18:00',
          ubicacion: '',
          tipo: 'Próximo',
          descripcion: '',
          imagen: '',
          galeria: []
        });
        setPreviewImage('');
        setEditMode(false);
        setCurrentId(null);
        alert(editMode ? 'Evento actualizado exitosamente!' : 'Evento creado exitosamente!');
      }
    } catch (error) {
      console.error('Error with event operation:', error);
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este evento?')) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(`/api/events/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        await fetchEventos();
        alert('Evento eliminado exitosamente!');
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error al eliminar evento');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoEvento(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (imageData) => {
    setPreviewImage(imageData);
    setNuevoEvento(prev => ({ ...prev, imagen: imageData }));
  };

  const handleMultipleImagesUpload = (imagesData) => {
    setNuevoEvento(prev => {
      return { ...prev, galeria: imagesData };
    });
  };

  const handleOpenModal = (evento = null) => {
    if (evento) {
      setEditMode(true);
      setCurrentId(evento.id);
      setNuevoEvento({
        titulo: evento.titulo || '',
        descripcion: evento.descripcion || '',
        fecha: evento.fecha ? evento.fecha.split('T')[0] : new Date().toISOString().split('T')[0],
        hora: evento.hora || '18:00',
        ubicacion: evento.ubicacion || '',
        tipo: evento.tipo || 'Próximo',
        imagen: evento.imagen || '',
        galeria: evento.galeria || []
      });
      setPreviewImage(evento.imagen || '');
    } else {
      setEditMode(false);
      setCurrentId(null);
      setNuevoEvento({
        titulo: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: '18:00',
        ubicacion: '',
        tipo: 'Próximo',
        descripcion: '',
        imagen: '',
        galeria: []
      });
      setPreviewImage('');
    }
    setShowModal(true);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/100x100?text=No+Image';
    
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    
    return `${process.env.REACT_APP_API_URL || ''}${imagePath}`;
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between mb-4">
        <h2>Administración de Eventos</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Nuevo Evento
        </Button>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Editar Evento' : 'Nuevo Evento'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Título del Evento</Form.Label>
                  <Form.Control
                    type="text"
                    name="titulo"
                    required
                    value={nuevoEvento.titulo}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha"
                    required
                    value={nuevoEvento.fecha}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Hora del Evento</Form.Label>
                  <TimeInput
                    value={nuevoEvento.hora}
                    onChange={(newTime) => setNuevoEvento(prev => ({
                      ...prev,
                      hora: newTime
                    }))}
                  />
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Evento</Form.Label>
                  <Form.Select
                    name="tipo"
                    value={nuevoEvento.tipo}
                    onChange={handleChange}
                  >
                    <option value="Próximo">Próximo</option>
                    <option value="Pasado">Pasado</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Ubicación</Form.Label>
              <Form.Control
                type="text"
                name="ubicacion"
                required
                value={nuevoEvento.ubicacion}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="descripcion"
                value={nuevoEvento.descripcion || ''}
                onChange={handleChange}
                placeholder="Describe los detalles del evento"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Imagen Principal</Form.Label>
                  <ImageUploader 
                    onImageUpload={handleImageUpload} 
                    initialImage={previewImage}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Galería de Imágenes</Form.Label>
                  <MultiImageUploader 
                    onImagesUpload={handleMultipleImagesUpload}
                    initialImages={nuevoEvento.galeria}
                  />
                  <small className="text-muted">
                    {editMode && nuevoEvento.galeria && nuevoEvento.galeria.length > 0 
                      ? `${nuevoEvento.galeria.length} imágenes cargadas` 
                      : 'Puedes agregar múltiples imágenes para la galería del evento'}
                  </small>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button className='boton-heza-outline' onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button className="boton-heza" type="submit">
                {editMode ? 'Actualizar' : 'Guardar'} Evento
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <Row>
          {eventos.map(evento => (
            <Col md={4} key={evento.id} className="mb-4">
              <Card className="h-100 shadow-sm border-0">
                <Card.Img 
                  variant="top" 
                  src={getImageUrl(evento.imagen)} 
                  style={{ height: '200px', objectFit: 'cover', borderRadius: '10px 10px 0 0' }} 
                />
                <Card.Body className="p-4">
                  <Card.Title className="fw-bold">{evento.titulo}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    <i className="bi bi-calendar-event me-2"></i>
                    {new Date(evento.fecha).toLocaleDateString()} - {evento.ubicacion}
                  </Card.Subtitle>
                  {evento.descripcion && (
                    <p className="text-muted small mb-3 text-truncate">{evento.descripcion}</p>
                  )}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className={`badge ${evento.tipo === 'Próximo' ? 'bg-success' : 'bg-secondary'} px-3 py-2`}>
                      {evento.tipo}
                    </span>
                    {evento.galeria && Array.isArray(evento.galeria) && evento.galeria.length > 0 && (
                      <Badge bg="info" className="px-3 py-2">
                        {evento.galeria.length} fotos
                      </Badge>
                    )}
                  </div>
                  
                  {evento.galeria && Array.isArray(evento.galeria) && evento.galeria.length > 0 && (
                    <div className="mb-3 overflow-auto" style={{ whiteSpace: 'nowrap' }}>
                      {evento.galeria.slice(0, 3).map((img, idx) => (
                        <img 
                          key={idx} 
                          src={getImageUrl(img)} 
                          alt={`Galería ${idx + 1}`} 
                          className="me-2" 
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '5px' }} 
                        />
                      ))}
                      {evento.galeria.length > 3 && (
                        <Badge bg="secondary" className="px-2 py-2 align-middle">
                          +{evento.galeria.length - 3} más
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="d-flex gap-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleOpenModal(evento)}
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(evento.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default EventosAdmin;