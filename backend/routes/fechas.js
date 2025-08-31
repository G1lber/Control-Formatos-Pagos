// routes/fechas.js
import express from "express";
import { getFechas, saveFechas } from "../controllers/fechasController.js";

const router = express.Router();

router.get("/", getFechas);
router.post("/", saveFechas);

export default router;
