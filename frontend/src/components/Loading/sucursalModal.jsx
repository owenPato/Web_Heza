import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';
import './Loading.css';

const SucursalModal = ({ show, onClose, onSelect }) => {
  const [sucursales, setSucursales] = useState([]);
  const [selectedSucursal, setSelectedSucursal] = useState('');

  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const { data } = await axios.get('/api/sucursales');
        setSucursales(data);
      } catch (error) {
        console.error('Error al cargar sucursales:', error);
      }
    };
    fetchSucursales();
  }, []);

  const handleConfirm = () => {
    if (selectedSucursal) {
      onSelect(selectedSucursal);
      onClose();
    } else {
      alert('Por favor selecciona una sede.');
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered className='modal-sucursal'> 
      <Modal.Header closeButton>
        <Modal.Title>Selecciona tu sucursal</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Select
          value={selectedSucursal}
          onChange={(e) => setSelectedSucursal(e.target.value)}
        >
          <option value="" disabled hidden>
            Selecciona una sede
          </option>
          {sucursales.map((sucursal) => (
            <option key={sucursal.id} value={sucursal.id}>
              {sucursal.nombre}
            </option>
          ))}
        </Form.Select>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          Confirmar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SucursalModal;
