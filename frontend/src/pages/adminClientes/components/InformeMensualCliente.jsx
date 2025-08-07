import React from 'react';
import '../Cliente.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const InformeMensualCliente = ({ indicadores, impuestos, cumplimiento }) => {
  return (
    <div className="informe-mensual-box">
      
      {/* Indicadores */}
      <div className="indicadores-contenedor">
        {indicadores.map((indicador, index) => (
          <div className="indicador-flip-card" key={index}>
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <h5 className='text-gradient-secondary'>{indicador.nombre}</h5>
              </div>
              <div className="flip-card-back">
                <span>{indicador.valor2025}</span>
              </div>
            </div>
          </div>
        ))}
      </div>




      {/* Impuestos */}
    <div className="impuestos-rediseñados">
      <h4 className="titulo-impuestos text-gradient-secondary">Resumen de Impuestos por Pagar</h4>
      <div className="lista-impuestos">
        {impuestos.map((item, index) => (
          <div className="item-impuesto" key={index}>
            <span className="nombre-impuesto">{item.nombre}</span>
            <span className="valor-impuesto">{item.valor}</span>
          </div>
        ))}
      </div>
    </div>



      {/* Cumplimiento */}
      <div className="cumplimiento-carrusel mt-5">
        <h4 className="text-gradient-secondary">Cumplimiento de Obligaciones Fiscales y Seguridad Social</h4>
       <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={20}
          slidesPerView={3}
          loop={true}
          slideToClickedSlide={true}
          watchSlidesProgress={true}
          breakpoints={{
            320: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
          }}
        >
          {cumplimiento.map((item, index) => (
            <SwiperSlide key={index}>
              {({ isActive }) => (
                <div className={`cumplimiento-card ${isActive ? 'activa' : 'inactiva'}`}>
                  <div className="titulo text-gradient-secondary ">{item.nombre}</div>

                  {isActive && (
                    <>
                      <div className="estado">
                        {item.cumplida ? '✅ Cumplida' : '❌ No Aplica'}
                      </div>
                                         </>
                  )}
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>

      </div>
    </div>
  );
};

export default InformeMensualCliente;
