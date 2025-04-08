import express from "express";
import { 
    uploadMiddleware,
    validateImageType,
    processImage 
} from "../controllers/imageCotroller.js";
import { saveResponse } from "../controllers/responseController.js";
const router = express.Router();

router.post('/translate-image', 
    uploadMiddleware,
    validateImageType,
    processImage
);

router.post('/save-response',  saveResponse);

export default router;