import Usuario from "../models/Usuario.js";
import Documentos from "../models/Documentos.js";
import Rol from "../models/Rol.js";
import Login from "../models/Login.js";
import bcrypt from "bcrypt";

// Obtener todos los usuarios
const getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.query().withGraphFetched("[rol, login]");
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un usuario por ID
const getUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.query()
      .findById(req.params.id)
      .withGraphFetched("[rol, login]");

    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear usuario
const createUsuario = async (req, res) => {
  const { nombre, numero_doc, correo, rol_id, tipo_documento_id, password } = req.body;

  try {
    // Crear usuario
    const usuario = await Usuario.query().insert({
      nombre,
      numero_doc,
      correo,
      rol_id, 
      tipo_documento_id, // Asegurar que el campo se mapea correctamente
    });

    // Si el rol es admin → requiere contraseña
    const rol = await Rol.query().findById(rol_id);
    if (rol && rol.nombre_rol === "admin") {
      if (!password) {
        return res.status(400).json({ error: "La contraseña es obligatoria para admin" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await Login.query().insert({
        usuario: usuario.id,
        password: hashedPassword,
      });
    }

    // 🔹 Crear documento vacío ligado al usuario
    await Documentos.query().insert({
      usuario: usuario.id,
      archivo1: null,
      archivo2: null,
      estadogf_id: 3, // estado inicial GF
      estadogc_id: 3, // estado inicial GC
    });

    res.status(201).json(usuario);
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ error: error.message });
  }
};
// Actualizar usuario
const updateUsuario = async (req, res) => {
  const { nombre, numero_doc, correo, rol_id,tipo_documento_id, password } = req.body;

  try {
    const usuario = await Usuario.query().findById(req.params.id);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    const rolAnterior = await Rol.query().findById(usuario.rol_id);
    const rolNuevo = await Rol.query().findById(rol_id);

    // Actualizar datos básicos (nombre, doc, correo, rol)
    const usuarioActualizado = await Usuario.query().patchAndFetchById(req.params.id, {
      nombre,
      numero_doc,
      correo,
      rol_id,
      tipo_documento_id, // Asegurar que el campo se mapea correctamente
    });

    // --- Manejo de credenciales según cambios de rol ---

    // Si pasa de usuario → admin
    if (rolAnterior.nombre_rol !== "admin" && rolNuevo.nombre_rol === "admin") {
      if (!password) {
        return res
          .status(400)
          .json({ error: "Debe asignar contraseña al cambiar a admin" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await Login.query().insert({
        usuario: usuario.id,
        password: hashedPassword,
      });
    }

    // Si sigue siendo admin y envió nueva contraseña
    if (rolAnterior.nombre_rol === "admin" && rolNuevo.nombre_rol === "admin") {
      if (password && password.trim() !== "") {
        const hashedPassword = await bcrypt.hash(password, 10);
        await Login.query()
          .patch({ password: hashedPassword })
          .where("usuario", usuario.id);
      }
    }

    // Si pasa de admin → usuario
    if (rolAnterior.nombre_rol === "admin" && rolNuevo.nombre_rol !== "admin") {
      await Login.query().delete().where("usuario", usuario.id);
    }

    res.json({
      message: "Usuario actualizado correctamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
};


// Eliminar usuario
const deleteUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.query().findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Si tiene login → eliminarlo
    await Login.query().delete().where("usuario", usuario.id);

    // Eliminar documentos asociados
    await Documentos.query().delete().where("usuario", usuario.id);

    // Finalmente eliminar el usuario
    await Usuario.query().deleteById(usuario.id);

    res.json({ message: "Usuario y documentos eliminados correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ error: error.message });
  }
};

export {
  getUsuarios,
  getUsuario,
  createUsuario,
  updateUsuario,
  deleteUsuario
};
