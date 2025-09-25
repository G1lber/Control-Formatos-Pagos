const express = require("express");
const {
  subirDocumento,
  upload,
  obtenerDocumentos,
  obtenerDocumentoPorId,
  // actualizarEstado,
  eliminarDocumento,
  subirFirma,
  obtenerFirma,
  firmarDocumento,
  firmarWord,
  insertarMarcadorFirma,
  exportarDatosGFRevisados
} = require("../controllers/documentosController.js");
const { uploadFirma } = require("../middlewares/upload.js");
const router = express.Router();

// 📤 Subir documento
router.post(
  "/",
  (req, res, next) => {
    upload.single("archivo")(req, res, (err) => {
      if (err) {
        // 🚨 Capturamos error del fileFilter o de Multer
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  subirDocumento
);

router.post("/firmar-word", firmarWord);
router.post("/insertar-marcador", insertarMarcadorFirma);
router.post("/firma", uploadFirma.single("firma"), subirFirma);

router.post("/aprobar", firmarDocumento);

router.get("/export-excel", exportarDatosGFRevisados);
router.get("/firma", obtenerFirma);
router.get("/", obtenerDocumentos);

router.get("/:id", obtenerDocumentoPorId);
// router.patch("/:id/estado", actualizarEstado);
router.delete("/:id", eliminarDocumento);

module.exports = router;