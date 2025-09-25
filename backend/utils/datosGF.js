import fs from "fs";
import pdf from "pdf-parse";

/**
 * Lee el texto limpio de un PDF
 */
async function leerPDF(rutaPDF) {
  const dataBuffer = fs.readFileSync(rutaPDF);
  const data = await pdf(dataBuffer);

  // Normaliza texto:
  const texto = (data.text || "")
    .replace(/\r/g, "")
    .replace(/[-]+/g, " ")
    .replace(/\s+/g, " "); // 🔹 reduce saltos de línea a un espacio

  // 🔹 Debug: imprime parte del texto para revisar
//   console.log("========== TEXTO EXTRAÍDO ==========");
//   console.log(texto);
//   console.log("====================================");

  return texto;
}

/**
 * Extrae los datos clave del documento
 */
export async function extraerDatosContrato(rutaPDF) {
  const texto = await leerPDF(rutaPDF);

  const numeroContrato   = (texto.match(/Nº del contrato:\s*(\d+)/i) || [])[1] || null;
  const valorBruto       = (texto.match(/Valor Bruto Pago:\s*\$?\s*([\d.,]+)/i) || [])[1] || null;
  const compromisoSIIF = (texto.match(/Compromiso\s+SIIF\s*?(\d+)/i) || [])[1] || null;
  const baseICA          = (texto.match(/Base\s+retención\s+en\s+la\s+fuente\s+a\s+titulo\s+de\s+ICA\s+([\d.,]+)/i) || [])[1] || null;
  const baseRenta = (texto.match(/([\d.,]+)\s*TARIFA\s*Base\s+retención\s+en\s+la\s+fuente\s+a\s+titulo\s+de\s+RENTA/i) || [])[1] || null;
  const menosReteFuente  = (texto.match(/Menos\s+Retención\s+en\s+la\s+Fuente\s+([\d.,]+)/i) || [])[1] || "0,00";
  const embargo          = (texto.match(/Descuentos\s+de\s+embargo.*?([\d.,]+)/i) || [])[1] || "0,00";
  const ICA = (texto.match(/Reteica\s+\d+\s+POPAYAN\s+(\d{1,3}(?:\.\d{3})*,\d{2})/i) || [])[1] || null;

  // 🔹 Debug: imprime lo capturado
  console.log("========== DATOS EXTRAÍDOS ==========");
  console.log({ numeroContrato, valorBruto, compromisoSIIF, baseICA, baseRenta, menosReteFuente, embargo, ICA });
  console.log("====================================");

  return {
    numeroContrato,
    valorBruto,
    compromisoSIIF,
    baseICA,
    ICA,
    baseRenta,
    menosReteFuente,
    embargo,
  };
}
