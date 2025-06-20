import React, { useState, useEffect } from 'react';
import useCliente from '../../hooks/useCliente';
import axios from 'axios';
import './Cliente.css';
import * as Swal from 'sweetalert2'; // ✅ Esto sí funcionará con .fire()


const PerfilCliente = () => {
  const cliente = useCliente();
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

  // Cuando los datos están listos, los pasamos al formulario
  useEffect(() => {
    if (cliente) {
      setFormData({
        direccion: cliente.direccion || '',
        ciudad: cliente.ciudad || '',
        estado: cliente.estado || '',
        codigo_postal: cliente.codigo_postal || '',
        giro: cliente.giro || '',
        numero_empleados: cliente.numero_empleados || '',
        ventas_anuales: cliente.ventas_anuales || '',
        email: cliente.email || ''
      });
    }
  }, [cliente]);

  if (!cliente) return <p>Cargando perfil del cliente...</p>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/clientes/${cliente.cliente_id}`, formData);
      
      Swal.fire({
        icon: 'success',
        title: 'Actualizado',
        text: 'Datos guardados.',
        timer: 1500,
        showConfirmButton: false
      });

    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al guardar los cambios.',
        confirmButtonText: 'Cerrar'
      });
    }
  };

  return (
  <div className="container py-4">
    <h2 className="display-6 text-dark mb-0">
              <span className="text-gradient-primary">Editar perfil </span>
              <span className="text-gradient-secondary"> {cliente.empresa}</span>
    </h2>
    <form onSubmit={handleSubmit} className="p-4 shadow-sm card shadow specialty-cards row g-3">
      {/* Dirección y Ciudad */}
      <div className="col-md-6 form-group">
        <label className="form-label">Dirección</label>
        <input name="direccion" value={formData.direccion} onChange={handleChange} className="form-control" />
      </div>

      <div className="col-md-6 form-group">
        <label className="form-label">Ciudad</label>
        <input name="ciudad" value={formData.ciudad} onChange={handleChange} className="form-control" />
      </div>

      {/* Estado, CP, Giro, Empleados */}
      {/* === Estado, CP, Giro, Empleados === */}
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

{/* === Ventas y Correo === */}
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
 
    <div className="col-md-6 form-group ">
      <label className="form-label">Correo de contacto</label>
      <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" />
    </div>
      {/* Botón */}
      <div className="col-7 text-end mt-3">
        <button type="submit" className="btn btn-primary px-4">Guardar cambios</button>
      </div>
    </form>
  </div>
 );
};
export default PerfilCliente;
