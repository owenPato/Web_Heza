import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Cliente.css';

const PerfilCliente = () => {
  const [cliente, setCliente] = useState(null);
  const [formData, setFormData] = useState({
    direccion: '',
    ciudad: '',
    estado: '',
    codigo_postal: '',
    giro: '',
    numero_empleados: '',
    ventas_anuales: '',
    email: ''
  });

  useEffect(() => {
    const fetchCliente = async () => {
      const clienteId = localStorage.getItem('cliente_id');
      console.log('🔍 cliente_id desde localStorage:', clienteId);

      if (!clienteId) {
        console.warn('❌ No se encontró cliente_id en localStorage');
        return;
      }

      try {
        const { data } = await axios.get(`http://localhost:5000/api/clientes/por-id/${clienteId}`);
        setCliente(data);
        setFormData({
          direccion: data.direccion || '',
          ciudad: data.ciudad || '',
          estado: data.estado || '',
          codigo_postal: data.codigo_postal || '',
          giro: data.giro || '',
          numero_empleados: data.numero_empleados || '',
          ventas_anuales: data.ventas_anuales || '',
          email: data.email || ''
        });
      } catch (error) {
        console.error('❌ Error al obtener cliente:', error);
        Swal.fire({
          icon: 'error',
          title: 'No se pudo cargar el perfil',
          text: 'Verifica tu sesión o intenta más tarde.',
          confirmButtonText: 'Aceptar'
        });
      }
    };

    fetchCliente();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clienteId = localStorage.getItem('cliente_id');

    try {
      await axios.put(`http://localhost:5000/api/clientes/${clienteId}`, formData);

      Swal.fire({
        icon: 'success',
        title: 'Actualizado',
        text: 'Datos guardados correctamente.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('❌ Error al actualizar cliente:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al guardar los cambios.',
        confirmButtonText: 'Cerrar'
      });
    }
  };

  if (!cliente) return <p className="ps-5 fs-4 fw-semibold text-secondary">Cargando perfil del cliente...</p>;

  return (
    <div className="container py-4 fuente-formal">
      <h2 className="display-6 text-dark mb-0">
        <span className="text-gradient-primary">Editar perfil </span>
        <span className="text-gradient-secondary">{cliente.empresa}</span>
      </h2>

      <form onSubmit={handleSubmit} className="p-4 shadow-sm card shadow specialty-cards row g-3 mt-4">
        <div className="col-md-6 form-group">
          <label className="form-label">Dirección</label>
          <input name="direccion" value={formData.direccion} onChange={handleChange} className="form-control" />
        </div>

        <div className="col-md-6 form-group">
          <label className="form-label">Ciudad</label>
          <input name="ciudad" value={formData.ciudad} onChange={handleChange} className="form-control" />
        </div>

        <div className="row g-3">
          <div className="col-md-3 form-group">
            <label className="form-label">Estado</label>
            <input name="estado" value={formData.estado} onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-3 form-group">
            <label className="form-label">Código Postal</label>
            <input name="codigo_postal" value={formData.codigo_postal} onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-3 form-group">
            <label className="form-label">Giro</label>
            <input name="giro" value={formData.giro} onChange={handleChange} className="form-control" />
          </div>
        </div>

        <div className="row g-3 justify-content-center">
          <div className="col-md-6 form-group">
            <label className="form-label">Número de empleados</label>
            <input type="number" name="numero_empleados" value={formData.numero_empleados} onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-6 form-group">
            <label className="form-label">Ventas anuales</label>
            <input type="number" name="ventas_anuales" value={formData.ventas_anuales} onChange={handleChange} className="form-control" />
          </div>
        </div>

        <div className="col-md-6 form-group">
          <label className="form-label">Correo de contacto</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" />
        </div>

        <div className="col-7 text-end mt-3">
          <button type="submit" className="btn btn-primary px-4">Guardar cambios</button>
        </div>
      </form>
    </div>
  );
};

export default PerfilCliente;
