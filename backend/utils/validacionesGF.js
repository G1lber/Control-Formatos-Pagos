import fs from "fs";
import pdf from "pdf-parse";

export async function validarNumeroPlanilla(rutaPDF) {
  const dataBuffer = fs.readFileSync(rutaPDF);
  const data = await pdf(dataBuffer);
  const texto = (data.text || "").replace(/\r/g, "");

  // Limpia guiones que rompen el patrón
  const textoLimpio = texto.replace(/[-]+/g, " ");

  // Regex más flexible
  const regexPrimera = /Nº Planilla PILA[\s\S]*?(\d{6,})/;
  const match = textoLimpio.match(regexPrimera);

  if (!match) {
    throw new Error("❌ No se encontró el número de planilla en la primera parte del PDF");
  }

  const numeroPlanilla = match[1];
  const apariciones = (texto.match(new RegExp(numeroPlanilla, "g")) || []).length;

  if (apariciones < 2) {
    throw new Error(
      // `❌ El número de planilla ${numeroPlanilla} aparece ${apariciones} veces. Se esperaba al menos 2`
      `❌ Revisa el el número de planilla ${numeroPlanilla}`
    );
  }

  return numeroPlanilla;
}