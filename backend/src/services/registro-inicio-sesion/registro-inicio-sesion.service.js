import queries from "../../database/queries.js";

export const createRegistroInicioSesion = async (client, id_usuario, token) => {
  const result = await client.query(queries.create_registro_inicio_sesion, [
    id_usuario,
    token,
  ]);
  return result.rowCount > 0;
};

export const getRegistroInicioSesionValido = async (
  client,
  id_usuario,
  expiracionMinutos,
) => {
  const result = await client.query(queries.get_registro_inicio_sesion_valido, [
    id_usuario,
    expiracionMinutos,
  ]);

  return result.rows[0] || null;
};

export const invalidarRegistroInicioSesion = async (client, id) => {
  const result = await client.query(queries.invalidar_registro_inicio_sesion, [
    id,
  ]);

  return result.rowCount > 0;
};