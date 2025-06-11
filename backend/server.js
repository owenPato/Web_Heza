import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './src/routes/api.js';
import { initializeDatabase } from './src/database/dbManager.js';
import authRoutes from './src/routes/authRoutes.js';
import clientesRoutes from './src/routes/clientesRoutes.js';
import fs from 'fs';
import newsRoutes from './src/routes/newsRoutes.js';
import eventRoutes from './src/routes/eventRoutes.js';
import sucursalesRoutes from './src/routes/sucursalesRoutes.js';
import empleadoRoutes from './src/routes/empleado.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [ 'https://test.heza.com.mx', 'http://localhost:3000' ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      console.error('Raw input:', buf.toString());
      throw new Error('Invalid JSON format');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
  }
}));


app.use('/api', clientesRoutes);
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/sucursales', sucursalesRoutes);

app.use('/api/empleados', empleadoRoutes);


app.get('/api/debug', (req, res) => {
  res.json({ message: 'API is working correctly' });
});

app.use('/api/*', (req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Endpoint not found', 
    method: req.method,
    url: req.originalUrl,
    availableRoutes: ['/api/news', '/api/auth', '/api/events', '/api/debug']
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    requestBody: req.body
  });
  res.status(500).json({ 
    error: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : null
  });
});

const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

process.noDeprecation = true; 

startServer();




