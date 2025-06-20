import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import useCliente from '../../hooks/useCliente';
import ModalPrimeravez from './ModalPrimeravez'; // ✅ Import correcto

const Cliente = () => {
  const cliente = useCliente();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(() => {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  return storedUser?.primera_vez === 1;
});


  useEffect(() => {
    if (cliente && !localStorage.getItem('primera_vez_cliente')) {
      setShowModal(true);
    }
  }, [cliente]);

  const handleModalClose = () => {
    localStorage.setItem('primera_vez_cliente', 'true');
    setShowModal(false);
  };

  if (!cliente) return <p>Cargando datos del cliente...</p>;

  return (
    <div className="container py-5">
      <h1 className="display-2 text-dark mb-4">
        <span className="text-gradient-primary">Bienvenido</span>
        <span className="text-gradient-secondary"> {cliente.empresa}</span>
      </h1>

      <div className="row ">
        <div className="col-md-3">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="display-7 text-dark mb-4">
                <span className="text-gradient-primary">Información </span>
                <span className="text-gradient-secondary"> Empresa</span>
              </h5>
              <ul className="list-group list-group-flush">
                <li className="list-group-item specialty-card">
                  <p><strong className="form-text text-primary">RFC:</strong> {cliente.rfc}</p>
                </li>
                <li className="list-group-item specialty-card">
                  <p><strong className="form-text text-primary">Dirección:</strong> {cliente.direccion}, {cliente.ciudad}, {cliente.estado}, C.P. {cliente.codigo_postal}</p>
                </li>
                <li className="list-group-item specialty-card">
                  <p><strong className="form-text text-primary">Giro:</strong> {cliente.giro}</p>
                </li>
              </ul>
            </div>
          </div>

          <nav className="card shadow-sm">
            <div className="list-group list-group-flush ">
              <button to="documentos" className="list-group-item list-group-item-action specialty-card"  onClick={() => navigate('/clientes/dashboard')}>
                <span className="section-badge bg-primary-soft text-primary fas fa-folder-open ">
                  Documentos
                </span>
              </button>
              <button to="perfil" className="list-group-item list-group-item-action specialty-card"  onClick={() => navigate('/clientes/dashboard/perfil')}>
                <span className="section-badge bg-primary-soft text-primary fas fa-folder-open ">
                  Perfil Empresa
                </span>
              </button>
              <button to="configuracion" className="list-group-item list-group-item-action specialty-card"  onClick={() => navigate('/clientes/dashboard/configuracion')}>
                <span className="section-badge bg-primary-soft text-primary fas fa-folder-open ">
                  Configuración
                </span>
              </button>
            </div>
          </nav>
        </div>

        <div className="col-md-9">
          <Outlet />
        </div>
      </div>

      {/* ✅ Modal controlado por estado */}
      {showModal && <ModalPrimeravez onClose={handleModalClose} />}
    </div>
  );
};

export default Cliente;
