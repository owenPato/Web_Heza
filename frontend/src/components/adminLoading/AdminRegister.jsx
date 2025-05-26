import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminLoading.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const AdminRegister = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol] = useState('admin');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sucursales, setSucursales] = useState([]);
  const [sede_id, setSedeId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const res = await axios.get('/api/sucursales');
        setSucursales(res.data);
        setSedeId(res.data[0]?.id); // establecer la primera por defecto
      } catch (err) {
        console.error('Error al cargar sucursales', err);
      }
    };

    fetchSucursales();
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password || !confirmPassword || !telefono) {
      setError('Todos los campos son obligatorios');
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      setError('El nombre de usuario solo puede contener letras, números y guiones bajos');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      await axios.post('/api/auth/register', {
        username,
        email: `${username}@heza.com.mx`,
        password,
        telefono,
        rol,
        sede_id, // ✅ agregado aquí
      });

      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar el administrador');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (success) {
    return (
      <div className="admin-loading-container">
        <div className="admin-login-form">
          <div className="alert alert-success">
            <h4 className="text-center mb-4">¡Registro exitoso!</h4>
            <p>El administrador ha sido registrado correctamente.</p>
            <div className="text-center mt-4">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/admin/acceso')}
              >
                Ir al inicio de sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-loading-container">
      <div className="admin-login-form">
        <h2 className="text-center">Registro de Administrador</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>

          <div className="admin-form-group">
            <label>Correo Institucional</label>
            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Correo Heza"
                required
              />
              <div className="input-group-text">@heza.com.mx</div>
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="username">Nombre de Usuario</label>
            <input
              type="text"
              id="username"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input
              type="tel"
              id="telefono"
              className="form-control"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={togglePasswordVisibility}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="eye-icon" />
              </button>
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={toggleConfirmPasswordVisibility}
              >
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} className="eye-icon" />
              </button>
            </div>
          </div>

          <div className="admin-form-group">
            <label>Sucursal</label>
            <select
                className="form-control"
                value={sede_id}
                onChange={(e) => setSedeId(e.target.value)}
                required
              >
                <option value="" disabled>
                  Selecciona una sucursal
                </option>
                {sucursales.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
             </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mt-4"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrar Administrador'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminRegister;


// Eliminar campo de email del formulario
<mcfile name="AdminRegister.jsx" path="frontend/src/components/adminLoading/AdminRegister.jsx"></mcfile>