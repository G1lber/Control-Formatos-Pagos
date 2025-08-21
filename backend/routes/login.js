import express from "express";
import {login} from "../controllers/loginController.js"; // si usas export default

const router = express.Router();

router.post("/", login); 

export default router;
