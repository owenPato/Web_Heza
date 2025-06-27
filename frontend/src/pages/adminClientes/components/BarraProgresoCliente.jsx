import React from 'react';
import '../Cliente.css';
import { useSpring, animated } from '@react-spring/web';

const BarraProgresoCliente = ({ progreso }) => {
    
    const animacion = useSpring({
    from: { width: '0%' },
    to: { width: `${progreso}%` },
    config: { tension: 150, friction: 200 }
  });

  return (
    <div className="barra-progreso-container">
      <div className="barra-progreso">
        <animated.div
          className="barra-relleno"
          style={animacion}
          role="progressbar"
          aria-valuenow={progreso}
          aria-valuemin="0"
          aria-valuemax="100"
        >
            
        </animated.div>
        
      </div>
      <p className="progreso-texto">{progreso}% Completado</p>
    </div>
  );
};

export default BarraProgresoCliente;
