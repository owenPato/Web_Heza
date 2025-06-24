import React ,{ useRef } from 'react';
import './Cliente.css';
import Swal from 'sweetalert2';

const SubirArchivosCliente = () => {
  const certificadosRef = useRef();
  const kitRef = useRef();

  const handleFileWarning = (inputRef) => {
    Swal.fire({
      title: 'Sube un archivo comprimido',
      html: `
        Por favor sube un archivo <strong>.zip</strong> o <strong>.rar</strong> con todos los documentos necesarios.<br><br>
       <a href="https://www.youtube.com/watch?v=mQFLLMgsW3Q" target="_blank" style="color: #1b2b36; font-weight: bold;">
      ¿No sabes cómo comprimir?</a>

      `,
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#1b2b36',
    }).then((result) => {
      if (result.isConfirmed && inputRef.current) {
        inputRef.current.click();
      }
    });
  };



  return (
    <div className="accesos-rapidos">
      <div className="acceso-card">
        <h4>Certificados SAT</h4>
        <p>Sube tu .cer, .key y contraseña</p>
        <label className="custom-upload"  onClick={() => handleFileWarning(certificadosRef)}>
          Elegir archivos
          <input type="file" hidden ref={certificadosRef} />
        </label>
      </div>

      <div className="acceso-card">
        <h4>Estados de Cuenta</h4>
        <p>Sube estados mensuales en PDF</p>
        <label className="custom-upload">
          Elegir archivos
          <input type="file" multiple hidden />
        </label>
      </div>

      <div className="acceso-card">
        <h4>Kit de Alta para Nóminas</h4>
        <p>Acta constitutiva, comprobante de domicilio, etc.</p>
        <label className="custom-upload"  onClick={() => handleFileWarning(certificadosRef)}>
          Elegir archivos
          <input type="file" hidden ref={certificadosRef} />
        </label>
      </div>
    </div>
  );
};

export default SubirArchivosCliente;

