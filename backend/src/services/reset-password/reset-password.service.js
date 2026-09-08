import queries from "../../database/queries.js";

export const createRegistroResetPassword = async (
  client,
  id_usuario,
  token,
  expiracion,
) => {
  const result = await client.query(queries.create_registro_reset_password, [
    id_usuario,
    token,
    expiracion,
  ]);

  return result.rowCount > 0;
};

export const getRegistroResetPasswordValido = async (client, id_usuario) => {
  const result = await client.query(queries.get_registro_reset_password_valid, [
    id_usuario,
  ]);

  return result.rows[0] || null;
};

export const invalidarRegistroResetPassword = async (client, id) => {
  const result = await client.query(queries.invalidar_registro_reset_password, [
    id,
  ]);

  return result.rowCount > 0;
};