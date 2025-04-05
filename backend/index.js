import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./models/dbConnect.js";
import authRoutes from "./routes/authRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173',
        "https://translator-ai-nine.vercel.app",
        "https://translator-ai-harshits-projects-99ccb490.vercel.app",
        "https://translator-ai-nine.vercel.appflowName=GeneralOAuthFlow"
    
    ],
    credentials: true                   
}));
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use('/api', imageRoutes);

app.all("*", (req, res) => {
    res.status(404).json({
        status: "fail",
        message: `Can't find ${req.originalUrl} on the server`
    });
});

app.use((err, req, res, next) => {
    // Log the error stack in development
    console.error(`[${new Date().toISOString()}] Error:`, err.stack || err);

    const errorResponse = {
        status: "error",
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };

    // Handle different error types
    if (err.name === 'ValidationError') { // Mongoose validation error
        errorResponse.status = "fail";
        errorResponse.message = "Validation Error";
        errorResponse.errors = Object.values(err.errors).map(el => el.message);
        return res.status(400).json(errorResponse);
    }

    if (err.name === 'CastError') { // Mongoose bad ID format
        errorResponse.status = "fail";
        errorResponse.message = `Invalid ${err.path}: ${err.value}`;
        return res.status(400).json(errorResponse);
    }

    if (err.name === 'MulterError') { 
        errorResponse.status = "fail";
        errorResponse.message = `File upload error: ${err.message}`;
        return res.status(400).json(errorResponse);
    }

    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        errorResponse.status = "fail";
        errorResponse.message = "Authentication failed. Please log in again.";
        return res.status(401).json(errorResponse);
    }

    if (err.message.includes('GoogleGenerativeAI Error')) {
        errorResponse.message = err.message.replace(/\[GoogleGenerativeAI Error\]:\s*/, '');
        return res.status(500).json(errorResponse);
    }

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json(errorResponse);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});