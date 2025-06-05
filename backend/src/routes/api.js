import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import authRoutes from './authRoutes.js';
import { aprobarSolicitud } from '../controllers/solicitudAccesoController.js';
import solicitudAccesoRoutes from './solicitudAccesoRoutes.js';
import * as authController from '../controllers/authController.js';
import * as clientController from '../controllers/clientController.js';
import * as documentController from '../controllers/documentController.js';
import * as eventController from '../controllers/eventController.js';
import * as apiController from '../controllers/apiController.js';
import * as dashboardController from '../controllers/dashboardController.js';
import { verifyToken, verifyAdmin, isAdmin, isClient, isAdminOrClient } from '../middleware/auth.js';
import { getDepartamento } from '../controllers/departamentoController.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/admin/login', authController.adminLogin);
router.get('/auth/profile', verifyToken, authController.getProfile);
router.put('/auth/profile', verifyToken, authController.updateProfile);
router.post('/auth/change-password', verifyToken, authController.changePassword);

// Rutas de administrador para solicitudes de acceso
router.use('/admin', solicitudAccesoRoutes);
router.post('/solicitudes-acceso/:id/aprobar', verifyToken, verifyAdmin, aprobarSolicitud);
router.get('/departamento', getDepartamento);

router.get('/clients', verifyToken, isAdmin, clientController.getAllClients);
router.get('/clients/:id', verifyToken, isAdminOrClient, clientController.getClientById);
router.post('/clients', verifyToken, isAdmin, clientController.createClient);
router.put('/clients/:id', verifyToken, isAdminOrClient, clientController.updateClient);
router.delete('/clients/:id', verifyToken, isAdmin, clientController.deleteClient);
router.get('/clients/:id/services', verifyToken, isAdminOrClient, clientController.getClientServices);

router.get('/documents/categories', verifyToken, documentController.getCategories);
router.get('/documents/client/:clientId', verifyToken, isAdminOrClient, documentController.getClientDocuments);
router.get('/documents/:id', verifyToken, documentController.getDocument);
router.post('/documents', verifyToken, upload.single('file'), documentController.uploadDocument);
router.put('/documents/:id', verifyToken, upload.single('file'), documentController.updateDocument);
router.delete('/documents/:id', verifyToken, documentController.deleteDocument);
router.get('/documents/:id/download', verifyToken, documentController.downloadDocument);

router.get('/events', eventController.getAllEvents);
router.get('/events/:id', eventController.getEventById);
router.post('/events', verifyToken, isAdmin, eventController.createEvent);
router.put('/events/:id', verifyToken, isAdmin, eventController.updateEvent);
router.delete('/events/:id', verifyToken, isAdmin, eventController.deleteEvent);

router.post('/contact', apiController.enviarDiagnostico);

// Dashboard endpoints
router.get('/dashboard/stats', verifyToken, isAdmin, dashboardController.getDashboardStats);
router.get('/dashboard/client-stats', verifyToken, isClient, dashboardController.getClientDashboardStats);
router.get('/dashboard/pending-requests', verifyToken, isAdmin, dashboardController.getPendingRequests);
router.post('/enviar-diagnostico', apiController.enviarDiagnostico);


router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

router.use('/auth', authRoutes);
router.use('/admin', solicitudAccesoRoutes);

export default router;