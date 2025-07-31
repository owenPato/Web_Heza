import fs from 'fs';
import path from 'path';
import pool from '../config/db.js';
import { buildRutaCliente } from '../utils/buildRutaCliente.js';

export const subirArchivoGenerico = async (req, res) => {
  try {
    const { id_cliente, tipo } = req.params;
    const { anio, mes } = req.body;
    const archivo = req.file;
    const categorias = {
    'estados-cuenta': 9,
    'excel-movimientos': 10,
    'certificados-sat': 11,
    'kit-nomina': 12
    };
    const id_categoria = categorias[tipo];

    if (!archivo) {
      return res.status(400).json({ error: 'Archivo no enviado' });
    }

    if (!anio || !mes) {
      return res.status(400).json({ error: 'Faltan anio o mes' });
    }

    // ✅ Validar tipo
    const tiposPermitidos = ['estados-cuenta', 'excel-movimientos', 'certificados-sat', 'kit-nomina'];
    if (!tiposPermitidos.includes(tipo)) {
      return res.status(400).json({ error: `Tipo de archivo inválido: ${tipo}` });
    }

    // ✅ Obtener nombre de empresa
    const [[cliente]] = await pool.query('SELECT empresa FROM clientes WHERE id = ?', [id_cliente]);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

    // ✅ Construir ruta destino usando anio/mes proporcionado
    const rutaDestino = buildRutaCliente({ empresa: cliente.empresa, anio, mes, tipo });

    if (!fs.existsSync(rutaDestino)) {
      fs.mkdirSync(rutaDestino, { recursive: true });
    }

    const nombreArchivo = archivo.originalname;
    const destinoCompleto = path.join(rutaDestino, nombreArchivo);

    fs.writeFileSync(destinoCompleto, archivo.buffer);

    const rutaRelativa = path.relative(process.env.RUTA_CLIENTES, destinoCompleto).replace(/\\/g, '/');

    // ✅ Insertar en la base de datos con anio y mes
    await pool.query(`
      INSERT INTO documentos 
        (nombre, ruta_archivo, tipo_archivo, tamano_archivo, id_cliente, anio, mes, id_categoria)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
    [
      nombreArchivo,
      rutaRelativa,
      archivo.mimetype,
      archivo.size,
      id_cliente,
      anio,
      mes,
      id_categoria
    ]);

    res.status(201).json({ mensaje: `📥 Archivo subido con éxito para tipo: ${tipo}` });

  } catch (err) {
    console.error('❌ Error al subir archivo:', err);
    res.status(500).json({ error: 'Error al guardar archivo', detalles: err.message });
  }
};

