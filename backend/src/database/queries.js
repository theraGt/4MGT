export default {
    // ---- USUARIOS ----
    get_usuario_by_email: `SELECT * FROM "4m".usuarios WHERE email = $1`,
    login_query: `
        SELECT * FROM "4m".usuarios
        WHERE email = $1 AND activo = true AND verificado = true
    `,
    get_usuario_perfil: `
        SELECT id, email, nombres, apellidos, tipo_usuario, telefono, activo, verificado
        FROM "4m".usuarios WHERE id = $1
    `,
    create_usuario: `
        INSERT INTO "4m".usuarios (email, password_hash, nombres, apellidos, tipo_usuario,
        telefono, activo, token_verificacion)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
    `,
    get_usuario_by_id: `SELECT * FROM "4m".usuarios WHERE id = $1`,
    update_usuario: `
        UPDATE "4m".usuarios SET
            email = $1,
            nombres = $2,
            apellidos = $3,
            telefono = $4,
            activo = $5
        WHERE id = $6 RETURNING id
    `,
    get_usuario_reset_password_valido: `
        SELECT * FROM "4m".usuarios WHERE email = $1
        AND activo = true AND verificado = true
    `,
    update_password_usuario: `UPDATE "4m".usuarios SET password_hash = $1 WHERE id = $2`,
    get_usuario_verificacion_valido: `
        SELECT * FROM "4m".usuarios WHERE id = $1
        AND activo = true AND verificado = false
    `,
    verificar_usuario: `
        UPDATE "4m".usuarios
        SET verificado = true
        WHERE id = $1 RETURNING id
    `,

    // ---- REGISTRO_INICIO_SESION ----
    create_registro_inicio_sesion: `
        INSERT INTO "4m".registro_inicio_sesion (id_usuario, token, fecha_inicio, usado)
        VALUES ($1, $2, CURRENT_TIMESTAMP, false)
    `,
    get_registro_inicio_sesion_valido: `
        SELECT u.*, t.id AS id_registro, t.token AS token_registro
        FROM "4m".registro_inicio_sesion t
        JOIN "4m".usuarios u ON u.id = t.id_usuario
        WHERE t.id_usuario = $1 AND t.usado = false
        AND t.fecha_inicio + make_interval(mins => $2) > NOW()
        ORDER BY t.fecha_inicio DESC LIMIT 1
    `,
    invalidar_registro_inicio_sesion: `
        UPDATE "4m".registro_inicio_sesion
        SET usado = true WHERE id = $1
    `,

    // ---- REGISTRO_RESET_PASSWORD ----
    create_registro_reset_password: `
        INSERT INTO "4m".registro_reset_password (id_usuario, token, fecha_expira)
        VALUES ($1, $2, CURRENT_TIMESTAMP + make_interval(mins => $3))
    `,
    get_registro_reset_password_valid: `
        SELECT * FROM "4m".registro_reset_password
        WHERE id_usuario = $1 AND usado = false AND
        fecha_expira > NOW() ORDER BY fecha_solicitud DESC LIMIT 1
    `,
    invalidar_registro_reset_password: `
        UPDATE "4m".registro_reset_password
        SET usado = true WHERE id = $1
    `,
};