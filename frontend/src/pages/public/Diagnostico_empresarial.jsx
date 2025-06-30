import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useForm } from 'react-hook-form';
import diagnosticoImg from '../../assets/img/img-diagnostico.png';
import {FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faStethoscope} from '@fortawesome/free-solid-svg-icons';
import SubirInformeModal from './Componentes/SubirInformeModal';

const DiagnosticoEmpresarial = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const onSubmit = (data) => {
    navigate('/encuesta', { 
      state: { 
        contactData: {
          nombre: data.nombre,
          email: data.email,
          empresa: data.empresa,
          telefono: data.telefono
        }
      } 
    });
  };

  return (
    <div className="container-fluid py-6 bg-light">
      <div className="container">
        <div className="text-center mb-6">
          <h1 className="display-2 text-dark mb-3">
            <span className="text-gradient-primary">Diagnóstico</span>
            <span className="text-gradient-secondary"> Empresarial</span>
          </h1>
          <p className="lead text-muted">
            Evaluación integral para la mejora continua de tu empresa
          </p>
        </div>

        {/* Video 1 */}
        <div className="row mb-6" data-aos="fade-up">
          <div className="col-lg-8 mx-auto">
            <div className="video-card rounded-4 shadow-lg overflow-hidden">
              <div className="ratio ratio-16x9">
                <iframe 
                  src="https://www.youtube.com/embed/sy1Ccb8ueys" 
                  title="Ejecución de diagnóstico"
                  className="scale-hover" 
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        {/* Beneficios */}
        <div className="row mb-6" data-aos="fade-up">
          <div className="col-12 text-center">
            <h3 className="display-5 text-dark mb-5">
              ¿Qué incluye nuestro diagnóstico?
            </h3>
            <div className="image-wrapper rounded-4 shadow-hover overflow-hidden mx-auto">
              <img 
                src={diagnosticoImg}
                alt="Beneficios del diagnóstico" 
                className="img-fluid"
              />
            </div>
          </div>
        </div>

        {/* Video 2 */}
        <div className="row mb-6" data-aos="fade-up">
          <div className="col-lg-8 mx-auto">
            <div className="video-card bg-dark text-white rounded-4 shadow-lg overflow-hidden">
              <div className="ratio ratio-16x9">
                <iframe 
                  src="https://www.youtube.com/embed/V4xI15f2-3Q" 
                  title="Cierre fiscal 2023"
                  className="scale-hover"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
              <div className="p-4">
                <h4 className="mb-0">¿Listo para el cierre fiscal 2024?</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <section id="pre-diagnostico">
        <div className="row justify-content-center" data-aos="fade-up">
          <div className="col-lg-15">
            <div className="form-card bg-white rounded-4 shadow-lg p-5">
              <div className="text-center mb-5">
                <div className="icon-box bg-primary-gradient text-white rounded-circle mb-4 mx-auto">
                  <i className="fas fa-file-alt fa-2x"> <FontAwesomeIcon icon={faStethoscope} /> </i>
                </div>
                <h2 className="display-5 text-dark mb-3">
                  Solicita tu <span className="text-gradient-primary">Pre-Diagnóstico</span>
                </h2>
                <p className="text-muted mb-4">
                  Completa el formulario y un especialista se pondrá en contacto contigo
                </p>
              </div>

              <div className="row justify-content-center">
                <div className="col-lg-8">
                  <div className="bg-white rounded-4 shadow-lg p-5">

                    <form onSubmit={handleSubmit(onSubmit)}>
                      
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input
                            {...register("nombre", { required: true })}
                            className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                            placeholder="Nombre completo"
                          />
                          <label>Nombre completo *</label>
                          {errors.nombre && <div className="invalid-feedback">Campo requerido</div>}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-floating">
                          <input
                            {...register("empresa", { required: true })}
                            className={`form-control ${errors.empresa ? 'is-invalid' : ''}`}
                            placeholder="Empresa"
                          />
                          <label>Empresa *</label>
                          {errors.empresa && <div className="invalid-feedback">Campo requerido</div>}
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input
                            {...register("telefono", { required: true })}
                            className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                            placeholder="Teléfono"
                          />
                          <label>Teléfono *</label>
                          {errors.telefono && <div className="invalid-feedback">Requerido</div>}
                        </div>
                      </div>

                      <div className=" col-md-12 ">
                        <div className="form-floating">
                          <input
                            {...register("email", {
                              required: true,
                              pattern: /^\S+@\S+$/i
                            })}
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            placeholder="Correo electrónico"
                          />
                          <label>Correo electrónico *</label>
                          {errors.email && <div className="invalid-feedback">Email inválido</div>}
                        </div>
                      </div>

                        <div className="col-15 text-center">
                          <button 
                            type="submit" 
                            className="btn btn-primary btn-lg px-5 py-3 rounded-pill shadow-hover"
                          >
                            Continuar al diagnóstico
                            <i className="fas fa-arrow-right ms-2"></i>
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </section>
         <button className="btn btn-primary" onClick={() => setModalVisible(true)}>
        Subir Informe PDF
      </button>

      <SubirInformeModal show={modalVisible} handleClose={() => setModalVisible(false)} />
      </div>      
    </div>
  );
};

export default DiagnosticoEmpresarial;