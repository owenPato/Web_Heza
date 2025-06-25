import React, { useRef } from 'react';
import './Cliente.css';
import Swal from 'sweetalert2';

const SubirArchivosCliente = () => {
  const certificadosInputRef = useRef(null);
  const kitInputRef = useRef(null);

  const handleComprimidoClick = async (tipo, inputRef) => {
    const mensaje =
      tipo === 'kit'
        ? 'Para subir el Kit de Nóminas, por favor comprime tus documentos (.ZIP o .RAR).'
        : 'Para los Certificados SAT, sube un archivo comprimido que contenga el .cer, .key y la contraseña.';

    const { isConfirmed } = await Swal.fire({
      title: '¿Sabes cómo comprimir archivos?',
      html: `
        <p>${mensaje}</p>
        <p>Si no sabes cómo hacerlo, te recomendamos este video:</p>
        <a href="https://www.youtube.com/watch?v=LOSnV4stFLQ" target="_blank">
          Ver tutorial en YouTube
        </a>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar'
    });

    if (isConfirmed && inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="accesos-rapidos">
      <div className="acceso-card">
        <h4>Certificados SAT</h4>
        <p>Sube tu .cer, .key y contraseña</p>
        <label
          className="custom-upload"
          onClick={() => handleComprimidoClick('cert', certificadosInputRef)}
        >
          Elegir archivos
        </label>
        <input
          type="file"
          ref={certificadosInputRef}
          multiple
          accept=".zip,.rar"
          style={{ display: 'none' }}
        />
      </div>

      <div className="acceso-card">
        <h4>Estados de Cuenta</h4>
        <p>Sube estados mensuales en PDF</p>
        <label className="custom-upload">
          Elegir archivos
          <input type="file" multiple accept=".pdf" hidden />
        </label>
      </div>

      <div className="acceso-card">
        <h4>Kit de Alta para Nóminas</h4>
        <p>Acta constitutiva, comprobante de domicilio, etc.</p>
        <label
          className="custom-upload"
          onClick={() => handleComprimidoClick('kit', kitInputRef)}
        >
          Elegir archivos
        </label>
        <input
          type="file"
          ref={kitInputRef}
          multiple
          accept=".zip,.rar"
          style={{ display: 'none' }}
        />
      </div>

      <div className="acceso-card">
        <h4>Excel de movimientos</h4>
        <p>Sube tu excel </p>
        <label className="custom-upload">
          Elegir archivos
          <input type="file" multiple accept=".xls" hidden />
        </label>
      </div>
    </div>
  );
};

export default SubirArchivosCliente;
