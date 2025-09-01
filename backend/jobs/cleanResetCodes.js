import cron from "node-cron";
import ResetCode from "../models/ResetCode.js";

// Ejecutar cada minuto (puedes ajustarlo a cada 5m, cada hora, etc.)
cron.schedule("* * * * *", async () => {
  try {
    const borrados = await ResetCode.query()
      .delete()
      .where("expires_at", "<", new Date());
    if (borrados > 0) {
      console.log(`Se eliminaron ${borrados} códigos expirados`);
    }
  } catch (err) {
    console.error("Error limpiando códigos expirados:", err);
  }
});
