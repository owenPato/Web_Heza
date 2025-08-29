import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Loading.css';
import SucursalModal from '../Loading/sucursalModal';


const Loading = ({ fullScreen = false, message = 'Cargando...', showLogin = false }) => {
  const [showSucursalModal, setShowSucursalModal] = useState(false);
  const [sedeId, setSedeId] = useState('');
  const [loginType, setLoginType] = useState('');
  const [showAccessRequest, setShowAccessRequest] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    telefono: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSucursalSelect = (selectedId) => {
    setSedeId(selectedId);
    console.log('✅ Sucursal seleccionada:', selectedId);
    // Aquí puedes redirigir o mostrar el siguiente paso (cliente/usuario)
  };

const handleLogin = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const response = await axios.post('/api/auth/login', {
      email: formData.email,
      password: formData.password
    });

    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    // 🔁 Redirigir según tipo de login
    if (loginType === 'user') {
      navigate('/colaboradores/dashboard');
    } else {
      navigate('/clientes/dashboard');
    }
  } catch (err) {
    setError(err.response?.data?.error || 'Error al iniciar sesión');
  } finally {
    setLoading(false);
  }
};
  const handleAccessRequest = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  setLoading(true);

  try {
    const endpoint = loginType === 'client'
      ? '/api/auth/request-client-access'
      : '/api/auth/request-user-access';

    let dataToSend;

    if (loginType === 'user') {
      // Validar email corporativo antes de enviar
      if (!formData.email.trim().endsWith('@heza.com.mx')) {
        setError('El correo debe ser corporativo (@heza.com.mx)');
        setLoading(false);
        return;
      }

      dataToSend = {
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim(),
        empresa: 'Heza',
        email: formData.email.trim(),
        sede_id: parseInt(sedeId),
      };
    } else {
      // Cliente normal
      dataToSend = {
        ...formData,
        tipo: loginType,
        sede_id: parseInt(sedeId),
      };
    }

    console.log('✅ Payload enviado al backend:', dataToSend);

    const response = await axios.post(endpoint, dataToSend);

    setSuccess(response.data.message);
    setFormData({
      nombre: '',
      empresa: '',
      telefono: '',
      email: '',
      password: '',
    });
  } catch (err) {
    setError(err.response?.data?.error || 'Error al enviar la solicitud');
  } finally {
    setLoading(false);
  }
};

  
  if (!showLogin) {
    return (
      <div className="loading-component">
        <div className={`loading-container ${fullScreen ? 'full-screen' : ''}`}>
          <div className="spinner"></div>
          <p className="loading-text">{message}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="loading-component">
      <SucursalModal
        show={showSucursalModal}   // ← ¡esto es lo que faltaba!
        onClose={() => setShowSucursalModal(false)}
        onSelect={(selectedId) => {
          setSedeId(selectedId);
          localStorage.setItem('sede_id', selectedId);
          console.log('Sucursal guardada:', selectedId);
        }}
      />

      <div className={`loading-container ${fullScreen ? 'full-screen' : ''}`}>
        <div className="login-options-container">
          {!loginType && !showAccessRequest && (
            <>
              <h2>Accesa tu portal</h2>
              
              <button 
                className="btn btn-primary w-100 mb-3"
                onClick={() => setLoginType('client')}
              >
                Entrar como Cliente
              </button>
              
              <button 
                className="btn btn-secondary w-100 mb-3"
                onClick={() => setLoginType('user')}
              >
                Entrar como Usuario
              </button>
              
              <button 
                className="btn btn-outline-primary w-100"
                onClick={() => setShowAccessRequest(true)}
              >
                Solicitar Acceso
              </button>
              
              <div className="mt-3 text-center">
                <Link to="/admin/login" className="btn btn-link">
                  Acceso Administrativo
                </Link>
              </div>
            </>
          )}
          
          {loginType && !showAccessRequest && (
            <>
              <h3>{loginType === 'client' ? 'Acceso Cliente' : 'Acceso Usuario'}</h3>
              
              {error && <div className="alert alert-danger">{error}</div>}
              
              <form onSubmit={handleLogin}>
                <div className="form-group mb-3">
                  <label htmlFor="email">Correo Electrónico</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder= {loginType === 'user' ? 'nombre@heza.com.mx' : 'ejemplo@correo.com'}
                  />
                </div>
                
                <div className="form-group mb-3">
                  <label htmlFor="password">Contraseña</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
                
                <div className="text-center">
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={() => setLoginType('')}
                  >
                    Volver
                  </button>
                </div>
              </form>
            </>
          )}
          
          {showAccessRequest && (
            <>
              <h3>Solicitar Acceso</h3>
              
              {!loginType ? (
                <>
                  <button
                    className="btn btn-primary w-100 mb-3"
                    onClick={() => {
                      setShowSucursalModal(true); // primero abre el modal
                      setLoginType('client');     // opcional: solo activar después de seleccionar
                    }}
                  >
                    Acceso como Cliente
                </button>

                  
                  <button 
                    className="btn btn-secondary w-100 mb-3"
                    onClick={() => {
                      setShowSucursalModal(true); // primero abre el modal
                      setLoginType('user'); 
                    }}
                  >
                    Acceso como Usuario
                  </button>
                  
                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-link"
                      onClick={() => {
                        setShowAccessRequest(false);
                        setLoginType('');
                      }}
                    >
                      Volver
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {error && <div className="alert alert-danger">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}
                  
                  <form onSubmit={handleAccessRequest}>
                    {loginType === 'user' && (
                      <div className="form-group mb-3">
                        <label htmlFor="nombre">Nombre Completo</label>
                        <input
                          type="text"
                          id="nombre"
                          name="nombre"
                          className="form-control"
                          value={formData.nombre}
                          onChange={handleChange}
                          required
                          placeholder="Ingresa tu nombre completo"
                        />
                      </div>
                    )}
                    
                   <div className={`form-group mb-3 ${loginType === 'user' ? 'locked' : ''}`}>
                      <label htmlFor="empresa">Empresa</label>
                      <input
                        type="text"
                        id="empresa"
                        name="empresa"
                        className="form-control"
                        value={loginType === 'user' ? 'heza' : formData.empresa}
                        onChange={handleChange}
                        disabled={loginType === 'user'}
                        required
                        placeholder="Nombre de tu empresa"
                     />
                    </div>

                    
                    <div className="form-group mb-3">
                      <label htmlFor="telefono">Teléfono</label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        className="form-control"
                        value={formData.telefono}
                        onChange={handleChange}
                        required
                        placeholder="(123) 456-7890"
                      />
                    </div>
                    
                    <div className="form-group mb-3">
                      <label htmlFor="email">Correo Electrónico</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="ejemplo@correo.com"
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      className="btn btn-primary w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? 'Enviando...' : 'Enviar Solicitud'}
                    </button>
                    
                    <div className="text-center">
                      <button
                        type="button"
                        className="btn btn-link"
                        onClick={() => setLoginType('')}
                      >
                        Volver
                      </button>
                    </div>
                  </form>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Loading;