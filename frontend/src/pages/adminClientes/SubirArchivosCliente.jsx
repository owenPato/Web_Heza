import React, { useRef } from 'react';
import './Cliente.css';
import Swal from 'sweetalert2';
import { useLocation } from 'react-router-dom';

const SubirArchivosCliente = () => {
  const certificadosInputRef = useRef(null);
  const kitInputRef = useRef(null);
  const excelInputRef = useRef(null);
  const estadosInputRef = useRef(null);

  const location = useLocation();
  const docsLocal = localStorage.getItem('docs');
  let id_cliente = location?.state?.id_cliente;

  if (!id_cliente && docsLocal) {
    try {
      const parsedDocs = JSON.parse(docsLocal);
      id_cliente = parsedDocs?.id_cliente;
    } catch (error) {
      console.error('Error al parsear localStorage.docs', error);
    }
  }

  if (!id_cliente) {
    console.warn('ID de cliente no disponible en location ni en localStorage');
  }

  // Mes/Año para mostrar en el encabezado y para uploads
  const mesRaw = localStorage.getItem('mes_actual') || ''; // ej: "01 Enero"
  const anioActual = localStorage.getItem('anio_actual') || ''; // ej: "2025"
  const nombreMes = mesRaw.split(' ')[1] || '';

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
        <a href="https://www.youtube.com/watch?v=LOSnV4stFLQ" target="_blank" rel="noopener noreferrer">
          Ver tutorial en YouTube
        </a>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
    });

    if (isConfirmed && inputRef.current) {
      inputRef.current.click();
    }
  };

  const subirArchivo = async (tipo, inputRef) => {
    const archivo = inputRef.current?.files[0];
    const anio = anioActual;
    const mes = mesRaw;

    if (!archivo || !id_cliente || !anio || !mes) {
      Swal.fire('Error', 'Falta archivo, cliente, año o mes', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('anio', anio);
    formData.append('mes', mes);

    const tipoBackend = tipo === 'movimientos-excel' ? 'excel-movimientos' : tipo;

    try {
      const response = await fetch(`http://localhost:5000/api/upload/${tipoBackend}/${id_cliente}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || 'Falló la petición');
      }

      Swal.fire('Éxito', 'Archivo subido correctamente', 'success');
    } catch (error) {
      console.error(error);
      Swal.fire('Error', error.message, 'error');
    }
  };

  return (
    <>
      {/* Encabezado con mes y año */}
      <div className="titulo-seccion-checklist text-center mb-4">
        <div className="meses-tabs justify-center">
          <button className="tab-btn activo">
            {nombreMes} {anioActual ? `de ${anioActual}` : ''}
          </button>
        </div>
      </div>

      <div className="accesos-rapidos">
        <div className="acceso-card">
          <h4>Certificados SAT</h4>
          <p>Sube tu .cer, .key y contraseña</p>
          <label
            className="custom-upload"
            onClick={() => handleComprimidoClick('certificados-sat', certificadosInputRef)}
          >
            Elegir archivos
          </label>
          <input
            type="file"
            ref={certificadosInputRef}
            multiple
            accept=".zip,.rar"
            style={{ display: 'none' }}
            onChange={() => subirArchivo('certificados-sat', certificadosInputRef)}
          />
        </div>

        <div className="acceso-card">
          <h4>Estados de Cuenta</h4>
          <p>Sube estados mensuales en PDF</p>
          <label className="custom-upload">
            Elegir archivos
            <input
              type="file"
              ref={estadosInputRef}
              accept=".pdf"
              hidden
              onChange={() => subirArchivo('estados-cuenta', estadosInputRef)}
            />
          </label>
        </div>

        <div className="acceso-card">
          <h4>Kit de Alta para Nóminas</h4>
          <p>Acta constitutiva, comprobante de domicilio, etc.</p>
          <label
            className="custom-upload"
            onClick={() => handleComprimidoClick('kit-nomina', kitInputRef)}
          >
            Elegir archivos
          </label>
          <input
            type="file"
            ref={kitInputRef}
            multiple
            accept=".zip,.rar"
            style={{ display: 'none' }}
            onChange={() => subirArchivo('kit-nomina', kitInputRef)}
          />
        </div>

        <div className="acceso-card">
          <h4>Excel de movimientos</h4>
          <p>Sube tu archivo Excel</p>
          <label className="custom-upload">
            Elegir archivos
            <input
              type="file"
              ref={excelInputRef}
              accept=".xls,.xlsx"
              hidden
              onChange={() => subirArchivo('movimientos-excel', excelInputRef)}
            />
          </label>
        </div>
      </div>
    </>
  );
};

export default SubirArchivosCliente;
