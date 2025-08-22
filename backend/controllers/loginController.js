import Login from "../models/Login.js";
import bcrypt from "bcrypt";

export const login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ error: "Correo y contraseña son requeridos" });
    }

    //Buscar login y traer usuario + rol
    const loginData = await Login.query()
      .joinRelated("usuario_rel")
      .where("usuario_rel.correo", correo)
      .withGraphFetched("usuario_rel.rol")
      .first();

    if (!loginData) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, loginData.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Extraer rol correctamente (el campo es "nombre_rol")
    const rolUsuario = loginData.usuario_rel.rol?.nombre_rol;

    // Verificar rol después de la contraseña
    if (rolUsuario !== "admin") {
      return res.status(403).json({ error: "Acceso denegado: no eres administrador" });
    }

    //Si pasa, login exitoso
    return res.status(200).json({
      message: "Login exitoso",
      usuario: {
        id: loginData.usuario_rel.id,
        nombre: loginData.usuario_rel.nombre,
        correo: loginData.usuario_rel.correo,
        rol: rolUsuario,
      },
    });

  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
};
