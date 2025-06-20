import React, { useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import './ModalCambioPassword.css'; // asegúrate de tenerlo en la misma carpeta

const ModalCambioPassword = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuardar = async () => {
    if (!currentPassword || !newPassword || !confirmar) {
      return Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
    }

    if (newPassword !== confirmar) {
      return Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data?.success || response.status === 200) {
        Swal.fire('Éxito', 'Contraseña actualizada correctamente', 'success');
        const user = JSON.parse(localStorage.getItem('user'));
        user.primera_vez = 0;
        localStorage.setItem('user', JSON.stringify(user));
        onClose();
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.response?.data?.error || 'No se pudo actualizar la contraseña', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop show"></div>
      <div className="modal d-block">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content shadow">
            <div className="modal-header">
              <h3 className="text-dark mb-2">
                <span className="text-gradient-primary">Actualizar Contraseña</span>
              </h3>
            </div>
            <div className="modal-body">
              <p className="text-muted">
                Por seguridad, debes ingresar tu contraseña actual y una nueva.
              </p>

              <div className="mb-3">
                <label>Contraseña Actual</label>
                <input
                  type="password"
                  className="form-control"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label>Nueva Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label>Confirmar Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button disabled={loading} className="btn btn-primary" onClick={handleGuardar}>
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalCambioPassword;
