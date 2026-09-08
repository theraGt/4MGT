import { getConnection } from "../../database/connection.js";
import {
  getUsuarioById,
  getUsuarioPerfil,
  updatePasswordUsuario,
  getUsuarioByEmail,
  getUsuarioLogin,
  createUsuario,
  verificarUsuarioToken,
  getUsuarioVerificacionValido,
  getUsuarioResetPasswordValido,
} from "../usuarios/usuarios.service.js";
import {
  createRegistroResetPassword,
  getRegistroResetPasswordValido,
  invalidarRegistroResetPassword,
} from "../reset-password/reset-password.service.js";
import {
  createRegistroInicioSesion,
  getRegistroInicioSesionValido,
  invalidarRegistroInicioSesion,
} from "../registro-inicio-sesion/registro-inicio-sesion.service.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import { generarToken } from "../../utils/token.js";
import config from "../../config.js";
import jwt from "jsonwebtoken";
import { publishEvent } from "../../events/publisher.js";

const ROLES_ACCESO_DIRECTO = ["piloto"];

export const loginUsuario = async (email, password) => {
  const camposRequeridos = { email, password };
  const faltantes = Object.keys(camposRequeridos).filter(
    (campo) => !camposRequeridos[campo]?.trim(),
  );

  if (faltantes.length > 0) {
    const error = new Error(
      `Los siguientes campos son obligatorios: ${faltantes.join(", ")}`,
    );
    error.code = "CAMPO_REQUERIDO";
    throw error;
  }

  const pool = await getConnection();
  const client = await pool.connect();

  try {
    const user = await getUsuarioLogin(client, email);

    if (!user) {
      const error = new Error("Credenciales incorrectas");
      error.code = "NO_AUTENTICADO";
      throw error;
    }

    const validPassword = await comparePassword(password, user.password_hash);

    if (!validPassword) {
      const error = new Error("Credenciales incorrectas");
      error.code = "NO_AUTENTICADO";
      throw error;
    }

    if (ROLES_ACCESO_DIRECTO.includes(user.tipo_usuario)) {
      const jwtToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          rol: user.tipo_usuario,
        },
        config.jwtSecret,
        {
          expiresIn: config.jwtExpires,
        },
      );

      return {
        requires2FA: false,
        token: jwtToken,
        user: {
          id: user.id,
          email: user.email,
          tipo_usuario: user.tipo_usuario,
          activo: user.activo,
          verificado: user.verificado,
        },
      };
    }

    const tokenLogin = generarToken();
    const tokenLoginHash = await hashPassword(tokenLogin);

    await createRegistroInicioSesion(client, user.id, tokenLoginHash);

    await publishEvent(config.exchange, "usuario.4m.login.verificacion", {
      id: user.id,
      nombre: user.nombres,
      email: user.email,
      token: tokenLogin,
    });

    return {
      requires2FA: true,
      userId: user.id,
      tipoUsuario: user.tipo_usuario,
      message: "Código de verificación enviado",
    };
  } finally {
    client.release();
  }
};

export const getUsuarioActual = async (id) => {
  const pool = await getConnection();
  const client = await pool.connect();

  try {
    const user = await getUsuarioPerfil(client, id);
    return user;
  } finally {
    client.release();
  }
};

export const registrarUsuario = async (data) => {
  const { nombre, apellido, email, password, rol, telefono } = data;

  const camposRequeridos = { nombre, email, password };
  const faltantes = Object.keys(camposRequeridos).filter(
    (campo) => !camposRequeridos[campo]?.trim(),
  );

  if (faltantes.length > 0) {
    const error = new Error(
      `Los siguientes campos son obligatorios: ${faltantes.join(", ")}`,
    );
    error.code = "CAMPO_REQUERIDO";
    throw error;
  }

  const pool = await getConnection();
  const client = await pool.connect();

  try {
    const existing = await getUsuarioByEmail(client, email);

    if (existing) {
      const error = new Error("El email ya está registrado");
      error.code = "EMAIL_EXISTS";
      throw error;
    }

    const hashedPassword = await hashPassword(password);
    const tokenVerificacion = generarToken();
    const tokenVerificacionHash = await hashPassword(tokenVerificacion);

    const result = await createUsuario(client, {
      email,
      password_hash: hashedPassword,
      nombres: nombre,
      apellidos: apellido || "",
      tipo_usuario: rol || "usuario",
      telefono,
      activo: true,
      token_verificacion: tokenVerificacionHash,
    });

    const token = jwt.sign(
      {
        id: result.id,
        email,
        rol: rol || "usuario",
      },
      config.jwtSecret,
      {
        expiresIn: config.jwtExpires,
      },
    );

    await publishEvent(config.exchange, "usuario.4m.creado", {
      id: result.id,
      nombre,
      apellido,
      email,
      rol: rol || "usuario",
      token: tokenVerificacion,
    });

    return {
      token,
      user: {
        id: result.id,
        nombre,
        email,
        rol: rol || "usuario",
      },
    };
  } finally {
    client.release();
  }
};

export const verificarUsuario = async (id, token) => {
  const camposRequeridos = { id, token };
  const faltantes = Object.keys(camposRequeridos).filter(
    (campo) => !String(camposRequeridos[campo] ?? "").trim(),
  );

  if (faltantes.length > 0) {
    const error = new Error(
      `Los siguientes campos son obligatorios: ${faltantes.join(", ")}`,
    );
    error.code = "CAMPO_REQUERIDO";
    throw error;
  }

  const pool = await getConnection();
  const client = await pool.connect();

  try {
    const result = await getUsuarioVerificacionValido(client, id);

    const esTokenValido = result
      ? await comparePassword(token, result.token_verificacion)
      : false;

    if (!esTokenValido) {
      const error = new Error("Token inválido");
      error.code = "TOKEN_INVALIDO";
      throw error;
    }

    await verificarUsuarioToken(client, id);

    return {
      message: "Usuario verificado correctamente",
    };
  } finally {
    client.release();
  }
};

export const verificarLogin = async (id_usuario, token) => {
  const camposRequeridos = { id_usuario, token };
  const faltantes = Object.keys(camposRequeridos).filter(
    (campo) => !String(camposRequeridos[campo] ?? "").trim(),
  );

  if (faltantes.length > 0) {
    const error = new Error(
      `Los siguientes campos son obligatorios: ${faltantes.join(", ")}`,
    );
    error.code = "CAMPO_REQUERIDO";
    throw error;
  }

  const TOKEN_LOGIN_EXPIRATION_MINUTES = 10;

  const pool = await getConnection();
  const client = await pool.connect();

  try {
    const user = await getRegistroInicioSesionValido(
      client,
      id_usuario,
      TOKEN_LOGIN_EXPIRATION_MINUTES,
    );

    const esTokenValido = user
      ? await comparePassword(token, user.token_registro)
      : false;

    if (!esTokenValido) {
      const error = new Error("Token inválido o expirado");
      error.code = "TOKEN_INVALIDO";
      throw error;
    }

    const jwtToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        rol: user.tipo_usuario,
      },
      config.jwtSecret,
      {
        expiresIn: config.jwtExpires,
      },
    );

    await invalidarRegistroInicioSesion(client, user.id_registro);

    return {
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        tipo_usuario: user.tipo_usuario,
        activo: user.activo,
        verificado: user.verificado,
      },
    };
  } finally {
    client.release();
  }
};

export const updatePassword = async (passwordActual, passwordNueva, id) => {
  const camposRequeridos = { passwordActual, passwordNueva };
  const faltantes = Object.keys(camposRequeridos).filter(
    (campo) => !camposRequeridos[campo]?.trim(),
  );

  if (faltantes.length > 0) {
    const error = new Error(
      `Los siguientes campos son obligatorios: ${faltantes.join(", ")}`,
    );
    error.code = "CAMPO_REQUERIDO";
    throw error;
  }

  const pool = await getConnection();
  const client = await pool.connect();
  try {
    const usuario = await getUsuarioById(client, id);

    if (!usuario) {
      return null;
    }

    if (!usuario.activo) {
      const error = new Error("Usuario inactivo");
      error.code = "USUARIO_INACTIVO";
      throw error;
    }

    const ok = await comparePassword(passwordActual, usuario.password_hash);

    if (!ok) {
      const error = new Error("La contraseña actual es incorrecta");
      error.code = "PASSWORD_INCORRECTA";
      throw error;
    }

    if (passwordActual === passwordNueva) {
      const error = new Error(
        "La nueva contraseña debe de ser diferente a la actual",
      );
      error.code = "PASSWORD_IGUAL_ANTERIOR";
      throw error;
    }

    const password_hash = await hashPassword(passwordNueva);

    const result = await updatePasswordUsuario(client, password_hash, id);

    return result;
  } finally {
    client.release();
  }
};

export const forgotPassword = async (email) => {
  if (!email?.trim()) {
    const error = new Error("El campo email es obligatorio");
    error.code = "CAMPO_REQUERIDO";
    throw error;
  }

  const TOKEN_RESET_EXPIRATION_MINUTES = 10;

  const pool = await getConnection();
  const client = await pool.connect();
  try {
    const user = await getUsuarioResetPasswordValido(client, email);

    if (user) {
      const token = generarToken();
      const tokenHash = await hashPassword(token);

      await createRegistroResetPassword(
        client,
        user.id,
        tokenHash,
        TOKEN_RESET_EXPIRATION_MINUTES,
      );

      await publishEvent(config.exchange, "usuario.4m.password.reset", {
        email: user.email,
        nombre: user.nombres,
        token,
      });
    }
  } finally {
    client.release();
  }
};

export const resetPassword = async (email, token, passwordNueva) => {
  const camposRequeridos = { email, token, passwordNueva };
  const faltantes = Object.keys(camposRequeridos).filter(
    (campo) => !camposRequeridos[campo]?.trim(),
  );

  if (faltantes.length > 0) {
    const error = new Error(
      `Los siguientes campos son obligatorios: ${faltantes.join(", ")}`,
    );

    error.code = "CAMPO_REQUERIDO";
    throw error;
  }

  const pool = await getConnection();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const user = await getUsuarioResetPasswordValido(client, email);

    if (!user) {
      await client.query("ROLLBACK");
      return null;
    }

    const result = await getRegistroResetPasswordValido(client, user.id);
    const esTokenValido = result
      ? await comparePassword(token, result.token)
      : false;

    if (!esTokenValido) {
      await client.query("ROLLBACK");
      return null;
    }

    const password_hash = await hashPassword(passwordNueva);
    await updatePasswordUsuario(client, password_hash, result.id_usuario);

    await invalidarRegistroResetPassword(client, result.id);

    await client.query("COMMIT");

    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};