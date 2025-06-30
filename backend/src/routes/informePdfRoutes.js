import express from 'express';
import multer from 'multer';
import { subirInformePDF } from '../controllers/informePdfController.js';

const router = express.Router();

// ✅ Configuración de Multer para guardar en uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// ✅ Ruta: POST /api/informe-pdf
router.post('/informe-pdf', upload.single('archivo'), subirInformePDF);

export default router;
