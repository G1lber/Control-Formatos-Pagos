// utils/fecha.js
// ✅ Convierte una fecha (ISO o Date) a Date en hora Colombia
export const toColombiaDate = (fecha) => {
  if (!fecha) return null;
  return new Date(
    new Date(fecha).toLocaleString("en-US", { timeZone: "America/Bogota" })
  );
};

export const nowColombia = () => toColombiaDate(new Date());

export const isActivaColombia = (fechaLimite) => {
  if (!fechaLimite) return false;
  return toColombiaDate(fechaLimite) >= nowColombia();
};

export const formatFechaColombia = (fecha) => {
  if (!fecha) return "";
  return new Date(fecha).toLocaleString("es-CO", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Bogota",
  });
};

// ⬇️ NUEVO: para <input type="datetime-local">
export const toColombiaInputString = (fecha) => {
  // recibe ISO/Date y devuelve "YYYY-MM-DDTHH:mm" en hora Colombia
  if (!fecha) return "";
  const d = toColombiaDate(fecha);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${hh}:${mm}`;
};

export const inputColombiaToUTC = (localStr) => {
  // recibe "YYYY-MM-DDTHH:mm" (hora Colombia) y devuelve ISO UTC
  if (!localStr) return null;
  return toColombiaDate(localStr).toISOString();
};
