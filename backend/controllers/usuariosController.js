import Usuario from "../models/Usuario.js";
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
  const { nombre, numero_doc, correo, rol_id, password } = req.body;

  try {
    // Crear usuario
    const usuario = await Usuario.query().insert({
      nombre,
      numero_doc,
      correo,
      rol_id,
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

    res.status(201).json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar usuario
const updateUsuario = async (req, res) => {
  const { nombre, numero_doc, correo, rol_id, password } = req.body;

  try {
    const usuario = await Usuario.query().findById(req.params.id);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    const rolAnterior = await Rol.query().findById(usuario.rol_id);
    const rolNuevo = await Rol.query().findById(rol_id);

    // Actualizar datos básicos
    await Usuario.query().patchAndFetchById(req.params.id, {
      nombre,
      numero_doc,
      correo,
      rol_id,
    });

    // Si pasa de usuario → admin
    if (rolAnterior.nombre !== "admin" && rolNuevo.nombre === "admin") {
      if (!password) {
        return res.status(400).json({ error: "Debe asignar contraseña al cambiar a admin" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await Login.query().insert({
        usuario: usuario.id,
        password: hashedPassword,
      });
    }

    // Si sigue siendo admin y cambia contraseña
    if (rolAnterior.nombre === "admin" && rolNuevo.nombre === "admin" && password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await Login.query().patch({ password: hashedPassword }).where("usuario", usuario.id);
    }

    // Si pasa de admin → usuario
    if (rolAnterior.nombre === "admin" && rolNuevo.nombre !== "admin") {
      await Login.query().delete().where("usuario", usuario.id);
    }

    res.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar usuario
const deleteUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.query().findById(req.params.id);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    // Si tiene login → eliminarlo
    await Login.query().delete().where("usuario", usuario.id);

    await Usuario.query().deleteById(usuario.id);

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
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
