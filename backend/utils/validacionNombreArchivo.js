// utils/validacionesNombre.js

/**
 * Valida que el nombre del archivo tenga el número de documento del usuario.
 * Formato esperado: prefijo_numeroDocumento_otroDato_...ejemplo.pdf
 *
 * @param {string} nombreArchivo - Nombre del archivo (ej: GF_25273113_11125_MARZ_2025_modificado.pdf)
 * @param {string|number} documentoUsuario - Documento del usuario logueado
 */
export function validarNombreArchivo(nombreArchivo, documentoUsuario) {
  // quitar extensión
  const baseName = nombreArchivo.replace(/\.[^/.]+$/, "");
  const partes = baseName.split("_");

  if (partes.length < 3) {
    throw new Error("❌ El nombre del archivo no tiene el formato esperado");
  }

  const numeroEnArchivo = partes[1];

  if (numeroEnArchivo !== String(documentoUsuario)) {
    throw new Error(
      `❌ El número de documento en el nombre del archivo (${numeroEnArchivo}) no coincide con el documento del usuario (${documentoUsuario})`
    );
  }

  return true;
}