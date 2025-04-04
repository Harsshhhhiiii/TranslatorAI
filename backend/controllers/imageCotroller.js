import multer from 'multer';
import { detectAndTranslate } from "../config/gemini.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

export const uploadMiddleware = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
      if (err) {
          const receivedField = err.field?.trim();
          
          let message = err.message;
          
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
              message = receivedField === 'image' 
                  ? `Invalid file type. Supported types: JPEG, PNG, WEBP`
                  : `Invalid field name. Use 'image' as the form-data field name. Received: '${err.field}'`;
          }

          return res.status(400).json({
              status: "fail",
              message: message
          });
      }
      next();
  });
};

export const validateImageType = (req, res, next) => {
    // Already validated by Multer, just check existence
    if (!req.file) {
        return res.status(400).json({ 
            status: "fail",
            error: 'No file uploaded' 
        });
    }
    next();
};

// Rest of the controller remains the same...

export const processImage = async (req, res) => {
    try {
        const { buffer, mimetype } = req.file;
        const translatedText = await detectAndTranslate(buffer, mimetype);
        
        res.json({ 
            status: "success",
            translation: translatedText 
        });
    } catch (error) {
        console.error("Processing error:", error);
        res.status(500).json({ 
            status: "error",
            message: error.message 
        });
    }
};