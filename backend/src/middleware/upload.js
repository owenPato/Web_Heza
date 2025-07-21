// backend/middlewares/upload.js
import multer from 'multer';

const storage = multer.memoryStorage(); // lo guardaremos nosotros en red
const upload = multer({ storage });

export default upload;
