import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AccessRequest.css';
import { useLocation } from 'react-router-dom';

const AccessRequest = () => {
  const location = useLocation();
  const [requestType, setRequestType] = useState('');
  const [sedeId, setSedeId] = useState(localStorage.getItem('sede_id'));
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    telefono: '',
    email: '',
    rfc: '',
    password: '',
    confirmPassword: '',
    sucursal: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
  const storedSede = localStorage.getItem('sede_id');
  console.log('✅ Sede almacenada en localStorage:', storedSede);
  if (storedSede) {
    setSedeId(parseInt(storedSede));  // <--- aquí lo asignas al estado
  }
   document.title = 'HEZA - Solicitud de Acceso';
}, [location.state]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validatePassword = () => {
    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: 'Las contraseñas no coinciden'
      }));
      return false;
    }

    if (formData.password.length < 8) {
      setErrors(prev => ({
        ...prev,
        password: 'La contraseña debe tener al menos 8 caracteres'
      }));
      return false;
    }

    return true;
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

   if (!formData.email.trim()) {
     newErrors.email = 'El correo electrónico es obligatorio';
   } else if (!emailRegex.test(formData.email)) {
     newErrors.email = 'Formato de correo electrónico inválido';
   } else if (!formData.email.endsWith('@heza.com.mx')) {
     newErrors.email = 'El correo debe ser corporativo (@heza.com.mx)';
}


    if (!formData.empresa.trim()) {
      newErrors.empresa = 'El nombre de la empresa es obligatorio';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    }

    if (requestType === 'user') {
      if (!formData.nombre.trim()) {
        newErrors.nombre = 'El nombre es obligatorio';
      }

      if (!formData.password) {
        newErrors.password = 'La contraseña es obligatoria';
      } else if (formData.password.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Debe confirmar la contraseña';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');

    if (!validateForm()) return;
    if (requestType === 'user' && !validatePassword()) return;

    setLoading(true);

    try {
      const endpoint = requestType === 'client'
        ? '/api/auth/request-client-access'
        : '/api/auth/request-user-access';

      const dataToSend = {
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        empresa: requestType === 'user' ? 'heza' : formData.empresa.trim(),  // ← fijo para user
        tipo: requestType,
        sede_id: parseInt(sedeId),
      };
       console.log('✅ Sede ID que se enviará:', sedeId);
       console.log('✅ Payload enviado al backend:', dataToSend);


      if (requestType === 'user') {
        if (formData.nombre.trim()) dataToSend.nombre = formData.nombre.trim();
        if (formData.password) dataToSend.password = formData.password;
      }
      console.log('📦 Data enviada al backend:', dataToSend);

     const response = await axios.post(endpoint, dataToSend, {
     headers: { 'Content-Type': 'application/json' }
     });


      setSuccess(response.data.message || 'Solicitud enviada correctamente.');
      setFormData({
        nombre: '',
        empresa: '',
        telefono: '',
        email: '',
        rfc: '',
        password: '',
        confirmPassword: '',
        sucursal: ''
      });

      setTimeout(() => {
        setRequestType('');
      }, 5000);
    } catch (err) {
      console.error("❌ Error en envío:", err);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({
          general:
            err.response?.data?.error || 'Error al enviar la solicitud. Intenta nuevamente.'
        });
      }
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="access-request-container">
      <div className="access-request-form">
        <h2 className="text-center">Solicitar Acceso</h2>
        
        {!requestType ? (
          <div className="access-type-selection">
            <p className="text-center mb-4">Selecciona el tipo de acceso que deseas solicitar:</p>
            
            <button 
              className="btn btn-primary w-100 mb-3"
              onClick={() => setRequestType('client')}
            >
              Acceso como Cliente
            </button>
            
            <button 
              className="btn btn-secondary w-100"
              onClick={() => setRequestType('user')}
            >
              Acceso como Usuario
            </button>
          </div>
        ) : (
          <>
            {errors.general && <div className="alert alert-danger">{errors.general}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3">
                <label htmlFor="nombre">Nombre Completo</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                  value={formData.nombre}
                  onChange={handleChange}
                />
                {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
              </div>
              
              <div className="form-group mb-3">
                  <label htmlFor="empresa">Nombre de la Empresa</label>
                  {requestType === 'user' ? (
                    <input
                      type="text"
                      id="empresa"
                      name="empresa"
                      className="form-control"
                      value="heza"      // ← fijo solo para usuario
                      disabled
                    />
                  ) : (
                    <input
                      type="text"
                      id="empresa"
                      name="empresa"
                      className={`form-control ${errors.empresa ? 'is-invalid' : ''}`}
                      value={formData.empresa}
                      onChange={handleChange}
                    />
                  )}
                  {errors.empresa && <div className="invalid-feedback">{errors.empresa}</div>}
              </div>
              
              {requestType === 'client' && (
                <>
                  <div className="form-group mb-3">
                    <label htmlFor="rfc">RFC</label>
                    <input
                      type="text"
                      id="rfc"
                      name="rfc"
                      className={`form-control ${errors.rfc ? 'is-invalid' : ''}`}
                      value={formData.rfc}
                      onChange={handleChange}
                      placeholder="Ej. XAXX010101000"
                    />
                    {errors.rfc && <div className="invalid-feedback">{errors.rfc}</div>}
                  </div>
                  <div className="form-group mb-3">
                    <label htmlFor="password">Contraseña</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mínimo 8 caracteres"
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>
                  
                  <div className="form-group mb-3">
                    <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                  </div>
                </>
              )}
              
              <div className="form-group mb-3">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ej. 3331234567"
                />
                {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
              </div>
              
              <div className="form-group mb-3">
                <label htmlFor="email">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ejemplo@correo.com"
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
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
                  onClick={() => {
                    setRequestType('');
                    setErrors({});
                    setSuccess('');
                  }}
                >
                  Volver a selección de tipo de acceso
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AccessRequest;