import React from 'react';
import DocumentCard from '../../components/DocumentCard/DocumentCard';

const categoriasDocumentos = [
  {
    nombre: 'Facturación',
    documentos: [
      { id: 1, nombre: 'Factura Enero 2024', tipo: 'PDF', fecha: '2024-01-05' },
      { id: 2, nombre: 'Factura Febrero 2024', tipo: 'PDF', fecha: '2024-02-05' }
    ]
  },
  {
    nombre: 'Estados de cuenta',
    documentos: [
      { id: 3, nombre: 'Contrato Cliente XYZ', tipo: 'DOCX', fecha: '2023-12-15' },
      { id: 4, nombre: 'Adenda Contrato ABC', tipo: 'PDF', fecha: '2024-01-20' }
    ]
  },
  // Agregar más categorías hasta 10
  {
    nombre: 'Descargables',
    documentos: [
      { id: 5, nombre: 'Balance General 2023', tipo: 'PDF', fecha: '2024-03-01' }
    ]
  },
  {
    nombre: 'Costancias',
    documentos: [
      { id: 6, nombre: 'Nómina Marzo 2024', tipo: 'XLSX', fecha: '2024-03-30' }
    ]
  }
];

const DocumentosCliente = () => {
  return (
    <div className="documentos-container">
      <h2 className="display-7 text-dark mb-4">
           <span className="text-gradient-primary">Documentos Disponibles</span>
      </h2>
       {categoriasDocumentos.map((categoria, index) => (
        <div key={index} className="card mb-4 shadow-sm">
          <div className="card-header bg-primary text-white">
            <h5>{categoria.nombre}</h5>
          </div>
          <div className="card-body ">
            <div className="row row-cols-1 row-cols-md-2 g-1 ">
              {categoria.documentos.map(documento => (
                <DocumentCard key={documento.id} documento={documento} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentosCliente;