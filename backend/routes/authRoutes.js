import express from "express";
import { googleAuth } from "../controllers/authController.js"; // Ensure authController is also converted

const Router = express.Router();

Router.get("/google", googleAuth);

export default Router;
