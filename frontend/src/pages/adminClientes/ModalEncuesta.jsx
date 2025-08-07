import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const ModalEncuesta = ({ show, onClose }) => {
  const [form, setForm] = useState({
    anio: '',
    mes: '',
    areas: [],
    experiencia: '',
    cumplimiento: '',
    utilidad: '',
    respaldo: '',
    orientacion: '',
    profesionalismo: '',
    respuestas: '',
    valor: '',
    costo: '',
    frase: '',
    comentario: '',
    sugerencia: ''
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckbox = (value) => {
    const updated = form.areas.includes(value)
      ? form.areas.filter(v => v !== value)
      : [...form.areas, value];
    setForm(prev => ({ ...prev, areas: updated }));
  };

  const handleSubmit = () => {
    console.log("Encuesta enviada:", form);
    alert("Gracias por completar la encuesta.");
    onClose();
  };

  const opcionesAfirmacion = [
    "Muy de acuerdo", "De acuerdo", "Regular", "En desacuerdo", "Muy en desacuerdo"
  ];

  const preguntasRadio = [
    { label: "Mi experiencia con Heza hasta ahora ha sido satisfactoria", name: "experiencia" },
    { label: "Heza ha cumplido con lo acordado al inicio de nuestra relación de servicio.", name: "cumplimiento" },
    { label: "La información entregada ha sido útil para tomar decisiones.", name: "utilidad" },
    { label: "Siento que Heza me brinda seguridad y respaldo en el cumplimiento de mis obligaciones como empresa.", name: "respaldo" },
    { label: "Desde el inicio del servicio, he recibido la orientación y atención necesarias por parte de Heza.", name: "orientacion" },
    { label: "Las personas con las que he tratado demuestran profesionalismo y conocimiento.", name: "profesionalismo" },
    { label: "Cuando tengo dudas, recibo respuestas claras y oportunas.", name: "respuestas" },
    { label: "Siento que Heza ha superado lo que esperaba en términos de valor, atención y resultados.", name: "valor" },
    { label: "Siento que el costo del servicio está en equilibrio con la atención, calidad y resultados que recibo de Heza.", name: "costo" }
  ];

  const frases = [
    "Recibo entregables útiles sin tener que solicitarlos",
    "He tenido que insistir varias veces para obtener respuesta",
    "No siempre entiendo lo que se me entrega",
    "Me explican claramente aspectos clave de mis obligaciones",
    "No sé bien quien me está atendiendo",
    "Confío plenamente en que están haciendo bien su trabajo"
  ];

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <div className="w-100 text-center">
          <h3 className="display-5 text-dark mb-0">
            <span className="text-gradient-primary">Encuesta de </span>
            <span className="text-gradient-secondary">Satisfacción</span>
          </h3>
        </div>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <Row className="g-3">

            {/* Año */}
            <Col md={12}>
              <Form.Group>
                <Form.Label>¿En qué año comenzaste tu relación con Heza?</Form.Label>
                {["2025", "2024", "2023", "2022", "2021", "2020 o ejercicios anteriores"].map(anio => (
                  <Form.Check
                    key={anio}
                    type="radio"
                    name="anio"
                    label={anio}
                    checked={form.anio === anio}
                    onChange={() => handleChange("anio", anio)}
                  />
                ))}
              </Form.Group>
            </Col>

            {/* Mes */}
            <Col md={12}>
              <Form.Group>
                <Form.Label>¿En qué mes comenzaste?</Form.Label>
                {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map(mes => (
                  <Form.Check
                    key={mes}
                    type="radio"
                    name="mes"
                    label={mes}
                    checked={form.mes === mes}
                    onChange={() => handleChange("mes", mes)}
                  />
                ))}
              </Form.Group>
            </Col>

            {/* Áreas */}
            <Col md={12}>
              <Form.Group>
                <Form.Label>¿Qué áreas están involucradas en el servicio que recibes?</Form.Label>
                {["Contabilidad", "Nominas", "Asesoria", "Devoluciones de IVA", "Proyectos especiales"].map(area => (
                  <Form.Check
                    key={area}
                    type="checkbox"
                    label={area}
                    checked={form.areas.includes(area)}
                    onChange={() => handleCheckbox(area)}
                  />
                ))}
              </Form.Group>
            </Col>

            {/* Preguntas afirmativas */}
            {preguntasRadio.map(({ label, name }) => (
              <Col md={12} key={name}>
                <Form.Group>
                  <Form.Label>{label}</Form.Label>
                  {opcionesAfirmacion.map(op => (
                    <Form.Check
                      key={`${name}-${op}`}
                      type="radio"
                      name={name}
                      label={op}
                      checked={form[name] === op}
                      onChange={() => handleChange(name, op)}
                    />
                  ))}
                </Form.Group>
              </Col>
            ))}

            {/* Frase */}
            <Col md={12}>
              <Form.Group>
                <Form.Label>¿Cuál de las siguientes frases refleja mejor tu experiencia hasta ahora?</Form.Label>
                {frases.map(frase => (
                  <Form.Check
                    key={frase}
                    type="radio"
                    name="frase"
                    label={frase}
                    checked={form.frase === frase}
                    onChange={() => handleChange("frase", frase)}
                  />
                ))}
              </Form.Group>
            </Col>

            {/* Comentario */}
            <Col md={12}>
              <Form.Group>
                <Form.Label>¿Qué te ha llamado la atención (para bien o para mal)?</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={form.comentario}
                  onChange={(e) => handleChange("comentario", e.target.value)}
                />
              </Form.Group>
            </Col>

            {/* Sugerencia */}
            <Col md={12}>
              <Form.Group>
                <Form.Label>¿Qué sugerencia o recomendación nos harías para seguir mejorando tu experiencia con HEZA?</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={form.sugerencia}
                  onChange={(e) => handleChange("sugerencia", e.target.value)}
                />
              </Form.Group>
            </Col>

          </Row>
          <Modal.Footer>
            <Button type="submit" variant="primary">Enviar</Button>
            <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalEncuesta;
