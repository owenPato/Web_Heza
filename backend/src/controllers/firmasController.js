import db from '../config/db.js';

/**
 * POST /api/firmas
 * body: { id_documento, id_cliente, nombre_firmante }
 */
export const crearFirma = async (req, res) => {
  try {
    const { id_documento, id_cliente, nombre_firmante } = req.body;

    if (!id_documento || !id_cliente || !nombre_firmante) {
      return res.status(400).json({ error: 'Faltan campos requeridos: id_documento, id_cliente, nombre_firmante' });
    }

    // Validar existencia de documento
    const [doc] = await db.query('SELECT id FROM documentos WHERE id = ?', [id_documento]);
    if (!doc.length) return res.status(404).json({ error: 'Documento no encontrado' });

    // Validar existencia de cliente
    const [cli] = await db.query('SELECT id FROM clientes WHERE id = ?', [id_cliente]);
    if (!cli.length) return res.status(404).json({ error: 'Cliente no encontrado' });

    // Evitar duplicado doc+cliente
    const [existe] = await db.query(
      'SELECT id FROM firmas WHERE id_documento = ? AND id_cliente = ? LIMIT 1',
      [id_documento, id_cliente]
    );
    if (existe.length) {
      const [f] = await db.query('SELECT id, fecha_firma, nombre_firmante FROM firmas WHERE id = ?', [existe[0].id]);
      return res.status(409).json({ error: 'Ya existe una firma para este documento y cliente', firma: f[0] });
    }

    const [result] = await db.query(
      'INSERT INTO firmas (id_documento, id_cliente, nombre_firmante) VALUES (?, ?, ?)',
      [id_documento, id_cliente, nombre_firmante]
    );

    const [nueva] = await db.query('SELECT * FROM firmas WHERE id = ?', [result.insertId]);
    res.status(201).json({ mensaje: 'Firma registrada', firma: nueva[0] });
  } catch (error) {
    console.error('Error al crear firma:', error);
    res.status(500).json({ error: 'Error en el servidor al crear firma' });
  }
};

/**
 * GET /api/firmas/documento/:idDocumento
 * → Incluye metadatos del documento y el nombre de la empresa del cliente
 */
export const listarFirmasPorDocumento = async (req, res) => {
  try {
    const { idDocumento } = req.params;

    const [filas] = await db.query(
      `SELECT 
         f.id, f.id_documento, f.id_cliente, f.fecha_firma, f.nombre_firmante,
         d.nombre AS documento_nombre, d.id_categoria, d.mes, d.anio,
         c.empresa AS cliente_empresa
       FROM firmas f
       INNER JOIN documentos d ON d.id = f.id_documento
       LEFT JOIN clientes  c ON c.id = f.id_cliente
       WHERE f.id_documento = ?`,
      [idDocumento]
    );

    res.json(filas);
  } catch (error) {
    console.error('listarFirmasPorDocumento error:', error);
    res.status(500).json({ error: 'Error en el servidor', detalle: error.message });
  }
};

/**
 * GET /api/firmas/cliente/:idCliente
 * → Incluye metadatos del documento para poder filtrar por mes/año/categoría en el front
 */
export const listarFirmasPorCliente = async (req, res) => {
  try {
    const { idCliente } = req.params;
    const [filas] = await db.query(
      `SELECT 
         f.id, f.id_documento, f.id_cliente, f.fecha_firma, f.nombre_firmante,
         d.nombre AS documento_nombre, d.id_categoria, d.mes, d.anio
       FROM firmas f
       INNER JOIN documentos d ON d.id = f.id_documento
       WHERE f.id_cliente = ?`,
      [idCliente]
    );
    res.json(filas);
  } catch (error) {
    console.error('Error al listar firmas por cliente:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

/**
 * GET /api/firmas/existe/:idDocumento/:idCliente
 */
export const existeFirma = async (req, res) => {
  try {
    const { idDocumento, idCliente } = req.params;
    const [rows] = await db.query(
      'SELECT id, fecha_firma, nombre_firmante FROM firmas WHERE id_documento = ? AND id_cliente = ? LIMIT 1',
      [idDocumento, idCliente]
    );
    res.json({ existe: rows.length > 0, firma: rows[0] || null });
  } catch (error) {
    console.error('Error al verificar firma:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
