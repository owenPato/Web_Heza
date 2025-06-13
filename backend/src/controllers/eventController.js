import Event from '../models/Event.js';
import { saveBase64Image } from '../utils/imageHelpers.js';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAllEvents = async (req, res) => {
  try {
    const filters = {
      tipo: req.query.tipo,
      search: req.query.search,
      fecha_desde: req.query.fecha_desde,
      fecha_hasta: req.query.fecha_hasta
    };
    
    const events = await Event.getAll(filters);
    
    res.json({ events });
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
};

export const getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    res.json({ event });
  } catch (error) {
    console.error('Error al obtener evento:', error);
    res.status(500).json({ error: 'Error al obtener evento' });
  }
};

export const createEvent = async (req, res) => {
  try {
    if (req.user && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para crear eventos' });
    }
    
    if (!req.body.titulo || req.body.titulo.trim().length < 3) {
      return res.status(400).json({ error: 'Título debe tener al menos 3 caracteres' });
    }
    
    let imagePath = null;
    if (req.body.imagen && req.body.imagen.startsWith('data:image')) {
      try {
        const uploadDir = path.join(__dirname, '../../uploads/eventos');
        await fs.mkdir(uploadDir, { recursive: true });
        
        const fileName = `evento_${Date.now()}.jpg`;
        const fullPath = path.join('uploads/eventos', fileName);
        imagePath = await saveBase64Image(req.body.imagen, fullPath);
      } catch (imgError) {
        console.error('Image processing error:', imgError);
      }
    }

    let galeriaArray = [];
    if (req.body.galeria && Array.isArray(req.body.galeria)) {      
      for (let i = 0; i < req.body.galeria.length; i++) {
        const imgData = req.body.galeria[i];
        
        if (imgData && typeof imgData === 'string' && imgData.startsWith('data:image')) {
          try {
            const uploadDir = path.join(__dirname, '../../uploads/eventos');
            await fs.mkdir(uploadDir, { recursive: true });
            
            const fileName = `evento_galeria_${Date.now()}_${i}.jpg`;
            const fullPath = path.join('uploads/eventos', fileName);
            const savedPath = await saveBase64Image(imgData, fullPath);
            galeriaArray.push(savedPath);
          } catch (imgError) {
            console.error(`Error processing gallery image ${i}:`, imgError);
          }
        } else if (imgData && typeof imgData === 'string') {
          galeriaArray.push(imgData);
        }
      }
    }
    
   const eventData = {
    titulo: req.body.titulo,
    fecha: req.body.fecha || new Date().toISOString().split('T')[0],
    hora: convertTo24HourFormat(req.body.hora),  // ✅ Aquí la hora en 24h
    ubicacion: req.body.ubicacion || '',
    tipo: req.body.tipo || 'Próximo',
    descripcion: req.body.descripcion || '',
    imagen: imagePath,
    galeria: galeriaArray
   };

    
  function convertTo24HourFormat(timeStr) {
    if (!timeStr) return null;

    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');

    hours = parseInt(hours, 10);
    if (modifier === 'PM' && hours !== 12) {
      hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }

  return `${String(hours).padStart(2, '0')}:${minutes}:00`;
  }

    
    const eventId = await Event.create(eventData);
    
    const event = await Event.findById(eventId);
    
    res.status(201).json({ event });
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({ 
      error: error.message,
      sqlMessage: error.sqlMessage 
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    if (req.user && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para modificar eventos' });
    }
    
    const eventId = req.params.id;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    let imagePath = event.imagen;
    if (req.body.imagen && req.body.imagen.startsWith('data:image')) {
      try {
        const uploadDir = path.join(__dirname, '../../uploads/eventos');
        await fs.mkdir(uploadDir, { recursive: true });
        
        const fileName = `evento_${eventId}_${Date.now()}.jpg`;
        const fullPath = path.join('uploads/eventos', fileName);
        imagePath = await saveBase64Image(req.body.imagen, fullPath);
      } catch (imgError) {
        console.error('Image processing error:', imgError);
      }
    } else if (req.body.imagen) {
      imagePath = req.body.imagen;
    }
    
    let galeriaArray = event.galeria || [];
    if (req.body.galeria && Array.isArray(req.body.galeria)) {
      const newGallery = [];
      for (let i = 0; i < req.body.galeria.length; i++) {
        const img = req.body.galeria[i];
        if (img.startsWith('data:image')) {
          try {
            const uploadDir = path.join(__dirname, '../../uploads/eventos');
            await fs.mkdir(uploadDir, { recursive: true });
            
            const fileName = `evento_${eventId}_galeria_${Date.now()}_${i}.jpg`;
            const fullPath = path.join('uploads/eventos', fileName);
            const savedPath = await saveBase64Image(img, fullPath);
            newGallery.push(savedPath);
          } catch (imgError) {
            console.error(`Error saving gallery image ${i}:`, imgError);
          }
        } else {
          newGallery.push(img);
        }
      }
      galeriaArray = newGallery;
    }
    
    const eventData = {
      titulo: req.body.titulo,
      fecha: req.body.fecha || existingEvent.fecha,
      hora: req.body.hora || existingEvent.hora,
      ubicacion: req.body.ubicacion || existingEvent.ubicacion,
      tipo: req.body.tipo || existingEvent.tipo,
      descripcion: req.body.descripcion || existingEvent.descripcion,
      imagen: imagePath || existingEvent.imagen
    };
    
    await Event.update(eventId, eventData);
    
    const updatedEvent = await Event.findById(eventId);
    
    res.json({ 
      success: true, 
      message: 'Evento actualizado exitosamente', 
      event: updatedEvent 
    });
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para eliminar eventos' });
    }
    
    const eventId = req.params.id;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    await Event.delete(eventId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
};