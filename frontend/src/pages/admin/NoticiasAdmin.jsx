import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Table, Badge, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import ImageUploader from '../../components/ImageUploader';
import MultiImageUploader from '../../components/MultiImageUploader';
import './admin.css';

const NoticiasAdmin = () => {
  const [showModal, setShowModal] = useState(false);
  const [nuevaNoticia, setNuevaNoticia] = useState({
    titulo: '',
    contenido: '',
    fecha: new Date().toISOString().split('T')[0],
    imagen: '',
    imagenes: []
  });
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const fetchNoticias = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/news');
      if (response.data && response.data.news) {
        setNoticias(response.data.news);
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching news:', error);
      setError('Error al cargar noticias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNoticias();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editMode && currentId) {
        response = await axios.put(`/api/news/${currentId}`, nuevaNoticia, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } else {
        response = await axios.post('/api/news', nuevaNoticia);
      }
      
      if (response.data) {
        await fetchNoticias();
        setShowModal(false);
        setNuevaNoticia({
          titulo: '',
          contenido: '',
          fecha: new Date().toISOString().split('T')[0],
          imagen: '',
          imagenes: []
        });
        setPreviewImage('');
        setEditMode(false);
        setCurrentId(null);
        alert(editMode ? 'Noticia actualizada exitosamente!' : 'Noticia creada exitosamente!');
      }
    } catch (error) {
      console.error('Error with news operation:', error);
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta noticia?')) {
      try {
        await axios.delete(`/api/news/${id}`);
        await fetchNoticias();
        alert('Noticia eliminada exitosamente!');
      } catch (error) {
        console.error('Error deleting news:', error);
        alert('Error al eliminar noticia');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevaNoticia(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (imageData) => {
    setPreviewImage(imageData);
    setNuevaNoticia(prev => ({ ...prev, imagen: imageData }));
  };

  <Form.Group className="mb-3">
    <Form.Label>Imágenes Adicionales</Form.Label>
    <MultiImageUploader 
      onImagesUpload={(imagesData) => {
        console.log('Multiple images uploaded:', imagesData);
        setNuevaNoticia(prev => ({ ...prev, imagenes: imagesData }));
      }}
      initialImages={nuevaNoticia.imagenes}
    />
    <small className="text-muted">
      {editMode && nuevaNoticia.imagenes && nuevaNoticia.imagenes.length > 0 
        ? `${nuevaNoticia.imagenes.length} imágenes cargadas` 
        : 'Puedes agregar múltiples imágenes adicionales'}
    </small>
  </Form.Group>

  const handleMultipleImagesUpload = (imagesData) => {
    setNuevaNoticia(prev => {
      return { ...prev, imagenes: imagesData };
    });
  };

  const handleOpenModal = (noticia = null) => {
    if (noticia) {
      setEditMode(true);
      setCurrentId(noticia.id);
      setNuevaNoticia({
        titulo: noticia.titulo || '',
        contenido: noticia.contenido || '',
        fecha: noticia.fecha ? noticia.fecha.split('T')[0] : new Date().toISOString().split('T')[0],
        imagen: noticia.imagen || '',
        imagenes: noticia.imagenes || []
      });
      setPreviewImage(noticia.imagen || '');
    } else {
      setEditMode(false);
      setCurrentId(null);
      setNuevaNoticia({
        titulo: '',
        contenido: '',
        fecha: new Date().toISOString().split('T')[0],
        imagen: '',
        imagenes: []
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
        <h2>Administración de Noticias</h2>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          Nueva Noticia
        </Button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <Table responsive striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Imagen</th>
              <th>Título</th>
              <th>Fecha</th>
              <th>Imágenes adicionales</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {noticias.map(noticia => (
              <tr key={noticia.id}>
                <td>{noticia.id}</td>
                <td>
                  {noticia.imagen ? (
                    <img 
                      src={getImageUrl(noticia.imagen)} 
                      alt={noticia.titulo} 
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                    />
                  ) : (
                    <Badge bg="secondary">Sin imagen</Badge>
                  )}
                </td>
                <td>{noticia.titulo}</td>
                <td>{new Date(noticia.fecha).toLocaleDateString()}</td>
                <td>
                  {noticia.imagenes && Array.isArray(noticia.imagenes) && noticia.imagenes.length > 0 ? (
                    <Badge bg="success">{noticia.imagenes.length} imágenes</Badge>
                  ) : (
                    <Badge bg="secondary">Sin imágenes adicionales</Badge>
                  )}
                </td>
                <td>
                  <Button 
                    variant="info" 
                    size="sm" 
                    className="boton-heza me-2 mb-2"
                    onClick={() => handleOpenModal(noticia)}
                  >
                    Editar
                  </Button>
                  <Button 
                    className="boton-heza-outline"
                    size="sm" 
                    onClick={() => handleDelete(noticia.id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="modal-xl-custom">
        <Modal.Header closeButton>
          <Modal.Title>
              <h3 className="display-5 text-dark mb-4">
                <span className="text-gradient-secondary"> {editMode ? 'Editar Noticia' : 'Nueva Noticia'}</span>
              </h3>
           </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control
                type="text"
                name="titulo"
                value={nuevaNoticia.titulo}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contenido</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="contenido"
                value={nuevaNoticia.contenido}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                name="fecha"
                value={nuevaNoticia.fecha}
                onChange={handleChange}
                required
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
                  <Form.Label>Imágenes Adicionales</Form.Label>
                  <MultiImageUploader 
                    onImagesUpload={handleMultipleImagesUpload}
                    initialImages={nuevaNoticia.imagenes}
                  />
                  <small className="text-muted">
                    {editMode && nuevaNoticia.imagenes && nuevaNoticia.imagenes.length > 0 
                      ? `${nuevaNoticia.imagenes.length} imágenes cargadas` 
                      : 'Puedes agregar múltiples imágenes adicionales'}
                  </small>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end">
              <Button className="boton-heza-outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button className="boton-heza me-2 mb-2" type="submit">
                {editMode ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default NoticiasAdmin;