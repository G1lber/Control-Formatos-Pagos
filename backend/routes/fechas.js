const express = require("express");
const { getFechas, saveFechas } = require("../controllers/fechasController.js");

const router = express.Router();

router.get("/", getFechas);
router.post("/", saveFechas);

module.exports = router;