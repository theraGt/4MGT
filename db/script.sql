-- =====================================================
-- SISTEMA DE GESTIÓN DE EVENTOS - ASOCIACIÓN 4M
-- BASE DE DATOS POSTGRESQL - VERSIÓN NORMALIZADA
-- =====================================================

-- =====================================================
-- 1. CATÁLOGOS BASE (TABLAS MAESTRAS)
-- =====================================================

-- 1.1 Tipo de Identificación
CREATE TABLE cat_tipo_identificacion (
    id_tipo_identificacion SERIAL PRIMARY KEY,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE
);

-- 1.2 Género
CREATE TABLE cat_genero (
    id_genero SERIAL PRIMARY KEY,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE
);

-- 1.3 Estado Civil
CREATE TABLE cat_estado_civil (
    id_estado_civil SERIAL PRIMARY KEY,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE
);

-- 1.4 Nivel de Experiencia
CREATE TABLE cat_nivel_experiencia (
    id_nivel_experiencia SERIAL PRIMARY KEY,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    valor_numerico INTEGER,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

-- 1.5 Nivel de Salud
CREATE TABLE cat_nivel_salud (
    id_nivel_salud SERIAL PRIMARY KEY,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    valor_numerico INTEGER,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

-- 1.6 Parentesco
CREATE TABLE cat_parentesco (
    id_parentesco SERIAL PRIMARY KEY,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

-- 1.7 Estado de Pago
CREATE TABLE cat_estado_pago (
    id_estado_pago SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    color_hex VARCHAR(7),
    activo BOOLEAN DEFAULT TRUE
);

-- 1.8 Estado de Inscripción
CREATE TABLE cat_estado_inscripcion (
    id_estado_inscripcion SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    color_hex VARCHAR(7),
    activo BOOLEAN DEFAULT TRUE
);

-- 1.9 Estado de Evento
CREATE TABLE cat_estado_evento (
    id_estado_evento SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    color_hex VARCHAR(7),
    activo BOOLEAN DEFAULT TRUE
);

-- 1.10 Tipo de Dato para Campos de Plantilla
CREATE TABLE cat_tipo_dato (
    id_tipo_dato SERIAL PRIMARY KEY,
    codigo VARCHAR(30) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

-- 1.11 Secciones de Formulario
CREATE TABLE cat_seccion_formulario (
    id_seccion SERIAL PRIMARY KEY,
    codigo VARCHAR(30) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50),
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE
);

-- 1.12 Método de Pago
CREATE TABLE cat_metodo_pago (
    id_metodo_pago SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

-- 1.13 Monedas
CREATE TABLE cat_moneda (
    id_moneda SERIAL PRIMARY KEY,
    codigo VARCHAR(3) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    simbolo VARCHAR(5),
    activo BOOLEAN DEFAULT TRUE
);

-- 1.14 Países
CREATE TABLE cat_pais (
    id_pais SERIAL PRIMARY KEY,
    codigo VARCHAR(3) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    nacionalidad VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE
);

-- 1.15 Departamentos/Estados
CREATE TABLE cat_departamento (
    id_departamento SERIAL PRIMARY KEY,
    id_pais INTEGER NOT NULL REFERENCES cat_pais(id_pais),
    codigo VARCHAR(10),
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- 1.16 Habilidades
CREATE TABLE cat_habilidad (
    id_habilidad SERIAL PRIMARY KEY,
    codigo VARCHAR(30) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

-- 1.17 Equipos Crew
CREATE TABLE cat_equipo_crew (
    id_equipo SERIAL PRIMARY KEY,
    codigo VARCHAR(30) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    cupo_maximo INTEGER,
    activo BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- 2. TABLAS PRINCIPALES
-- =====================================================

-- 2.1 PLANTILLAS
CREATE TABLE plantillas (
    id_plantilla SERIAL PRIMARY KEY,
    nombre_plantilla VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.2 CAMPOS DE PLANTILLA
CREATE TABLE campos_plantilla (
    id_campo SERIAL PRIMARY KEY,
    nombre_campo VARCHAR(100) UNIQUE NOT NULL,
    etiqueta VARCHAR(150) NOT NULL,
    id_tipo_dato INTEGER NOT NULL REFERENCES cat_tipo_dato(id_tipo_dato),
    id_seccion INTEGER REFERENCES cat_seccion_formulario(id_seccion),
    obligatorio BOOLEAN DEFAULT FALSE,
    orden INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT TRUE,
    validacion TEXT,
    ayuda_texto TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- 2.3 RELACIÓN PLANTILLA-CAMPOS
CREATE TABLE plantilla_campos (
    id_plantilla INTEGER NOT NULL REFERENCES plantillas(id_plantilla),
    id_campo INTEGER NOT NULL REFERENCES campos_plantilla(id_campo),
    orden_visual INTEGER,
    obligatorio_en_plantilla BOOLEAN DEFAULT FALSE,
    visible_en_plantilla BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (id_plantilla, id_campo)
);

-- 2.4 OPCIONES PARA CAMPOS SELECT
CREATE TABLE cat_opciones_campo (
    id_opcion SERIAL PRIMARY KEY,
    id_campo INTEGER NOT NULL REFERENCES campos_plantilla(id_campo),
    codigo VARCHAR(30),
    valor VARCHAR(100) NOT NULL,
    valor_extra BOOLEAN DEFAULT FALSE,
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE
);

-- 2.5 PERSONAS
CREATE TABLE personas (
    id_persona SERIAL PRIMARY KEY,
    id_tipo_identificacion INTEGER NOT NULL REFERENCES cat_tipo_identificacion(id_tipo_identificacion),
    numero_identificacion VARCHAR(50) UNIQUE NOT NULL,
    id_pais_nacionalidad INTEGER REFERENCES cat_pais(id_pais),
    nombre_completo VARCHAR(150) NOT NULL,
    primer_nombre VARCHAR(50),
    segundo_nombre VARCHAR(50),
    primer_apellido VARCHAR(50),
    segundo_apellido VARCHAR(50),
    fecha_nacimiento DATE NOT NULL,
    id_genero INTEGER REFERENCES cat_genero(id_genero),
    telefono_principal VARCHAR(20),
    telefono_secundario VARCHAR(20),
    correo_electronico VARCHAR(150) NOT NULL,
    correo_secundario VARCHAR(150),
    direccion TEXT,
    ciudad VARCHAR(100),
    id_departamento INTEGER REFERENCES cat_departamento(id_departamento),
    id_pais_residencia INTEGER REFERENCES cat_pais(id_pais),
    codigo_postal VARCHAR(20),
    id_estado_civil INTEGER REFERENCES cat_estado_civil(id_estado_civil),
    nombre_conyuge VARCHAR(150),
    telefono_conyuge VARCHAR(20),
    correo_conyuge VARCHAR(150),
    asiste_iglesia BOOLEAN DEFAULT FALSE,
    nombre_iglesia VARCHAR(150),
    denominacion VARCHAR(100),
    rol_iglesia VARCHAR(100),
    tiene_alergias BOOLEAN DEFAULT FALSE,
    alergias TEXT,
    tiene_cirugias BOOLEAN DEFAULT FALSE,
    cirugias TEXT,
    tiene_problemas_cardiacos BOOLEAN DEFAULT FALSE,
    problemas_cardiacos TEXT,
    tiene_vertigo BOOLEAN DEFAULT FALSE,
    vertigo TEXT,
    tiene_desmayos BOOLEAN DEFAULT FALSE,
    desmayos TEXT,
    tiene_migrañas BOOLEAN DEFAULT FALSE,
    migrañas TEXT,
    tiene_problemas_espalda BOOLEAN DEFAULT FALSE,
    problemas_espalda TEXT,
    tiene_problemas_rodilla BOOLEAN DEFAULT FALSE,
    problemas_rodilla TEXT,
    tiene_problemas_respiratorios BOOLEAN DEFAULT FALSE,
    problemas_respiratorios TEXT,
    tiene_diabetes BOOLEAN DEFAULT FALSE,
    diabetes TEXT,
    medicamentos_actuales TEXT,
    otra_info_medica TEXT,
    nombre_emergencia VARCHAR(150),
    telefono_emergencia VARCHAR(20),
    parentesco_emergencia VARCHAR(50),
    aseguradora VARCHAR(150),
    telefono_aseguradora VARCHAR(20),
    nombre_poliza VARCHAR(150),
    numero_poliza VARCHAR(50),
    id_nivel_experiencia_acampando INTEGER REFERENCES cat_nivel_experiencia(id_nivel_experiencia),
    id_nivel_experiencia_mochilero INTEGER REFERENCES cat_nivel_experiencia(id_nivel_experiencia),
    id_nivel_salud_fisica INTEGER REFERENCES cat_nivel_salud(id_nivel_salud),
    conocimientos_primeros_auxilios BOOLEAN DEFAULT FALSE,
    nivel_primeros_auxilios VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    usuario_creacion INTEGER
);

-- 2.6 HABILIDADES_PERSONA (Relación N:N)
CREATE TABLE habilidades_persona (
    id_habilidad_persona SERIAL PRIMARY KEY,
    id_persona INTEGER NOT NULL REFERENCES personas(id_persona),
    id_habilidad INTEGER NOT NULL REFERENCES cat_habilidad(id_habilidad),
    nivel VARCHAR(50),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_persona, id_habilidad)
);

-- 2.7 EVENTOS
CREATE TABLE eventos (
    id_evento SERIAL PRIMARY KEY,
    nombre_evento VARCHAR(150) NOT NULL,
    anio INTEGER NOT NULL,
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    lugar VARCHAR(200),
    ubicacion_gps VARCHAR(100),
    capacidad_maxima INTEGER DEFAULT 0,
    precio_inscripcion DECIMAL(10,2) DEFAULT 0,
    id_moneda INTEGER REFERENCES cat_moneda(id_moneda),
    permitir_inscripcion_menores BOOLEAN DEFAULT TRUE,
    edad_minima INTEGER DEFAULT 18,
    edad_maxima INTEGER DEFAULT 99,
    requiere_autorizacion BOOLEAN DEFAULT TRUE,
    fecha_apertura_inscripciones TIMESTAMP,
    fecha_cierre_inscripciones TIMESTAMP,
    fecha_limite_pago TIMESTAMP,
    id_estado_evento INTEGER REFERENCES cat_estado_evento(id_estado_evento),
    id_plantilla INTEGER REFERENCES plantillas(id_plantilla),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por INTEGER
);

-- 2.8 INSCRIPCIONES
CREATE TABLE inscripciones (
    id_inscripcion SERIAL PRIMARY KEY,
    id_evento INTEGER NOT NULL REFERENCES eventos(id_evento),
    id_persona INTEGER NOT NULL REFERENCES personas(id_persona),
    es_responsable BOOLEAN DEFAULT FALSE,
    es_menor BOOLEAN DEFAULT FALSE,
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_confirmacion TIMESTAMP,
    id_estado_pago INTEGER REFERENCES cat_estado_pago(id_estado_pago),
    monto_pagado DECIMAL(10,2) DEFAULT 0,
    monto_total DECIMAL(10,2) DEFAULT 0,
    id_moneda_pago INTEGER REFERENCES cat_moneda(id_moneda),
    id_metodo_pago INTEGER REFERENCES cat_metodo_pago(id_metodo_pago),
    referencia_pago VARCHAR(100),
    fecha_pago TIMESTAMP,
    comprobante_pago VARCHAR(255),
    talla_camisa VARCHAR(10),
    restricciones_dieteticas TEXT,
    explicacion_dieta TEXT,
    necesita_alojamiento BOOLEAN DEFAULT FALSE,
    necesita_transporte BOOLEAN DEFAULT FALSE,
    leyo_politicas_cancelacion BOOLEAN DEFAULT FALSE,
    acepta_terminos BOOLEAN DEFAULT FALSE,
    autorizacion_firmada BOOLEAN DEFAULT FALSE,
    id_estado_inscripcion INTEGER REFERENCES cat_estado_inscripcion(id_estado_inscripcion),
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por INTEGER
);

-- 2.9 RESPONSABLES_MENORES
CREATE TABLE responsables_menores (
    id_relacion SERIAL PRIMARY KEY,
    id_inscripcion_responsable INTEGER NOT NULL REFERENCES inscripciones(id_inscripcion),
    id_inscripcion_menor INTEGER NOT NULL REFERENCES inscripciones(id_inscripcion),
    id_parentesco INTEGER REFERENCES cat_parentesco(id_parentesco),
    autorizacion_firmada BOOLEAN DEFAULT FALSE,
    fecha_autorizacion TIMESTAMP,
    archivo_autorizacion VARCHAR(255),
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_inscripcion_responsable, id_inscripcion_menor)
);

-- 2.10 RESPUESTAS_INSCRIPCION
CREATE TABLE respuestas_inscripcion (
    id_respuesta SERIAL PRIMARY KEY,
    id_inscripcion INTEGER NOT NULL REFERENCES inscripciones(id_inscripcion) ON DELETE CASCADE,
    id_campo INTEGER NOT NULL REFERENCES campos_plantilla(id_campo),
    valor TEXT,
    id_opcion_seleccionada INTEGER REFERENCES cat_opciones_campo(id_opcion),
    valor_extra TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_inscripcion, id_campo)
);

-- 2.11 HISTORIAL_INSCRIPCIONES
CREATE TABLE historial_inscripciones (
    id_historial SERIAL PRIMARY KEY,
    id_inscripcion INTEGER NOT NULL REFERENCES inscripciones(id_inscripcion),
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    campo_modificado VARCHAR(50),
    valor_anterior TEXT,
    valor_nuevo TEXT,
    usuario_modificacion INTEGER,
    ip_usuario VARCHAR(45)
);

-- =====================================================
-- 3. ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

CREATE INDEX idx_personas_identificacion ON personas (id_tipo_identificacion, numero_identificacion);
CREATE INDEX idx_personas_correo ON personas (correo_electronico);
CREATE INDEX idx_personas_nombre ON personas (primer_nombre, primer_apellido);
CREATE INDEX idx_personas_fecha_nacimiento ON personas (fecha_nacimiento);

CREATE INDEX idx_eventos_estado_fechas ON eventos (id_estado_evento, fecha_apertura_inscripciones, fecha_cierre_inscripciones);
CREATE INDEX idx_eventos_anio ON eventos (anio);

CREATE INDEX idx_inscripciones_evento_persona ON inscripciones (id_evento, id_persona);
CREATE INDEX idx_inscripciones_estado_pago ON inscripciones (id_estado_pago, id_estado_inscripcion);
CREATE INDEX idx_inscripciones_fecha ON inscripciones (fecha_inscripcion);

CREATE INDEX idx_respuestas_inscripcion_campo ON respuestas_inscripcion (id_campo);
CREATE INDEX idx_historial_inscripcion_fecha ON historial_inscripciones (id_inscripcion, fecha_cambio);

CREATE INDEX idx_cat_opciones_campo_campo ON cat_opciones_campo (id_campo);
CREATE INDEX idx_cat_departamento_pais ON cat_departamento (id_pais);

-- =====================================================
-- 4. TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA DE TIMESTAMPS
-- =====================================================

-- Función para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para personas
CREATE TRIGGER trigger_actualizar_personas
BEFORE UPDATE ON personas
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Triggers para inscripciones
CREATE TRIGGER trigger_actualizar_inscripciones
BEFORE UPDATE ON inscripciones
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Triggers para respuestas_inscripcion
CREATE TRIGGER trigger_actualizar_respuestas
BEFORE UPDATE ON respuestas_inscripcion
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. DATOS INICIALES (CATÁLOGOS)
-- =====================================================

-- 5.1 Tipo de Identificación
INSERT INTO cat_tipo_identificacion (codigo, nombre, orden) VALUES
('DPI', 'DPI (Documento Personal de Identificación)', 1),
('PAS', 'Pasaporte', 2),
('CED', 'Cédula', 3),
('OTRO', 'Otro', 4);

-- 5.2 Género
INSERT INTO cat_genero (codigo, nombre, orden) VALUES
('M', 'Masculino', 1),
('F', 'Femenino', 2),
('NB', 'No Binario', 3),
('PND', 'Prefiero no decir', 4);

-- 5.3 Estado Civil
INSERT INTO cat_estado_civil (codigo, nombre, orden) VALUES
('SOL', 'Soltero/a', 1),
('CAS', 'Casado/a', 2),
('DIV', 'Divorciado/a', 3),
('VIU', 'Viudo/a', 4),
('UDH', 'Unión de hecho', 5);

-- 5.4 Nivel de Experiencia
INSERT INTO cat_nivel_experiencia (codigo, nombre, valor_numerico) VALUES
('NIN', 'Ninguna', 0),
('BAS', 'Básica', 1),
('INT', 'Intermedia', 2),
('AVA', 'Avanzada', 3),
('EXP', 'Experto', 4);

-- 5.5 Nivel de Salud
INSERT INTO cat_nivel_salud (codigo, nombre, valor_numerico) VALUES
('BAJ', 'Bajo', 1),
('MED', 'Medio', 2),
('ALT', 'Alto', 3);

-- 5.6 Parentesco
INSERT INTO cat_parentesco (codigo, nombre) VALUES
('PAD', 'Padre'),
('MAD', 'Madre'),
('TIO', 'Tío'),
('TIA', 'Tía'),
('ABU', 'Abuelo'),
('ABA', 'Abuela'),
('HER', 'Hermano'),
('HEA', 'Hermana'),
('TUT', 'Tutor Legal'),
('OTR', 'Otro');

-- 5.7 Estado de Pago
INSERT INTO cat_estado_pago (codigo, nombre, color_hex) VALUES
('PEN', 'Pendiente', '#FFA500'),
('PAR', 'Parcial', '#FFD700'),
('PAG', 'Pagado', '#00CC00'),
('REM', 'Reembolsado', '#FF0000'),
('EXE', 'Exento', '#808080');

-- 5.8 Estado de Inscripción
INSERT INTO cat_estado_inscripcion (codigo, nombre, color_hex) VALUES
('PEN', 'Pendiente', '#FFA500'),
('CON', 'Confirmada', '#00CC00'),
('CAN', 'Cancelada', '#FF0000'),
('ESP', 'En Espera', '#4169E1'),
('REC', 'Rechazada', '#DC143C');

-- 5.9 Estado de Evento
INSERT INTO cat_estado_evento (codigo, nombre, color_hex) VALUES
('BOR', 'Borrador', '#808080'),
('PUB', 'Publicado', '#00CC00'),
('ECU', 'En Curso', '#FFA500'),
('CER', 'Cerrado', '#4169E1'),
('FIN', 'Finalizado', '#800080'),
('CAN', 'Cancelado', '#FF0000');

-- 5.10 Tipo de Dato
INSERT INTO cat_tipo_dato (codigo, nombre) VALUES
('texto', 'Texto Corto'),
('textarea', 'Texto Largo'),
('numero', 'Número'),
('fecha', 'Fecha'),
('booleano', 'Sí/No'),
('select', 'Selección Única'),
('multiselect', 'Selección Múltiple'),
('email', 'Correo Electrónico'),
('telefono', 'Teléfono'),
('archivo', 'Archivo');

-- 5.11 Secciones de Formulario
INSERT INTO cat_seccion_formulario (codigo, nombre, icono, orden) VALUES
('personales', 'Datos Personales', 'user', 1),
('contacto', 'Contacto', 'phone', 2),
('eclesiasticos', 'Datos Eclesiásticos', 'church', 3),
('medica', 'Ficha Médica', 'heart', 4),
('logistica', 'Logística', 'truck', 5),
('emergencia', 'Contacto de Emergencia', 'alert', 6),
('seguro', 'Seguro', 'shield', 7),
('experiencia', 'Experiencia', 'star', 8);

-- 5.12 Método de Pago
INSERT INTO cat_metodo_pago (codigo, nombre) VALUES
('EFE', 'Efectivo'),
('TAR', 'Tarjeta de Crédito/Débito'),
('TRA', 'Transferencia Bancaria'),
('DEP', 'Depósito'),
('DON', 'Donación'),
('OTR', 'Otro');

-- 5.13 Monedas
INSERT INTO cat_moneda (codigo, nombre, simbolo) VALUES
('GTQ', 'Quetzal Guatemalteco', 'Q'),
('USD', 'Dólar Americano', '$'),
('EUR', 'Euro', '€'),
('MXN', 'Peso Mexicano', '$');

-- 5.14 Países
INSERT INTO cat_pais (codigo, nombre, nacionalidad) VALUES
('GT', 'Guatemala', 'Guatemalteco'),
('US', 'Estados Unidos', 'Estadounidense'),
('MX', 'México', 'Mexicano'),
('SV', 'El Salvador', 'Salvadoreño'),
('HN', 'Honduras', 'Hondureño'),
('NI', 'Nicaragua', 'Nicaragüense'),
('CR', 'Costa Rica', 'Costarricense'),
('PA', 'Panamá', 'Panameño');

-- 5.15 Departamentos de Guatemala
INSERT INTO cat_departamento (id_pais, codigo, nombre) VALUES
(1, 'GUAT', 'Guatemala'),
(1, 'ELPR', 'El Progreso'),
(1, 'SAC', 'Sacatepéquez'),
(1, 'CHIM', 'Chimaltenango'),
(1, 'ESC', 'Escuintla'),
(1, 'SMR', 'Santa Rosa'),
(1, 'SOL', 'Sololá'),
(1, 'TOT', 'Totonicapán'),
(1, 'QUET', 'Quetzaltenango'),
(1, 'SUCH', 'Suchitepéquez'),
(1, 'RET', 'Retalhuleu'),
(1, 'SM', 'San Marcos'),
(1, 'HUE', 'Huehuetenango'),
(1, 'QUIC', 'Quiché'),
(1, 'BAJ', 'Baja Verapaz'),
(1, 'AV', 'Alta Verapaz'),
(1, 'PET', 'Petén'),
(1, 'IZA', 'Izabal'),
(1, 'ZAC', 'Zacapa'),
(1, 'CHIQ', 'Chiquimula'),
(1, 'JAL', 'Jalapa'),
(1, 'JUT', 'Jutiapa');

-- 5.16 Habilidades
INSERT INTO cat_habilidad (codigo, nombre) VALUES
('PRIM_AUX', 'Primeros Auxilios'),
('RCP', 'RCP (Reanimación Cardiopulmonar)'),
('NAV', 'Navegación / Orientación'),
('CUERDA', 'Técnicas de Cuerda'),
('COCINA', 'Cocina para Grupos'),
('PREDICA', 'Predicación / Enseñanza'),
('MUSICA', 'Música / Alabanza'),
('LOGISTICA', 'Logística / Organización'),
('FOTO', 'Fotografía / Video'),
('REDES', 'Redes Sociales / Comunicación');

-- 5.17 Equipos Crew
INSERT INTO cat_equipo_crew (codigo, nombre, descripcion) VALUES
('LOG', 'Logística', 'Montaje y desmontaje de campamento'),
('COC', 'Cocina', 'Preparación de alimentos'),
('MED', 'Médico', 'Atención de emergencias'),
('COM', 'Comunicaciones', 'Radio y comunicaciones'),
('ALB', 'Alabanza', 'Música y adoración'),
('INF', 'Infraestructura', 'Carpa, electricidad, agua'),
('REC', 'Recepción', 'Registro y bienvenida'),
('RED', 'Redes Sociales', 'Fotos, videos, transmisiones');


