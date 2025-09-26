const express = require("express");
const { getTiposDocumento } = require("../controllers/tipoDocumentoController.js");

const router = express.Router();
router.get("/", getTiposDocumento);
module.exports = router;

