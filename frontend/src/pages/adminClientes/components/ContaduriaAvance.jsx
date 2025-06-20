import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpring, animated } from '@react-spring/web';

const ContaduriaAvance = ({ porcentaje = 100 }) => {
  const navigate = useNavigate();
   // TODO: conectar con progreso real
     const progressSpring = useSpring({
    from: { width: '0%' },
    to: { width: `${porcentaje}%` },
    config: { tension: 250, friction: 250 }, // efecto "spring"
  });

  // Animación del número
  const numberSpring = useSpring({
    from: { value: 0 },
    to: { value: porcentaje },
    config: { duration: 4500 },
  });
return ( 
  <div className="avance-contaduria-box">
      <h3>Avance de Contaduría</h3>

      <div className="progreso-barra">
        <animated.div
          className="progreso"
          style={progressSpring}
        >
          <animated.span>
            {numberSpring.value.to(val => `${Math.round(val)}%`)}
          </animated.span>
        </animated.div>
      </div>

      <p>Tu servicio contable va en proceso.</p>

      <button onClick={() => navigate('/clientes/dashboard/contaduria')}>
        Ver más
      </button>
    </div>
  );
};

export default ContaduriaAvance;
