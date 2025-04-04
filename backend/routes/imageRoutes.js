import express from "express";
import { 
    uploadMiddleware,
    validateImageType,
    processImage 
} from "../controllers/imageCotroller.js";

const router = express.Router();

router.post('/translate-image', 
    uploadMiddleware,
    validateImageType,
    processImage
);

export default router;