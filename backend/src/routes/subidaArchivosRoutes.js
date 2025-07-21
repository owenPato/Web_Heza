import express from 'express';
import multer from 'multer';
import { subirArchivoGenerico } from '../controllers/subidaArchivosController.js';

const router = express.Router();
const upload = multer();

router.post('/upload/:tipo/:id_cliente', upload.single('archivo'), subirArchivoGenerico);

export default router;
