import emailService from '../utils/emailService.js';
import pool from '../config/db.js';

export const enviarDiagnostico = async (req, res) => {
  try {
    const formData = req.body;

    const emailContent = `
      <h1>Nuevo diagnóstico empresarial</h1>
      <h2>Datos de contacto</h2>
      <p>Nombre: ${formData.nombre}</p>
      <p>Email: ${formData.email}</p>
      <p>Empresa: ${formData.empresa}</p>
      <p>Teléfono: ${formData.telefono}</p>

      <h2>Datos empresariales</h2>
      <p>Trabajadores: ${formData.trabajadores}</p>
      <p>Ventas: ${formData.ventas}</p>
      <p>Actividad: ${formData.actividad}</p>

      <h2>Prácticas fiscales</h2>
      <p>Uso contabilidad: ${formData.uso_contabilidad}</p>
      <p>Manual cumplimiento: ${formData.manual_cumplimiento}</p>
      <p>Verificación mensual: ${formData.verificacion_mensual}</p>
      <p>Revisión declaraciones: ${formData.revision_declaraciones}</p>
      <p>Consistencia SAT: ${formData.consistencia_sat}</p>
      <p>Carta responsiva: ${formData.carta_responsiva}</p>
    `;

    await emailService.sendEmail({
      to: ['nayelli_godoy@heza.com.mx', 'rafael_ramon@heza.com.mx'],
      subject: 'Nuevo diagnóstico empresarial',
      html: emailContent
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error al enviar diagnóstico:', error);
    res.status(500).json({ error: 'Error al enviar el diagnóstico' });
  }
};

export const getSucursalesActivas = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT id, nombre FROM sucursales WHERE activo = 1');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener sucursales:', error);
    res.status(500).json({ error: 'Error al obtener sucursales' });
  } finally {
    connection.release();
  }
};