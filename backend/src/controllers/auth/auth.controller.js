import {
  loginUsuario,
  getUsuarioActual,
  registrarUsuario,
  verificarUsuario,
  verificarLogin,
  updatePassword,
  forgotPassword,
  resetPassword,
} from "../../services/auth/auth.service.js";

export const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await loginUsuario(email, password);

    if (result.requires2FA) {
      return res.json({
        message: result.message,
        requires2FA: true,
        userId: result.userId,
        tipoUsuario: result.tipoUsuario,
      });
    }

    return res.json({
      message: "Login exitoso",
      requires2FA: false,
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    console.error("Error en login:", err);

    if (err.code === "CAMPO_REQUERIDO") {
      return res.status(400).json({
        message: err.message,
      });
    }

    if (err.code === "NO_AUTENTICADO") {
      return res.status(401).json({
        message: err.message,
      });
    }

    res.status(500).json({
      message: "Error del servidor",
      error: err.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await getUsuarioActual(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error obteniendo usuario:", error);

    res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
};

export const postRegister = async (req, res) => {
  try {
    const result = await registrarUsuario(req.body);

    res.status(201).json({
      message: "Usuario registrado correctamente",
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    console.error("Error en register:", err);

    if (err.code === "CAMPO_REQUERIDO") {
      return res.status(400).json({
        message: err.message,
      });
    }

    if (err.code === "EMAIL_EXISTS") {
      return res.status(409).json({
        message: err.message,
      });
    }

    res.status(500).json({
      message: "Error del servidor",
      error: err.message,
    });
  }
};

export const postVerifyUser = async (req, res) => {
  try {
    const { id, token } = req.body;

    const result = await verificarUsuario(id, token);

    res.json(result);
  } catch (error) {
    if (error.code === "CAMPO_REQUERIDO") {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (error.code === "TOKEN_INVALIDO") {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Error del servidor",
    });
  }
};

export const postVerifyLoginToken = async (req, res) => {
  try {
    const { id_usuario, token } = req.body;

    const result = await verificarLogin(id_usuario, token);

    return res.json({
      message: "Login validado correctamente",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error("Error verificando login:", error);

    if (error.code === "CAMPO_REQUERIDO") {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (error.code === "TOKEN_INVALIDO") {
      return res.status(401).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Error del servidor",
    });
  }
};

export const putPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;
    const data = await updatePassword(
      passwordActual,
      passwordNueva,
      req.user.id,
    );
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });

    res.json({ success: true, message: "Contraseña actualizada" });
  } catch (error) {
    if (["CAMPO_REQUERIDO", "PASSWORD_IGUAL_ANTERIOR"].includes(error.code)) {
      return res.status(400).json({ success: false, message: error.message });
    }

    if (error.code === "USUARIO_INACTIVO") {
      return res.status(403).json({ success: false, message: error.message });
    }

    if (error.code === "PASSWORD_INCORRECTA") {
      return res.status(401).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};

export const postForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await forgotPassword(email);

    res.json({
      success: true,
      message:
        "Si el correo está registrado, recibirás un código de recuperación en breve",
    });
  } catch (error) {
    if (error.code === "CAMPO_REQUERIDO") {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};

export const postResetPassword = async (req, res) => {
  try {
    const { email, token, passwordNueva } = req.body;
    const data = await resetPassword(email, token, passwordNueva);
    if (!data)
      return res
        .status(401)
        .json({ success: false, message: "Token inválido o expirado" });

    res.json({ success: true, message: "Contraseña actualizada" });
  } catch (error) {
    if (error.code === "CAMPO_REQUERIDO") {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};