import React from 'react';
import { Carousel } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import carousel1 from '../assets/img/carousel-1.jpg';
import carousel2 from '../assets/img/carousel-2.jpg';

const HeroCarousel = () => {
  const navigate = useNavigate();

  const handleWhatsApp = () => {
    window.open('https://wa.me/523331674762', '_blank');
  };

  return (
    <Carousel fade interval={5000} className="hero-carousel">
      <Carousel.Item style={{ height: "100vh", minHeight: "400px" }}>
        <div className="image-overlay"></div>
        <img
          className="d-block w-100 h-100 zoom-effect"
          src={carousel1}
          alt="First slide"
          style={{ objectFit: "cover" }}
        />
        <Carousel.Caption className="d-flex flex-column align-items-center justify-content-center h-100">
          <div className="text-center animated-content" style={{ maxWidth: '800px' }}>
            <h3 className="text-white text-uppercase mb-4 animate__fadeInDown">
              CUIDA LA SALUD DE TU EMPRESA
            </h3>
            <h4 className="display-5  text-white mb-4 animate__fadeInUp">
              En Heza nos encargamos de la salud fiscal de tu empresa, cuidando siempre el patrimonio de tus socios y colaboradores.
            </h4>
            <button 
              className="btn btn-primary py-3 px-5 mt-3 animate__zoomIn"
              onClick={() => navigate('/contacto')}
            >
              Obten una sesión
              <i className="fas fa-chevron-right ml-2"></i>
            </button>
          </div>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item style={{ height: "100vh", minHeight: "400px" }}>
        <div className="image-overlay"></div>
        <img
          className="d-block w-100 h-100 zoom-effect"
          src={carousel2}
          alt="Second slide"
          style={{ objectFit: "cover" }}
        />
        <Carousel.Caption className="d-flex flex-column align-items-center justify-content-center h-100">
          <div className="text-center animated-content" style={{ maxWidth: '800px' }}>
            <h3 className="text-white text-uppercase mb-4 animate__fadeInDown">
              GUIAMOS FISCAL Y CORPORATIVAMENTE
            </h3>
            <h4 className="display-5  text-white mb-4 animate__fadeInUp">
              Te diseñamos una estrategia fiscal especializada para tu empresa, minimizando los riesgos y protegiendo tu patrimonio.
            </h4>
            <button 
              className="btn btn-primary py-3 px-5 mt-3 animate__zoomIn"
              onClick={handleWhatsApp}
            >
              Llamanos
              <i className="fas fa-phone ml-2"></i>
            </button>
          </div>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
};

export default HeroCarousel;