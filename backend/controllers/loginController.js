import Login from "../models/Login.js";
import bcrypt from "bcryptjs";


export const login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ error: "Correo y contraseña son requeridos" });
    }

    // Buscar usuario con el correo
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

    // Extraer rol
    const rolUsuario = loginData.usuario_rel.rol?.nombre_rol;

    // Verificar si es admin
    if (rolUsuario !== "admin") {
      return res.status(403).json({ error: "Acceso denegado: no eres administrador" });
    }

    // Respuesta si todo está bien
    return res.status(200).json({
      message: "Login exitoso",
      usuario: {
        id: loginData.usuario_rel.id,
        nombre: loginData.usuario_rel.nombre,
        correo: loginData.usuario_rel.correo,
        rol: rolUsuario,
      },
      token: "fake-jwt-token" // 👈 luego lo reemplazamos con JWT real
    });

  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
};
