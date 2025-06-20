import React, { useState } from 'react';

const BitacoraMensajes = () => {
  const [mensaje, setMensaje] = useState('');
  const [mensajes, setMensajes] = useState([
    {
      autor: 'Soporte',
      contenido: 'Bienvenido a HEZA',
      fecha: '2025-06-01',
    },
  ]);

  const enviarMensaje = () => {
    if (mensaje.trim() === '') return;

    const nuevo = {
      autor: 'Tú',
      contenido: mensaje,
      fecha: new Date().toISOString().slice(0, 10), // yyyy-mm-dd
    };

    setMensajes([...mensajes, nuevo]);
    setMensaje('');
  };

  return (
    <div className="bitacora-container">
      <h3 className="bitacora-header">Bitácora de Mensajes</h3>

      {mensajes.map((msg, i) => (
        <p className="bitacora-mensaje" key={i}>
          <strong>{msg.autor}:</strong> {msg.contenido}{' '}
          <span style={{ fontSize: '0.8rem', color: '#999' }}>
            {msg.fecha}
          </span>
        </p>
      ))}

      <div className="bitacora-input">
        <textarea
          placeholder="Escribe un mensaje..."
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
        />
        <button  onClick={enviarMensaje}>Enviar</button>
      </div>
    </div>
  );
};

export default BitacoraMensajes;
