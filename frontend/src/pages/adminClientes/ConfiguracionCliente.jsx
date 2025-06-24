import React, { useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import '../../pages/admin/admin.css';
import './Cliente.css';

const ConfiguracionCliente = () => {
  const [flipped, setFlipped] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleFlip = () => setFlipped(!flipped);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !password || !confirmPassword) {
      return Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
    }

    if (password.length < 8) {
      return Swal.fire('Error', 'La nueva contraseña debe tener al menos 8 caracteres', 'error');
    }

    if (password !== confirmPassword) {
      return Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
    }

    try {
      const token = localStorage.getItem('token');

      await axios.post('/api/auth/change-password', {
        currentPassword,
        newPassword: password
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      Swal.fire({
        icon: 'success',
        title: '¡Contraseña actualizada!',
        text: 'Tu contraseña ha sido cambiada correctamente.'
      });

      setPassword('');
      setCurrentPassword('');
      setConfirmPassword('');
      setFlipped(false);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', error.response?.data?.error || 'Hubo un problema al actualizar la contraseña', 'error');
    }
  };

  return (
    <div className="container py-4">
      <h5 className="display-6 text-dark mb-4">
        <span className="text-gradient-primary">Configuración</span>
        <span className="text-gradient-secondary"> de la Cuenta</span>
      </h5>

      <div className="card-flip-container">
        <div className={`card-flip ${flipped ? 'flipped' : ''}`}>
          {/* Lado frontal */}
          <div className="card-front card shadow card-heza p-4">
            <h4 className="text-center text-dark">Cambiar Contraseña</h4>
            <div className="text-center mt-4">
              <button className="btn boton-heza" onClick={handleFlip}>
                <i className="fas fa-lock me-2"></i>Cambiar Contraseña
              </button>
            </div>
          </div>

          {/* Lado trasero */}
          <div className="card-back perfilCliente-card p-4">
            <h4 className="text-center text-white mb-3">Nueva Contraseña</h4>
            <form onSubmit={handleSubmit} className="specialty-cards">
              <div className="form-group mb-3">
                <label className="form-label">Contraseña actual</label>
                <input
                  type="password"
                  className="form-control"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Nueva contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Confirmar contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="d-flex justify-content-end gap-3">
                <button type="button" className="btn btn-outline-secondary-custom" onClick={handleFlip}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-outline-secondary-custom">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ConfiguracionCliente;
