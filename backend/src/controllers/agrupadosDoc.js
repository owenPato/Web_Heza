import pool from '../config/db.js'; 

export const obtenerDocumentosClienteAgrupados = async (req, res) => {
  const { id_cliente } = req.params;

  try {
    const [check] = await pool.query(`
      SELECT d.* FROM documentos d 
      JOIN check_docs c ON c.id_documento = d.id 
      WHERE c.id_cliente = ?`, [id_cliente]);

    const [constancias] = await pool.query(`
      SELECT d.* FROM documentos d 
      JOIN constancias_docs c ON c.id_documento = d.id 
      WHERE c.id_cliente = ?`, [id_cliente]);

    const [visitables] = await pool.query(`
      SELECT d.* FROM documentos d 
      JOIN visitables_docs v ON v.id_documento = d.id 
      WHERE v.id_cliente = ?`, [id_cliente]);

    res.json({ check, constancias, visitables });
  } catch (err) {
    console.error('❌ Error al agrupar documentos:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
