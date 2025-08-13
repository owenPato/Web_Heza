import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mime from 'mime-types';
import pool from '../config/db.js';

export const registrarInformeMensual = async (req, res) => {
  try {
    const { id } = req.params;
    const { anio, mes } = req.query;
    const id_cliente = id;
    const nombre_archivo = 'Informe mensual.pdf';
    const categoria = 4;

    if (!id_cliente || !anio || !mes) {
      return res.status(400).json({ error: 'Faltan datos: id_cliente, anio o mes' });
    }

    const [clientes] = await pool.query('SELECT empresa FROM clientes WHERE id = ?', [id_cliente]);
    if (!clientes.length) return res.status(404).json({ error: 'Cliente no encontrado' });

    const empresa = clientes[0].empresa.trim();

    const rutaBase = process.env.RUTA_ENTREGABLES
      .replace('%EMPRESA%', empresa)
      .replace('%ANIO%', anio)
      .replace('%MES%', mes);

    const rutaCompleta = path.resolve(rutaBase, nombre_archivo);

    if (!fs.existsSync(rutaCompleta)) {
      return res.status(404).json({ error: 'Archivo Informe mensual.pdf no encontrado' });
    }

    // Validar si ya existe el documento para ese cliente, anio y mes
    const [yaExiste] = await pool.query(`
      SELECT id FROM documentos 
      WHERE id_cliente = ? AND id_categoria = ? AND nombre = ?
        AND anio = ? AND mes = ?
    `, [id_cliente, categoria, nombre_archivo, anio, mes]);

    if (yaExiste.length) {
      return res.status(409).json({ mensaje: '⚠️ Informe mensual ya registrado en ese mes para este cliente' });
    }

    const stats = fs.statSync(rutaCompleta);
    const tipo_archivo = mime.lookup(rutaCompleta) || 'application/pdf';
    const rutaRelativa = path.relative(process.env.NETWORK_DRIVE_PATH, rutaCompleta).replace(/\\/g, '/');

    const [result] = await pool.query(`
      INSERT INTO documentos 
      (nombre, descripcion, ruta_archivo, tipo_archivo, tamano_archivo, id_categoria, id_cliente, anio, mes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      nombre_archivo,
      'Documento Informe mensual',
      rutaRelativa,
      tipo_archivo,
      stats.size,
      categoria,
      id_cliente,
      anio,
      mes
    ]);

    await pool.query(`INSERT INTO check_docs (id_documento, id_cliente) VALUES (?, ?)`, [result.insertId, id_cliente]);

    res.status(201).json({
      message: '✅ Informe mensual registrado exitosamente',
      id_documento: result.insertId,
      ruta: rutaRelativa
    });

  } catch (error) {
    console.error('❌ Error al registrar Informe mensual:', error);
    res.status(500).json({ error: 'Error interno', detalle: error.message });
  }
};

export const obtenerInformeMensual = async (req, res) => {
  try {
    const { id } = req.params;

    const [cliente] = await pool.query('SELECT empresa FROM clientes WHERE id = ?', [id]);
    if (!cliente.length) return res.status(404).json({ error: 'Cliente no encontrado' });

    const [documentos] = await pool.query(`
      SELECT d.id, d.nombre, d.descripcion, d.ruta_archivo, d.tipo_archivo, d.tamano_archivo, d.fecha_subida
      FROM documentos d
      WHERE d.id_cliente = ? AND d.id_categoria = 4
      ORDER BY d.fecha_subida DESC
    `, [id]);

    if (!documentos.length) {
      return res.status(404).json({ error: 'No se encontró Informe mensual para este cliente' });
    }

    res.status(200).json({
      cliente: cliente[0].empresa,
      informe_mensual: documentos[0]
    });

  } catch (error) {
    console.error('❌ Error al obtener Informe mensual:', error);
    res.status(500).json({ error: 'Error interno', detalle: error.message });
  }
};
// Base de red global
// Base de red global
const DRIVE_BASE = process.env.NETWORK_DRIVE_PATH || 'P:\\';

export const procesarInformeMensualDesdeBD = async (req, res) => {
  try {
    const { id } = req.params;
    let { anio, mes } = req.query;

    if (!id || !anio || !mes) {
      return res.status(400).json({ error: 'Faltan datos: id (cliente), anio o mes' });
    }

    const id_cliente = parseInt(id, 10);
    mes = normalizarMes(mes); // acepta "06", "Junio" o "06 Junio"

    // 1) Buscar documento en BD (categoría 4, nombre exacto)
    const [docs] = await pool.query(`
      SELECT id, nombre, ruta_archivo, tipo_archivo, tamano_archivo, anio, mes, fecha_subida
      FROM documentos
      WHERE id_cliente = ? 
        AND id_categoria = 4
        AND nombre = 'Informe mensual.pdf'
        AND anio = ?
        AND mes = ?
      ORDER BY fecha_subida DESC
      LIMIT 1
    `, [id_cliente, String(anio), String(mes)]);

    if (!docs.length) {
      return res.status(404).json({
        error: 'No se encontró Informe mensual registrado para ese cliente/mes/año',
        parametros: { id_cliente, anio, mes }
      });
    }

    const { id: id_documento, ruta_archivo } = docs[0];

    // 2) Reconstruir ruta física del PDF (usa DRIVE_BASE global)
    const rutaCompleta = path.join(DRIVE_BASE, String(ruta_archivo).replace(/\//g, '\\'));
    if (!fs.existsSync(rutaCompleta)) {
      return res.status(404).json({ error: 'Archivo no existe en la ruta compartida', ruta: rutaCompleta });
    }

    // 3) Leer y parsear PDF
    const dataBuffer = fs.readFileSync(rutaCompleta);
    const pdfData = await pdfParse(dataBuffer);
    const texto = (pdfData.text || '').replace(/\u00A0/g, ' '); // NBSP → espacio

    // ===== Helpers locales =====
    function limpiarLinea(s) {
      return String(s).replace(/\t/g, ' ').replace(/\s+/g, ' ').trim();
    }

    // Parser NUMÉRICO robusto: maneja "44,152.75" y "1.234.567,89"
    function parseMonto(raw) {
      if (!raw) return 0;
      let s = String(raw).trim();
      if (!s || s === '-' || s === '—') return 0;
      const neg = /^\(.*\)$/.test(s);
      s = s.replace(/[()$\s]/g, '');

      const lastDot = s.lastIndexOf('.');
      const lastComma = s.lastIndexOf(',');

      if (lastDot > -1 && lastComma > -1) {
        // Si el último punto está DESPUÉS de la última coma -> "." es decimal (ej: 44,152.75)
        if (lastDot > lastComma) {
          s = s.replace(/,/g, ''); // quita miles con coma
        } else {
          // "," es decimal (ej: 1.234.567,89)
          s = s.replace(/\./g, '').replace(',', '.');
        }
      } else if (lastComma > -1) {
        // Solo comas: asume miles con coma (ej: 390,971)
        s = s.replace(/,/g, '');
      }
      const n = parseFloat(s);
      const val = isNaN(n) ? 0 : n;
      return neg ? -Math.abs(val) : val;
    }

    // 2 decimales (es-MX)
    function money2(n) {
      const val = Number.isFinite(n) ? n : 0;
      return val.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // 4 decimales exactos para coeficientes
    function num4(n) {
      const val = Number.isFinite(n) ? n : 0;
      return val.toFixed(4);
    }

    // número al final de una línea
    function pickTrailingNumber(line) {
      const m = line && line.match(/\$?\s*([-\d.,()]+)\s*$/);
      return m ? parseMonto(m[1]) : null;
    }

    const lines = texto.split(/\r?\n/).map(limpiarLinea).filter(Boolean);

    // ===== LOGS base =====
    console.log('--- INFORME.MENSUAL DEBUG ---');
    console.log('Cliente:', id_cliente, 'Año:', anio, 'Mes:', mes);
    console.log('[Archivo]:', rutaCompleta);
    console.log('[Total líneas]:', lines.length);
    console.log('[Primeras 40]:', lines.slice(0, 40));

    // ===== Indicadores (Ingresos y Coeficiente) =====
    function findIngresos(lines) {
      for (let i = 0; i < lines.length; i++) {
        if (/Ingresos\s+facturados/i.test(lines[i])) {
          for (let k = 1; k <= 3; k++) {
            if (/acumulados/i.test(lines[i + k] || '')) {
              let l = lines[i + k + 1] || '';
              let m = l.match(/([-\d.,()]+)\s+([-\d.,()]+)/);
              if (!m) {
                l = lines[i + k + 2] || '';
                m = l.match(/([-\d.,()]+)\s+([-\d.,()]+)/);
              }
              if (m) return { a: parseMonto(m[1]), b: parseMonto(m[2]) };
            }
          }
        }
      }
      return { a: 0, b: 0 };
    }

    function findCoef(lines) {
      for (let i = 0; i < lines.length; i++) {
        if (/Coeficiente\s+de\s+utilidad/i.test(lines[i])) {
          const cands = [lines[i], lines[i+1] || '', lines[i+2] || ''];
          for (const l of cands) {
            const m = l.match(/([-\d.,()]+)\s+([-\d.,()]+)/);
            if (m) return { a: parseMonto(m[1]), b: parseMonto(m[2]) };
          }
          break;
        }
      }
      return { a: 0, b: 0 };
    }

    const indIngresos = findIngresos(lines);
    const indCoef     = findCoef(lines);
    console.log('[Indicadores] ingresos:', indIngresos, 'coef:', indCoef);

    // ===== Cumplimiento (texto) =====
    const estatus = [];
    for (const l of lines) {
      const m = l.match(/\b(N\/A|POSITIVA|NEGATIVA|PENDIENTE)\b/gi);
      if (m) estatus.push(...m.map(x => x.toUpperCase()));
    }
    const mapCumpl = (ix) => (estatus[ix] || null);
    const cumplimiento_sat       = mapCumpl(0);
    const cumplimiento_conta     = mapCumpl(1);
    const cumplimiento_imss      = mapCumpl(2);
    const cumplimiento_infonavit = mapCumpl(3);
    const cumplimiento_isn       = mapCumpl(4); // Impuesto sobre nóminas
    console.log('[Cumplimiento]', { estatus, sat: cumplimiento_sat, contabilidad: cumplimiento_conta, imss: cumplimiento_imss, infonavit: cumplimiento_infonavit, isn: cumplimiento_isn });

    // ===== RESUMEN DE IMPUESTOS POR PAGAR (detección por CLUSTERS) =====
    function collectResumenValores(lines) {
      // 1) Extrae todos los números (al final de cada línea) con su índice
      const nums = [];
      for (let i = 0; i < lines.length; i++) {
        const n = pickTrailingNumber(lines[i]);
        if (n !== null) nums.push({ i, n, line: lines[i] });
      }
      console.log('[Resumen] total líneas con números:', nums.length);

      if (!nums.length) return [];

      // 2) Construye clusters de números “casi contiguos” (índice salta <= 2)
      const clusters = [];
      let cur = [nums[0]];
      for (let j = 1; j < nums.length; j++) {
        if (nums[j].i - nums[j - 1].i <= 2) {
          cur.push(nums[j]);
        } else {
          clusters.push(cur);
          cur = [nums[j]];
        }
      }
      clusters.push(cur);

      // 3) Filtra clusters razonables: longitud >= 6 y que NO estén pegados
      // a cabeceras como "COMPARATIVA", etc. (heurística suavecita)
      const scoreCluster = (cl) => cl.length;
      clusters.sort((a, b) => scoreCluster(b) - scoreCluster(a));

      console.log('[Resumen] clusters hallados (top 3 por tamaño):', clusters.slice(0, 3).map(c => ({ len: c.length, from: c[0].i, to: c[c.length - 1].i })));

      // 4) Toma el cluster más largo como candidato (suele ser el bloque de 11)
      const best = clusters[0] || [];
      const contexto = lines.slice(best[0]?.i ?? 0, (best[best.length - 1]?.i ?? 0) + 1);
      console.log('[Resumen] cluster elegido len:', best.length, 'rango:', best[0]?.i, '-', best[best.length - 1]?.i);
      console.log('[Resumen] preview cluster líneas:', contexto);

      // 5) De ese cluster, toma los ÚLTIMOS 11 valores (ISR..Total)
      // 5) De ese cluster, toma los PRIMEROS 11 valores (ISR..Total)
      let vals = best.map(x => x.n);
      if (vals.length >= 11) vals = vals.slice(0, 11);
      console.log('[Resumen] valores (primeros 11):', vals);
      return vals;
    }

    const valores = collectResumenValores(lines);

    // Mapeo en orden fijo (11 elementos):
    // [ISR, IVA, Ret Salarios, ISPT Asimilados, Ret Serv Prof, Ret RESICO,
    //  Ret Arrendamiento, Ret IVA, Subsidio aplicado, Compensación, Total]
    const [
      vISR = 0, vIVA = 0, vRetSal = 0, vISPT = 0, vRetProf = 0,
      vRetResico = 0, vRetArr = 0, vRetIVA = 0, vSubsidio = 0, vComp = 0, vTotal = 0
    ] = valores.length === 11 ? valores : new Array(11).fill(0);

    // 4) Respuesta con valores
    const resumen = {
      ingresos_2025: indIngresos.a,         ingresos_2025_str: money2(indIngresos.a),
      ingresos_2024: indIngresos.b,         ingresos_2024_str: money2(indIngresos.b),

      coef_2025: indCoef.a,                 coef_2025_str: num4(indCoef.a),
      coef_2024: indCoef.b,                 coef_2024_str: num4(indCoef.b),

      isr: vISR,                            isr_str: money2(vISR),
      iva: vIVA,                            iva_str: money2(vIVA),
      retencion_salarios: vRetSal,          retencion_salarios_str: money2(vRetSal),
      ispt_asimilados: vISPT,               ispt_asimilados_str: money2(vISPT),
      retencion_profesionales: vRetProf,    retencion_profesionales_str: money2(vRetProf),
      retencion_resico: vRetResico,         retencion_resico_str: money2(vRetResico),
      retencion_arrendamiento: vRetArr,     retencion_arrendamiento_str: money2(vRetArr),
      retencion_iva: vRetIVA,               retencion_iva_str: money2(vRetIVA),
      subsidio_aplicado: vSubsidio,         subsidio_aplicado_str: money2(vSubsidio),
      compensacion: vComp,                  compensacion_str: money2(vComp),
      total: vTotal,                        total_str: money2(vTotal),

      cumplimiento: {
        sat: cumplimiento_sat,
        contabilidad: cumplimiento_conta,
        imss: cumplimiento_imss,
        infonavit: cumplimiento_infonavit,
        isn: cumplimiento_isn
      }
    };

    console.log('[Resumen] mapeado final:', resumen);

    // 5) Responder
    return res.status(200).json({
      ok: true,
      parametros: { id_cliente, anio: String(anio), mes: String(mes) },
      id_documento,
      archivo: rutaCompleta,
      resumen
    });

  } catch (err) {
    console.error('❌ Error al procesar informe desde BD:', err);
    return res.status(500).json({ error: 'Error al procesar informe', detalle: err.message });
  }
};


// --- helper para aceptar varios formatos de "mes"
function normalizarMes(valor) {
  const catalogo = [
    '01 Enero','02 Febrero','03 Marzo','04 Abril','05 Mayo','06 Junio',
    '07 Julio','08 Agosto','09 Septiembre','10 Octubre','11 Noviembre','12 Diciembre'
  ];
  if (!valor) return valor;

  const v = String(valor).trim();

  // 02 -> 02 Febrero
  if (/^\d{1,2}$/.test(v)) {
    const n = Math.max(1, Math.min(12, parseInt(v, 10)));
    return catalogo[n - 1];
  }

  // Febrero -> 02 Febrero
  const porNombre = catalogo.find(m => m.toLowerCase().endsWith(v.toLowerCase()));
  if (porNombre) return porNombre;

  // Ya viene como "02 Febrero"
  return v;
}

// --- ya existen tus extractNumber / extractTexto al final del archivo ---


// Helpers
function extractNumber(text, regex) {
  const match = text.match(regex);
  return match ? parseFloat(match[1].replace(/,/g, '')) || 0 : 0;
}

function extractTexto(text, regex) {
  const match = text.match(regex);
  return match ? match[1] : null;
}