import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Loading from './components/Loading/Loading';
// import ChatBot from './components/ChatBot/ChatBot'; 
import ResetPassword from './components/adminLoading/ResetPassword';
import AdminLoading from './components/adminLoading/AdminLoading';
import AdminRegister from './components/adminLoading/AdminRegister';
import Noticias from './pages/public/Noticias';
import Eventos from './pages/public/Eventos';
import EventoDetalle from './pages/public/EventoDetalle';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPanelLayout from './components/PanelAdmin/AdminPanelLayout.jsx';
import ContaduriaAvance from './pages/adminClientes/components/ContaduriaAvance';
import ControlAuditoria from './pages/adminClientes/ControlAuditoria';
import 'bootstrap/dist/css/bootstrap.min.css';


// Componentes públicos
const Home = lazy(() => import('./pages/public/Home'));
const About = lazy(() => import('./pages/public/About'));
const Services = lazy(() => import('./pages/public/Services'));
const Contact = lazy(() => import('./pages/public/Contact'));
const Team = lazy(() => import('./pages/public/Team'));
const Encuesta = lazy(() => import('./pages/public/Encuesta'));

// Servicios
const DiagnosticoEmpresarial = lazy(() => import('./pages/public/Diagnostico_empresarial'));
const AsesoriaFiscal = lazy(() => import('./pages/public/Asesoria_fiscal'));
const Contabilidad = lazy(() => import('./pages/public/Contabilidad'));
const AsesoriaLaboralYSeguroSocial = lazy(() => import('./pages/public/Asesoria_laboral_y_seguro_social'));
const FinanzasCorporativas = lazy(() => import('./pages/public/Finanzas_Corporativas'));
const LegalCorporativo = lazy(() => import('./pages/public/Legal-Corporativo'));
const ConsultoriaYConsejosConsultivos = lazy(() => import('./pages/public/Consultoria_y_Consejos_Consultivos'));
const ProteccionPatrimonial = lazy(() => import('./pages/public/Proteccion_Patrimonial'));
const Devoluciones = lazy(() => import('./pages/public/devoluciones'));

 //Dashboard Cliente
const ClienteLayout = lazy(() => import('./pages/adminClientes/Cliente'));
const DocumentosCliente = lazy(() => import('./pages/adminClientes/DocumentosCliente'));
const DetalleDocumento = lazy(() => import('./pages/adminClientes/DetalleDocumento'));
const PerfilCliente = lazy(() => import('./pages/adminClientes/PerfilCliente'));
const ConfiguracionCliente = lazy(() => import('./pages/adminClientes/ConfiguracionCliente'));
const SolicitudesCliente = lazy(() => import('./pages/adminClientes/Solicitudes'));
// Nuevos componentes para cliente
const DashboardClientes = lazy(() => import('./pages/adminClientes/DashboardClientes'));
const SubirArchivosCliente = lazy(() => import('./pages/adminClientes/SubirArchivosCliente'));
const CheckListCliente = lazy(() => import('./pages/adminClientes/CheckListCliente'));



// Admin
const DashboardAdmin = lazy(() => import('./pages/admin/Dashboard'));
const NoticiasAdmin = lazy(() => import('./pages/admin/NoticiasAdmin'));
const EventosAdmin = lazy(() => import('./pages/admin/EventosAdmin'));
const ConfiguracionAdmin = lazy(() => import('./pages/admin/ConfiguracionAdmin'));
const UsuariosAdmin = lazy(()=> import('./pages/admin/UsuariosAdmin'));
const ClienteAdmin = lazy(()=> import('./pages/admin/ClientesAdmin'));
const NotificacionAdmin =lazy(()=> import('./pages/admin/NotificacionAdmin'));
const Crm =lazy(()=> import('./pages/admin/Crm'));

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Header />
      <Suspense fallback={<Loading fullScreen message="Cargando..." />}>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/nosotros" element={<About />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/equipo" element={<Team />} />
          <Route path="/encuesta" element={<Encuesta />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/eventos/:id" element={<EventoDetalle />} />

          {/* Rutas de servicios */}
          <Route path="/servicios/diagnostico-empresarial" element={<DiagnosticoEmpresarial />} />
          <Route path="/servicios/asesoria-fiscal" element={<AsesoriaFiscal />} />
          <Route path="/servicios/contabilidad" element={<Contabilidad />} />
          <Route path="/servicios/asesoria-laboral-y-seguro-social" element={<AsesoriaLaboralYSeguroSocial />} />
          <Route path="/servicios/finanzas-corporativas" element={<FinanzasCorporativas />} />
          <Route path="/servicios/legal-corporativo" element={<LegalCorporativo />} />
          <Route path="/servicios/consultoria-y-consejos-consultivos" element={<ConsultoriaYConsejosConsultivos />} />
          <Route path="/servicios/proteccion-patrimonial" element={<ProteccionPatrimonial />} />
          <Route path="/devoluciones" element={<Devoluciones />} />

               
           {/* Dashboard Cliente */}
          <Route path="/clientes/dashboard" element={<ClienteLayout />}>
            {/* Página principal del dashboard en forma de tarjetas */}
            <Route index element={<DashboardClientes />} />
            <Route path="control-auditoria" element={<ControlAuditoria />} />
            <Route path="solicitudes" element={<SolicitudesCliente />} />
            {/* Rutas específicas */}
            <Route path="subir" element={<SubirArchivosCliente />} />
            <Route path="documentos" element={<DocumentosCliente />} />
            <Route path="documentos/:id" element={<DetalleDocumento />} />
            <Route path="checklist" element={<CheckListCliente />} />
            <Route path="perfil" element={<PerfilCliente />} />
            <Route path="configuracion" element={<ConfiguracionCliente />} />
            <Route path="contaduria" element={<ContaduriaAvance />} />
          </Route>
          

          {/* Administración con Layout Persistente */}
          <Route path="/admin" element={<ProtectedRoute><AdminPanelLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<DashboardAdmin isAdmin={true} />} />
            <Route path="noticias" element={<NoticiasAdmin />} />
            <Route path="eventos" element={<EventosAdmin />} />
            <Route path="configuracion" element={<ConfiguracionAdmin />} />
            <Route path="usuarios" element={<UsuariosAdmin />} />
            <Route path="clientes" element={<ClienteAdmin />} />
            <Route path="tablon" element={<Crm/>}/>
            
            {/* <Route path="clientes/:id" element={<DetalleClienteAdmin />} /> */}
            <Route path="Notificacion" element={<NotificacionAdmin />} />
            {/* Redirección por defecto si se accede a /admin */}
            <Route index element={<DashboardAdmin isAdmin={true} />} /> 
          </Route>

          {/* Autenticación */}
          <Route path="/admin/login" element={<AdminLoading showLogin fullScreen />} />
          <Route path="/admin/reset-password/:token" element={<ResetPassword />} />
          <Route path="/admin/registro" element={<AdminRegister />} />
          <Route path="/acceso" element={<Loading showLogin fullScreen />} />
        </Routes>
      </Suspense>
      <Footer />
      {/* <ChatBot /> */} 
    </Router>
  );
}

export default App;