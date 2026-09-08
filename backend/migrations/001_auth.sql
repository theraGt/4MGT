-- =====================================================
-- 4M - TABLAS DE AUTENTICACIÓN
-- Esquema: "4m"
-- Ejecutar manualmente SOLO si las tablas no existen aún.
-- NO modifica ninguna tabla existente de la BD 4M.
-- =====================================================

-- 1. USUARIOS
CREATE TABLE IF NOT EXISTS "4m".usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    tipo_usuario VARCHAR(30) DEFAULT 'usuario',
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    verificado BOOLEAN DEFAULT FALSE,
    token_verificacion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. REGISTRO DE INICIO DE SESIÓN (código 2FA)
CREATE TABLE IF NOT EXISTS "4m".registro_inicio_sesion (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES "4m".usuarios(id),
    token TEXT NOT NULL,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usado BOOLEAN DEFAULT FALSE
);

-- 3. REGISTRO DE RESETEO DE CONTRASEÑA
CREATE TABLE IF NOT EXISTS "4m".registro_reset_password (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES "4m".usuarios(id),
    token TEXT NOT NULL,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expira TIMESTAMP,
    usado BOOLEAN DEFAULT FALSE
);

-- Índices de búsqueda
CREATE INDEX IF NOT EXISTS idx_4m_usuarios_email ON "4m".usuarios (email);
CREATE INDEX IF NOT EXISTS idx_4m_inicio_sesion_usuario ON "4m".registro_inicio_sesion (id_usuario, usado);
CREATE INDEX IF NOT EXISTS idx_4m_reset_password_usuario ON "4m".registro_reset_password (id_usuario, usado);