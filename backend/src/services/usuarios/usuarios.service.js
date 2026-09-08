import queries from "../../database/queries.js";

export const getUsuarioByEmail = async (client, email) => {
  const result = await client.query(queries.get_usuario_by_email, [email]);
  return result.rows[0] || null;
};

export const createUsuario = async (client, data) => {
  const result = await client.query(queries.create_usuario, [
    data.email,
    data.password_hash,
    data.nombres,
    data.apellidos,
    data.tipo_usuario,
    data.telefono,
    data.activo,
    data.token_verificacion,
  ]);

  return result.rows[0];
};

export const getUsuarioById = async (client, id) => {
  const result = await client.query(queries.get_usuario_by_id, [id]);
  return result.rows[0] || null;
};

export const getUsuarioPerfil = async (client, id) => {
  const result = await client.query(queries.get_usuario_perfil, [id]);
  return result.rows[0] || null;
};

export const updateUsuario = async (client, data) => {
  const result = await client.query(queries.update_usuario, [
    data.email,
    data.nombres,
    data.apellidos,
    data.telefono,
    data.activo,
    data.id,
  ]);

  return result.rows[0];
};

export const getUsuarioResetPasswordValido = async (client, email) => {
  const result = await client.query(queries.get_usuario_reset_password_valido, [
    email,
  ]);
  return result.rows[0] || null;
};

export const updatePasswordUsuario = async (client, password_hash, id) => {
  const result = await client.query(queries.update_password_usuario, [
    password_hash,
    id,
  ]);
  return result.rowCount > 0;
};

export const getUsuarioVerificacionValido = async (client, id) => {
  const result = await client.query(queries.get_usuario_verificacion_valido, [
    id,
  ]);
  return result.rows[0] || null;
};

export const verificarUsuarioToken = async (client, id) => {
  const result = await client.query(queries.verificar_usuario, [id]);
  return result.rows[0] || null;
};

export const getUsuarioLogin = async (client, email) => {
  const result = await client.query(queries.login_query, [email]);
  return result.rows[0] || null;
};