-- ================================================================
-- CoopeSaaS — Schema completo para Supabase
-- Ejecutar en: SQL Editor → New Query → Run
-- ================================================================

-- ================================================================
-- 0. EXTENSIONES
-- ================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- 0. FUNCIONES AUXILIARES
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 1. TIPOS ENUM
-- ================================================================
CREATE TYPE user_role AS ENUM ('admin', 'consejo', 'operador', 'asociado', 'guest');
CREATE TYPE turno_enum AS ENUM ('matutino', 'vespertino', 'nocturno');
CREATE TYPE empleado_estado AS ENUM ('activo', 'inactivo', 'licencia', 'retirado');
CREATE TYPE nomina_tipo AS ENUM ('salario', 'extras', 'bonificaciones', 'aguinaldo', 'vacaciones');
CREATE TYPE nomina_estado AS ENUM ('pagado', 'pendiente', 'en_proceso');
CREATE TYPE permiso_tipo AS ENUM ('con_goce_salarial', 'sin_goce_salarial', 'cita_medica', 'maternidad', 'paternidad', 'fallecimiento_familiar', 'estudio', 'otro');
CREATE TYPE asociado_categoria AS ENUM ('oro', 'plata', 'bronce', 'especial');
CREATE TYPE asociado_estado AS ENUM ('activo', 'inactivo', 'pendiente', 'suspendido');
CREATE TYPE genero_enum AS ENUM ('masculino', 'femenino', 'no_binario', 'otro');
CREATE TYPE estado_civil_enum AS ENUM ('soltero', 'casado', 'divorciado', 'viudo', 'union_libre');
CREATE TYPE aporte_estado AS ENUM ('al_dia', 'pendiente', 'atrasado');
CREATE TYPE sesion_estado AS ENUM ('programada', 'realizada', 'cancelada');
CREATE TYPE acuerdo_estado AS ENUM ('pendiente', 'en_proceso', 'completado');
CREATE TYPE comite_estado AS ENUM ('activo', 'inactivo', 'disuelto');
CREATE TYPE asamblea_tipo AS ENUM ('ordinaria', 'extraordinaria');
CREATE TYPE asamblea_estado AS ENUM ('programada', 'convocatoria', 'en_curso', 'finalizada', 'cancelada');
CREATE TYPE asamblea_modalidad AS ENUM ('presencial', 'virtual', 'hibrida');
CREATE TYPE propuesta_estado AS ENUM ('pendiente', 'en_discusion', 'aprobada', 'rechazada');
CREATE TYPE postulacion_estado AS ENUM ('pendiente', 'aprobada', 'rechazada', 'elegido');
CREATE TYPE voto_tipo AS ENUM ('lista', 'referendum', 'eleccion');
CREATE TYPE voto_estado AS ENUM ('abierta', 'cerrada', 'anulada');
CREATE TYPE cuenta_tipo AS ENUM ('activo', 'pasivo', 'patrimonio', 'ingreso', 'egreso');
CREATE TYPE cuenta_naturaleza AS ENUM ('deudora', 'acreedora');
CREATE TYPE transaccion_tipo AS ENUM ('ingreso', 'egreso');
CREATE TYPE transaccion_estado AS ENUM ('aprobada', 'pendiente', 'rechazada', 'anulada');
CREATE TYPE presupuesto_estado AS ENUM ('aprobado', 'pendiente', 'rechazado');
CREATE TYPE credito_estado AS ENUM ('activo', 'pagado', 'vencido', 'castigado');
CREATE TYPE solicitud_estado AS ENUM ('en_proceso', 'aprobada', 'rechazada', 'cancelada');
CREATE TYPE desembolso_estado AS ENUM ('desembolsado', 'en_proceso', 'cancelado');
CREATE TYPE pago_estado AS ENUM ('pagado', 'pendiente', 'vencido');
CREATE TYPE mora_estado AS ENUM ('pendiente', 'en_gestion', 'reestructurado', 'resuelto');
CREATE TYPE riesgo_nivel AS ENUM ('alto', 'medio', 'bajo');
CREATE TYPE riesgo_estado AS ENUM ('identificado', 'en_evaluacion', 'mitigado', 'aceptado', 'cerrado');
CREATE TYPE incidente_severidad AS ENUM ('alta', 'media', 'baja');
CREATE TYPE incidente_estado AS ENUM ('abierto', 'en_investigacion', 'resuelto', 'cerrado');
CREATE TYPE plan_estado AS ENUM ('activo', 'en_progreso', 'completado', 'cancelado');

-- ================================================================
-- 2. AUTH Y PERFILES
-- ================================================================
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  full_name     TEXT NOT NULL,
  avatar_url    TEXT,
  role          user_role NOT NULL DEFAULT 'asociado',
  phone         TEXT,
  cedula        TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

CREATE TABLE role_permissions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role        user_role NOT NULL,
  module      TEXT NOT NULL,
  can_create  BOOLEAN NOT NULL DEFAULT false,
  can_read    BOOLEAN NOT NULL DEFAULT true,
  can_update  BOOLEAN NOT NULL DEFAULT false,
  can_delete  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(role, module)
);

-- ================================================================
-- 3. COOPERATIVA Y CONFIGURACIÓN
-- ================================================================
CREATE TABLE cooperativas (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre                TEXT NOT NULL,
  cedula_juridica       TEXT UNIQUE,
  representante_legal   TEXT,
  email_institucional   TEXT,
  telefono              TEXT,
  direccion             TEXT,
  logo_url              TEXT,
  moneda                TEXT NOT NULL DEFAULT 'CRC',
  moneda_simbolo        TEXT NOT NULL DEFAULT '₡',
  timezone              TEXT NOT NULL DEFAULT 'America/Costa_Rica',
  idioma                TEXT NOT NULL DEFAULT 'es',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cooperativa_config (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperativa_id  UUID NOT NULL REFERENCES cooperativas(id) ON DELETE CASCADE,
  config_key      TEXT NOT NULL,
  config_value    JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cooperativa_id, config_key)
);

CREATE TABLE cooperativa_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperativa_id  UUID NOT NULL REFERENCES cooperativas(id) ON DELETE CASCADE,
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role            user_role NOT NULL DEFAULT 'asociado',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cooperativa_id, profile_id)
);

-- ================================================================
-- 4. PERSONAL
-- ================================================================
CREATE TABLE departamentos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperativa_id  UUID NOT NULL REFERENCES cooperativas(id) ON DELETE CASCADE,
  nombre          TEXT NOT NULL,
  descripcion     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cooperativa_id, nombre)
);

CREATE TABLE cargos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperativa_id  UUID NOT NULL REFERENCES cooperativas(id) ON DELETE CASCADE,
  nombre          TEXT NOT NULL,
  departamento_id UUID REFERENCES departamentos(id) ON DELETE SET NULL,
  salario_base    NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cooperativa_id, nombre)
);

CREATE TABLE empleados (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperativa_id    UUID NOT NULL REFERENCES cooperativas(id) ON DELETE CASCADE,
  profile_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  nombre            TEXT NOT NULL,
  cedula            TEXT,
  email             TEXT,
  telefono          TEXT,
  cargo_id          UUID REFERENCES cargos(id) ON DELETE SET NULL,
  departamento_id   UUID REFERENCES departamentos(id) ON DELETE SET NULL,
  turno             turno_enum NOT NULL DEFAULT 'matutino',
  estado            empleado_estado NOT NULL DEFAULT 'activo',
  fecha_ingreso     DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_retiro      DATE,
  salario           NUMERIC(12,2) NOT NULL DEFAULT 0,
  foto_url          TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_empleados_cooperativa ON empleados(cooperativa_id);
CREATE INDEX idx_empleados_estado ON empleados(estado);

CREATE TABLE nominas (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperativa_id  UUID NOT NULL REFERENCES cooperativas(id) ON DELETE CASCADE,
  empleado_id     UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
  tipo            nomina_tipo NOT NULL,
  periodo_inicio  DATE NOT NULL,
  periodo_fin     DATE NOT NULL,
  monto           NUMERIC(12,2) NOT NULL,
  estado          nomina_estado NOT NULL DEFAULT 'pendiente',
  observaciones   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_nominas_cooperativa ON nominas(cooperativa_id);
CREATE INDEX idx_nominas_estado ON nominas(estado);

CREATE TABLE permisos_empleado (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperativa_id  UUID NOT NULL REFERENCES cooperativas(id) ON DELETE CASCADE,
  empleado_id     UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
  tipo            permiso_tipo NOT NULL,
  fecha           DATE NOT NULL,
  horas           NUMERIC(5,2) NOT NULL DEFAULT 8,
  motivo          TEXT,
  evidencia_url   TEXT,
  aprobado_por    UUID REFERENCES profiles(id),
  estado          TEXT NOT NULL DEFAULT 'pendiente',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE capacitaciones (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperativa_id    UUID NOT NULL REFERENCES cooperativas(id) ON DELETE CASCADE,
  titulo            TEXT NOT NULL,
  descripcion       TEXT,
  instructor        TEXT,
  fecha_inicio      DATE NOT NULL,
  fecha_fin         DATE,
  duracion_horas    NUMERIC(5,1),
  participantes_max INTEGER,
  estado            TEXT NOT NULL DEFAULT 'programada',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE capacitacion_empleados (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  capacitacion_id UUID NOT NULL REFERENCES capacitaciones(id) ON DELETE CASCADE,
  empleado_id     UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
  asistio         BOOLEAN NOT NULL DEFAULT false,
  calificacion    NUMERIC(3,1),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(capacitacion_id, empleado_id)
);

-- ================================================================
-- 5. ASOCIADOS
-- ================================================================
CREATE TABLE asociados (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperativa_id      UUID NOT NULL REFERENCES cooperativas(id) ON DELETE CASCADE,
  profile_id          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  num_asociado        TEXT NOT NULL,
  nombre              TEXT NOT NULL,
  cedula              TEXT,
  fecha_nacimiento    DATE,
  genero              genero_enum,
  estado_civil        estado_civil_enum,
  nacionalidad        TEXT DEFAULT 'Costarricense',
  telefono_principal  TEXT,
  telefono_secundario TEXT,
  email               TEXT,
  direccion           TEXT,
  categoria           asociado_categoria NOT NULL DEFAULT 'bronce',
  fecha_ingreso       DATE NOT NULL DEFAULT CURRENT_DATE,
  aporte_mensual      NUMERIC(12,2) NOT NULL DEFAULT 0,
  estado              asociado_estado NOT NULL DEFAULT 'activo',
  foto_url            TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cooperativa_id, num_asociado)
);
CREATE INDEX idx_asociados_cooperativa ON asociados(cooperativa_id);
CREATE INDEX idx_asociados_estado ON asociados(estado);
CREATE INDEX idx_asociados_categoria ON asociados(categoria);

CREATE TABLE asociado_beneficiarios (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asociado_id UUID NOT NULL REFERENCES asociados(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,
  parentesco  TEXT NOT NULL,
  cedula      TEXT,
  fecha_nac   DATE,
  porcentaje  NUMERIC(5,2) NOT NULL DEFAULT 100.00,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE asociado_aportes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asociado_id UUID NOT NULL REFERENCES asociados(id) ON DELETE CASCADE,
  fecha       DATE NOT NULL DEFAULT CURRENT_DATE,
  monto       NUMERIC(12,2) NOT NULL,
  estado      aporte_estado NOT NULL DEFAULT 'al_dia',
  referencia  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_aportes_asociado ON asociado_aportes(asociado_id);

CREATE TABLE asociado_comunicaciones (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asociado_id UUID NOT NULL REFERENCES asociados(id) ON DELETE CASCADE,
  tipo        TEXT NOT NULL,
  asunto      TEXT NOT NULL,
  contenido   TEXT,
  fecha       TIMESTAMPTZ NOT NULL DEFAULT now(),
  leido       BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================================
-- 6. ÓRGANOS SOCIALES
-- ================================================================
CREATE TABLE organos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperativa_id  UUID NOT NULL REFERENCES cooperativas(id) ON DELETE CASCADE,
  nombre          TEXT NOT NULL,
  descripcion     TEXT,
  periodo         TEXT,
  es_activo       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cooperativa_id, nombre)
);

CREATE TABLE organo_miembros (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organo_id     UUID NOT NULL REFERENCES organos(id) ON DELETE CASCADE,
  asociado_id   UUID NOT NULL REFERENCES asociados(id) ON DELETE CASCADE,
  cargo         TEXT NOT NULL,
  fecha_inicio  DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin     DATE,
  es_activo     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organo_id, asociado_id)
);

CREATE TABLE organo_sesiones (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organo_id   UUID NOT NULL REFERENCES organos(id) ON DELETE CASCADE,
  fecha       DATE NOT NULL,
  hora        TIME,
  lugar       TEXT,
  tema        TEXT NOT NULL,
  tipo        TEXT NOT NULL DEFAULT 'ordinaria',
  estado      sesion_estado NOT NULL DEFAULT 'programada',
  acta_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sesiones_organo ON organo_sesiones(organo_id);

CREATE TABLE sesion_asistencia (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sesion_id     UUID NOT NULL REFERENCES organo_sesiones(id) ON DELETE CASCADE,
  miembro_id    UUID NOT NULL REFERENCES organo_miembros(id) ON DELETE CASCADE,
  asistio       BOOLEAN NOT NULL DEFAULT false,
  justificacion TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(sesion_id, miembro_id)
);

CREATE TABLE sesion_acuerdos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sesion_id       UUID NOT NULL REFERENCES organo_sesiones(id) ON DELETE CASCADE,
  texto           TEXT NOT NULL,
  responsable_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  fecha_limite    DATE,
  estado          acuerdo_estado NOT NULL DEFAULT 'pendiente',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================================
-- 7. COMITÉS
-- ================================================================
CREATE TABLE comites (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperativa_id    UUID NOT NULL REFERENCES cooperativas(id) ON DELETE CASCADE,
  nombre            TEXT NOT NULL,
  objetivo          TEXT,
  presidente_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ultima_reunion    DATE,
  proxima_reunion   DATE,
  estado            comite_estado NOT NULL DEFAULT 'activo',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cooperativa_id, nombre)
);

CREATE TABLE comite_miembros (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comite_id     UUID NOT NULL REFERENCES comites(id) ON DELETE CASCADE,
  asociado_id   UUID NOT NULL REFERENCES asociados(id) ON DELETE CASCADE,
  rol           TEXT NOT NULL DEFAULT 'miembro',
  fecha_inicio  DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin     DATE,
  es_activo     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(comite_id, asociado_id)
);

CREATE TABLE comite_reuniones (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comite_id   UUID NOT NULL REFERENCES comites(id) ON DELETE CASCADE,
  fecha       DATE NOT NULL,
  hora        TIME,
  tipo        TEXT NOT NULL DEFAULT 'ordinaria',
  tema        TEXT NOT NULL,
  lugar       TEXT,
  estado      sesion_estado NOT NULL DEFAULT 'programada',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE comite_reunion_asistencia (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reunion_id  UUID NOT NULL REFERENCES comite_reuniones(id) ON DELETE CASCADE,
  miembro_id  UUID NOT NULL REFERENCES comite_miembros(id) ON DELETE CASCADE,
  asistio     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(reunion_id, miembro_id)
);

CREATE TABLE comite_reunion_acuerdos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reunion_id      UUID NOT NULL REFERENCES comite_reuniones(id) ON DELETE CASCADE,
  texto           TEXT NOT NULL,
  responsable_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  fecha_limite    DATE,
  estado          acuerdo_estado NOT NULL DEFAULT 'pendiente',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================================
-- 8. ASAMBLEAS
-- ================================================================
CREATE TABLE asambleas (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperativa_id  UUID NOT NULL REFERENCES cooperativas(id) ON DELETE CASCADE,
  nombre          TEXT NOT NULL,
  tipo            asamblea_tipo NOT NULL DEFAULT 'ordinaria',
  estado          asamblea_estado NOT NULL DEFAULT 'programada',
  modalidad       asamblea_modalidad NOT NULL DEFAULT 'presencial',
  fecha           DATE NOT NULL,
  hora            TIME,
  lugar           TEXT,
  descripcion     TEXT,
  paso_wizard     INTEGER NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_asambleas_cooperativa ON asambleas(cooperativa_id);

CREATE TABLE asamblea_invitados (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asamblea_id UUID NOT NULL REFERENCES asambleas(id) ON DELETE CASCADE,
  asociado_id UUID NOT NULL REFERENCES asociados(id) ON DELETE CASCADE,
  invitado    BOOLEAN NOT NULL DEFAULT true,
  asistio     BOOLEAN NOT NULL DEFAULT false,
  modalidad   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(asamblea_id, asociado_id)
);

CREATE TABLE asamblea_propuestas (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asamblea_id     UUID NOT NULL REFERENCES asambleas(id) ON DELETE CASCADE,
  titulo          TEXT NOT NULL,
  descripcion     TEXT,
  autor_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  estado          propuesta_estado NOT NULL DEFAULT 'pendiente',
  votos_a_favor   INTEGER NOT NULL DEFAULT 0,
  votos_en_contra INTEGER NOT NULL DEFAULT 0,
  abstenciones    INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE asamblea_postulaciones (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asamblea_id UUID NOT NULL REFERENCES asambleas(id) ON DELETE CASCADE,
  asociado_id UUID NOT NULL REFERENCES asociados(id) ON DELETE CASCADE,
  cargo       TEXT NOT NULL,
  foto_url    TEXT,
  propuestas  JSONB DEFAULT '[]',
  estado      postulacion_estado NOT NULL DEFAULT 'pendiente',
  votos       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================================
-- 9. VOTACIONES
-- ================================================================
CREATE TABLE votaciones (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asamblea_id   UUID NOT NULL REFERENCES asambleas(id) ON DELETE CASCADE,
  titulo        TEXT NOT NULL,
  descripcion   TEXT,
  tipo          voto_tipo NOT NULL DEFAULT 'lista',
  estado        voto_estado NOT NULL DEFAULT 'abierta',
  fecha_inicio  TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_fin     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_votaciones_asamblea ON votaciones(asamblea_id);

CREATE TABLE votacion_opciones (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  votacion_id UUID NOT NULL REFERENCES votaciones(id) ON DELETE CASCADE,
  texto       TEXT NOT NULL,
  orden       INTEGER NOT NULL DEFAULT 0,
  votos       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE votacion_votos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  votacion_id UUID NOT NULL REFERENCES votaciones(id) ON DELETE CASCADE,
  asociado_id UUID NOT NULL REFERENCES asociados(id) ON DELETE CASCADE,
  opcion_id   UUID REFERENCES votacion_opciones(id) ON DELETE SET NULL,
  fecha       TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_hash     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(votacion_id, asociado_id)
);

-- ================================================================
-- 10. FINANZAS
-- ================================================================
CREATE TABLE cuentas_contables (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperativa_id  UUID NOT NULL REFERENCES cooperativas(id) ON DELETE CASCADE,
  codigo          TEXT NOT NULL,
  nombre          TEXT NOT NULL,
  tipo            cuenta_tipo NOT NULL,
  naturaleza      cuenta_naturaleza NOT NULL,
  saldo_actual    NUMERIC(14,2) NOT NULL DEFAULT 0,
  es_activa       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cooperativa_id, codigo)
);
CREATE INDEX idx_cuentas_cooperativa ON cuentas_contables(cooperativa_id);

CREATE TABLE cuentas_bancarias (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperativa_id    UUID NOT NULL REFERENCES cooperativas(id) ON DELETE CASCADE,
  nombre            TEXT NOT NULL,
  banco             TEXT NOT NULL,
  tipo              TEXT NOT NULL,
  numero_cuenta     TEXT,
  saldo_contable    NUMERIC(14,2) NOT NULL DEFAULT 0,
  saldo_banco       NUMERIC(14,2) NOT NULL DEFAULT 0,
  moneda            TEXT NOT NULL DEFAULT 'CRC',
  es_activa         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cooperativa_id, numero_cuenta)
);

CREATE TABLE transacciones (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperativa_id     UUID NOT NULL REFERENCES cooperativas(id) ON DELETE CASCADE,
  cuenta_id          UUID REFERENCES cuentas_bancarias(id) ON DELETE SET NULL,
  cuenta_contable_id UUID REFERENCES cuentas_contables(id) ON DELETE SET NULL,
  fecha              DATE NOT NULL DEFAULT CURRENT_DATE,
  descripcion        TEXT NOT NULL,
  categoria          TEXT NOT NULL,
  tipo               transaccion_tipo NOT NULL,
  monto              NUMERIC(14,2) NOT NULL,
  estado             transaccion_estado NOT NULL DEFAULT 'pendiente',
  referencia         TEXT,
  numero_comprobante TEXT,
  aprobado_por       UUID REFERENCES profiles(id),
  created_by         UUID REFERENCES profiles(id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_transacciones_cooperativa ON transacciones(cooperativa_id);
CREATE INDEX idx_transacciones_fecha ON transacciones(fecha);
CREATE INDEX idx_transacciones_estado ON transacciones(estado);
CREATE INDEX idx_transacciones_tipo ON transacciones(tipo);

CREATE TABLE presupuestos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperativa_id  UUID NOT NULL REFERENCES cooperativas(id) ON DELETE CASCADE,
  anio            INTEGER NOT NULL,
  trimestre       INTEGER,
  nombre          TEXT,
  estado          presupuesto_estado NOT NULL DEFAULT 'pendiente',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cooperativa_id, anio, trimestre)
);

CREATE TABLE presupuesto_partidas (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  presupuesto_id      UUID NOT NULL REFERENCES presupuestos(id) ON DELETE CASCADE,
  categoria           TEXT NOT NULL,
  cuenta_contable_id  UUID REFERENCES cuentas_contables(id) ON DELETE SET NULL,
  monto_presupuestado NUMERIC(14,2) NOT NULL DEFAULT 0,
  monto_ejecutado     NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_partidas_presupuesto ON presupuesto_partidas(presupuesto_id);

CREATE TABLE conciliaciones (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperativa_id     UUID NOT NULL REFERENCES cooperativas(id) ON DELETE CASCADE,
  cuenta_bancaria_id UUID NOT NULL REFERENCES cuentas_bancarias(id) ON DELETE CASCADE,
  fecha              DATE NOT NULL DEFAULT CURRENT_DATE,
  saldo_contable     NUMERIC(14,2) NOT NULL,
  saldo_banco        NUMERIC(14,2) NOT NULL,
  diferencia         NUMERIC(14,2) GENERATED ALWAYS AS (saldo_banco - saldo_contable) STORED,
  observaciones      TEXT,
  reconciliado       BOOLEAN NOT NULL DEFAULT false,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_conciliaciones_cooperativa ON conciliaciones(cooperativa_id);

-- ================================================================
-- 11. CRÉDITOS
-- ================================================================
CREATE TABLE tipos_credito (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperativa_id    UUID NOT NULL REFERENCES cooperativas(id) ON DELETE CASCADE,
  nombre            TEXT NOT NULL,
  descripcion       TEXT,
  tasa_anual        NUMERIC(6,2) NOT NULL,
  plazo_max_meses   INTEGER NOT NULL,
  monto_minimo      NUMERIC(14,2) NOT NULL DEFAULT 0,
  monto_maximo      NUMERIC(14,2) NOT NULL,
  requiere_garantia BOOLEAN NOT NULL DEFAULT false,
  estado            TEXT NOT NULL DEFAULT 'activo',
  requisitos        JSONB DEFAULT '[]',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cooperativa_id, nombre)
);

CREATE TABLE creditos (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperativa_id    UUID NOT NULL REFERENCES cooperativas(id) ON DELETE CASCADE,
  asociado_id       UUID NOT NULL REFERENCES asociados(id) ON DELETE CASCADE,
  tipo_credito_id   UUID NOT NULL REFERENCES tipos_credito(id) ON DELETE RESTRICT,
  numero            TEXT NOT NULL,
  monto_original    NUMERIC(14,2) NOT NULL,
  tasa_anual        NUMERIC(6,2) NOT NULL,
  plazo_meses       INTEGER NOT NULL,
  cuota_mensual     NUMERIC(14,2) NOT NULL,
  saldo_capital     NUMERIC(14,2) NOT NULL,
  estado            credito_estado NOT NULL DEFAULT 'activo',
  fecha_desembolso  DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE NOT NULL,
  destino           TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_creditos_cooperativa ON creditos(cooperativa_id);
CREATE INDEX idx_creditos_asociado ON creditos(asociado_id);
CREATE INDEX idx_creditos_estado ON creditos(estado);

CREATE TABLE solicitudes_credito (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperativa_id    UUID NOT NULL REFERENCES cooperativas(id) ON DELETE CASCADE,
  asociado_id       UUID NOT NULL REFERENCES asociados(id) ON DELETE CASCADE,
  tipo_credito_id   UUID NOT NULL REFERENCES tipos_credito(id) ON DELETE RESTRICT,
  numero            TEXT NOT NULL,
  monto_solicitado  NUMERIC(14,2) NOT NULL,
  plazo_meses       INTEGER NOT NULL,
  tasa              NUMERIC(6,2),
  cuota_estimada    NUMERIC(14,2),
  destino           TEXT,
  estado            solicitud_estado NOT NULL DEFAULT 'en_proceso',
  asesor_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  motivo_rechazo    TEXT,
  documentos        JSONB DEFAULT '[]',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_solicitudes_cooperativa ON solicitudes_credito(cooperativa_id);
CREATE INDEX idx_solicitudes_estado ON solicitudes_credito(estado);

CREATE TABLE evaluaciones_credito (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solicitud_id       UUID NOT NULL REFERENCES solicitudes_credito(id) ON DELETE CASCADE,
  evaluador_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ingresos_mensuales NUMERIC(14,2),
  gastos_mensuales   NUMERIC(14,2),
  score_crediticio   INTEGER,
  endeudamiento_pct  NUMERIC(5,2),
  garante_nombre     TEXT,
  garante_cedula     TEXT,
  observaciones      TEXT,
  recomendacion      TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE garantias_credito (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solicitud_id    UUID NOT NULL REFERENCES solicitudes_credito(id) ON DELETE CASCADE,
  tipo            TEXT NOT NULL,
  descripcion     TEXT,
  valor_estimado  NUMERIC(14,2),
  documentos      JSONB DEFAULT '[]',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE desembolsos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  credito_id    UUID NOT NULL REFERENCES creditos(id) ON DELETE CASCADE,
  solicitud_id  UUID REFERENCES solicitudes_credito(id) ON DELETE SET NULL,
  monto         NUMERIC(14,2) NOT NULL,
  fecha         DATE NOT NULL DEFAULT CURRENT_DATE,
  metodo        TEXT NOT NULL,
  referencia    TEXT,
  estado        desembolso_estado NOT NULL DEFAULT 'en_proceso',
  aprobado_por  UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_desembolsos_credito ON desembolsos(credito_id);

CREATE TABLE pagos_credito (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  credito_id     UUID NOT NULL REFERENCES creditos(id) ON DELETE CASCADE,
  numero_cuota   INTEGER NOT NULL,
  fecha_pago     DATE,
  monto_total    NUMERIC(14,2) NOT NULL,
  capital        NUMERIC(14,2) NOT NULL,
  interes        NUMERIC(14,2) NOT NULL,
  saldo_restante NUMERIC(14,2) NOT NULL,
  estado         pago_estado NOT NULL DEFAULT 'pendiente',
  metodo_pago    TEXT,
  referencia     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pagos_credito ON pagos_credito(credito_id);
CREATE INDEX idx_pagos_estado ON pagos_credito(estado);

CREATE TABLE mora (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  credito_id        UUID NOT NULL REFERENCES creditos(id) ON DELETE CASCADE,
  monto_vencido     NUMERIC(14,2) NOT NULL,
  dias_mora         INTEGER NOT NULL DEFAULT 0,
  cuotas_vencidas   INTEGER NOT NULL DEFAULT 1,
  telefono_contacto TEXT,
  ultima_gestion    TEXT,
  proxima_gestion   DATE,
  observaciones     TEXT,
  estado            mora_estado NOT NULL DEFAULT 'pendiente',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_mora_credito ON mora(credito_id);
CREATE INDEX idx_mora_estado ON mora(estado);

-- ================================================================
-- 12. RIESGOS
-- ================================================================
CREATE TABLE riesgos (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperativa_id        UUID NOT NULL REFERENCES cooperativas(id) ON DELETE CASCADE,
  nombre                TEXT NOT NULL,
  descripcion           TEXT,
  categoria             TEXT NOT NULL,
  probabilidad          INTEGER NOT NULL CHECK (probabilidad BETWEEN 1 AND 5),
  impacto               INTEGER NOT NULL CHECK (impacto BETWEEN 1 AND 5),
  nivel                 riesgo_nivel NOT NULL DEFAULT 'medio',
  responsable_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  estado                riesgo_estado NOT NULL DEFAULT 'identificado',
  fecha_identificacion  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_riesgos_cooperativa ON riesgos(cooperativa_id);
CREATE INDEX idx_riesgos_nivel ON riesgos(nivel);

CREATE TABLE incidentes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperativa_id   UUID NOT NULL REFERENCES cooperativas(id) ON DELETE CASCADE,
  riesgo_id        UUID REFERENCES riesgos(id) ON DELETE SET NULL,
  descripcion      TEXT NOT NULL,
  severidad        incidente_severidad NOT NULL DEFAULT 'media',
  fecha            TIMESTAMPTZ NOT NULL DEFAULT now(),
  reportado_por    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  accion_inmediata TEXT,
  afectados        JSONB DEFAULT '[]',
  estado           incidente_estado NOT NULL DEFAULT 'abierto',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_incidentes_cooperativa ON incidentes(cooperativa_id);
CREATE INDEX idx_incidentes_estado ON incidentes(estado);

CREATE TABLE planes_mitigacion (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  riesgo_id       UUID NOT NULL REFERENCES riesgos(id) ON DELETE CASCADE,
  nombre          TEXT NOT NULL,
  descripcion     TEXT,
  responsable_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  fecha_inicio    DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin       DATE,
  progreso        INTEGER NOT NULL DEFAULT 0 CHECK (progreso BETWEEN 0 AND 100),
  estado          plan_estado NOT NULL DEFAULT 'activo',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_planes_riesgo ON planes_mitigacion(riesgo_id);

CREATE TABLE plan_acciones (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id         UUID NOT NULL REFERENCES planes_mitigacion(id) ON DELETE CASCADE,
  descripcion     TEXT NOT NULL,
  responsable_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  fecha_limite    DATE,
  completada      BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================================
-- 13. REPORTES Y COTIZACIONES
-- ================================================================
CREATE TABLE reportes_guardados (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperativa_id  UUID NOT NULL REFERENCES cooperativas(id) ON DELETE CASCADE,
  creado_por      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  titulo          TEXT NOT NULL,
  tipo            TEXT NOT NULL,
  periodo         TEXT,
  filtros         JSONB DEFAULT '{}',
  datos           JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reportes_cooperativa ON reportes_guardados(cooperativa_id);

CREATE TABLE cotizaciones (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperativa_id        UUID NOT NULL REFERENCES cooperativas(id) ON DELETE CASCADE,
  numero                TEXT NOT NULL,
  cliente_nombre        TEXT,
  cliente_cedula        TEXT,
  cliente_email         TEXT,
  cliente_telefono      TEXT,
  cliente_representante TEXT,
  modulos               JSONB NOT NULL DEFAULT '[]',
  costo_total           NUMERIC(14,2) NOT NULL,
  costo_mensual         NUMERIC(14,2) NOT NULL,
  semanas_total         INTEGER NOT NULL,
  descuento_pct         NUMERIC(5,2) NOT NULL DEFAULT 0,
  codigo_descuento      TEXT,
  moneda                TEXT NOT NULL DEFAULT 'CRC',
  valido_hasta          DATE,
  creado_por            UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================================
-- 14. BITÁCORA / AUDITORÍA
-- ================================================================
CREATE TABLE audit_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperativa_id  UUID REFERENCES cooperativas(id) ON DELETE SET NULL,
  user_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  tabla           TEXT NOT NULL,
  accion          TEXT NOT NULL,
  registro_id     UUID,
  datos_anteriores JSONB,
  datos_nuevos    JSONB,
  ip_address      TEXT,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_cooperativa ON audit_log(cooperativa_id);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_tabla ON audit_log(tabla);
CREATE INDEX idx_audit_fecha ON audit_log(created_at);

-- ================================================================
-- 15. HABILITAR RLS EN TODAS LAS TABLAS
-- ================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperativas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperativa_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperativa_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE nominas ENABLE ROW LEVEL SECURITY;
ALTER TABLE permisos_empleado ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacitaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacitacion_empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE asociados ENABLE ROW LEVEL SECURITY;
ALTER TABLE asociado_beneficiarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE asociado_aportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE asociado_comunicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE organos ENABLE ROW LEVEL SECURITY;
ALTER TABLE organo_miembros ENABLE ROW LEVEL SECURITY;
ALTER TABLE organo_sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesion_asistencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesion_acuerdos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comites ENABLE ROW LEVEL SECURITY;
ALTER TABLE comite_miembros ENABLE ROW LEVEL SECURITY;
ALTER TABLE comite_reuniones ENABLE ROW LEVEL SECURITY;
ALTER TABLE comite_reunion_asistencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE comite_reunion_acuerdos ENABLE ROW LEVEL SECURITY;
ALTER TABLE asambleas ENABLE ROW LEVEL SECURITY;
ALTER TABLE asamblea_invitados ENABLE ROW LEVEL SECURITY;
ALTER TABLE asamblea_propuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE asamblea_postulaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE votaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE votacion_opciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE votacion_votos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuentas_contables ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuentas_bancarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuesto_partidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE conciliaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_credito ENABLE ROW LEVEL SECURITY;
ALTER TABLE creditos ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_credito ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones_credito ENABLE ROW LEVEL SECURITY;
ALTER TABLE garantias_credito ENABLE ROW LEVEL SECURITY;
ALTER TABLE desembolsos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos_credito ENABLE ROW LEVEL SECURITY;
ALTER TABLE mora ENABLE ROW LEVEL SECURITY;
ALTER TABLE riesgos ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes_mitigacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_acciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_guardados ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- 16. FUNCIONES AUXILIARES PARA RLS
-- ================================================================
CREATE OR REPLACE FUNCTION public.user_cooperativa_id()
RETURNS UUID AS $$
  SELECT cm.cooperativa_id
  FROM cooperativa_members cm
  WHERE cm.profile_id = auth.uid()
    AND cm.is_active = true
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.user_role()
RETURNS user_role AS $$
  SELECT p.role FROM profiles p WHERE p.id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin_or_consejo()
RETURNS BOOLEAN AS $$
  SELECT public.user_role() IN ('admin', 'consejo');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ================================================================
-- 17. POLÍTICAS RLS
-- ================================================================

-- PROFILES
CREATE POLICY " Usuarios ven su propio perfil"
  ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY " Miembros ven perfiles de su cooperativa"
  ON profiles FOR SELECT
  USING (id IN (SELECT cm.profile_id FROM cooperativa_members cm WHERE cm.cooperativa_id = public.user_cooperativa_id()));
CREATE POLICY " Usuarios pueden actualizar su propio perfil"
  ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY " Admin puede actualizar perfiles"
  ON profiles FOR UPDATE USING (public.is_admin_or_consejo());

-- COOPERATIVA_MEMBERS
CREATE POLICY " Miembros ven su cooperativa"
  ON cooperativa_members FOR SELECT USING (cooperativa_id = public.user_cooperativa_id());
CREATE POLICY " Admin gestiona miembros"
  ON cooperativa_members FOR ALL USING (public.is_admin_or_consejo() AND cooperativa_id = public.user_cooperativa_id());

-- COOPERATIVAS
CREATE POLICY " Miembros ven su cooperativa"
  ON cooperativas FOR SELECT USING (id = public.user_cooperativa_id());
CREATE POLICY " Admin actualiza su cooperativa"
  ON cooperativas FOR UPDATE USING (public.is_admin_or_consejo() AND id = public.user_cooperativa_id());

-- EMPLEADOS
CREATE POLICY " Leer empleados de mi cooperativa"
  ON empleados FOR SELECT USING (cooperativa_id = public.user_cooperativa_id());
CREATE POLICY " Admin gestiona empleados"
  ON empleados FOR ALL USING (public.is_admin_or_consejo() AND cooperativa_id = public.user_cooperativa_id());

-- ASOCIADOS
CREATE POLICY " Leer asociados de mi cooperativa"
  ON asociados FOR SELECT USING (cooperativa_id = public.user_cooperativa_id());
CREATE POLICY " Admin gestiona asociados"
  ON asociados FOR ALL USING (public.is_admin_or_consejo() AND cooperativa_id = public.user_cooperativa_id());

-- TRANSACCIONES
CREATE POLICY " Leer transacciones de mi cooperativa"
  ON transacciones FOR SELECT USING (cooperativa_id = public.user_cooperativa_id());
CREATE POLICY " Admin y operador gestionan transacciones"
  ON transacciones FOR ALL USING (public.user_role() IN ('admin', 'consejo', 'operador') AND cooperativa_id = public.user_cooperativa_id());

-- CRÉDITOS
CREATE POLICY " Leer créditos de mi cooperativa"
  ON creditos FOR SELECT USING (cooperativa_id = public.user_cooperativa_id());
CREATE POLICY " Admin y operador gestionan créditos"
  ON creditos FOR ALL USING (public.user_role() IN ('admin', 'consejo', 'operador') AND cooperativa_id = public.user_cooperativa_id());
CREATE POLICY " Asociado ve sus propios créditos"
  ON creditos FOR SELECT USING (asociado_id IN (SELECT a.id FROM asociados a WHERE a.profile_id = auth.uid()));

-- ORGANOS
CREATE POLICY " Leer órganos de mi cooperativa"
  ON organos FOR SELECT USING (cooperativa_id = public.user_cooperativa_id());
CREATE POLICY " Admin gestiona órganos"
  ON organos FOR ALL USING (public.is_admin_or_consejo() AND cooperativa_id = public.user_cooperativa_id());

-- COMITÉS
CREATE POLICY " Leer comités de mi cooperativa"
  ON comites FOR SELECT USING (cooperativa_id = public.user_cooperativa_id());
CREATE POLICY " Admin gestiona comités"
  ON comites FOR ALL USING (public.is_admin_or_consejo() AND cooperativa_id = public.user_cooperativa_id());

-- ASAMBLEAS
CREATE POLICY " Leer asambleas de mi cooperativa"
  ON asambleas FOR SELECT USING (cooperativa_id = public.user_cooperativa_id());
CREATE POLICY " Admin gestiona asambleas"
  ON asambleas FOR ALL USING (public.is_admin_or_consejo() AND cooperativa_id = public.user_cooperativa_id());

-- VOTACIONES
CREATE POLICY " Leer votaciones de mi cooperativa"
  ON votaciones FOR SELECT USING (asamblea_id IN (SELECT a.id FROM asambleas a WHERE a.cooperativa_id = public.user_cooperativa_id()));
CREATE POLICY " Admin gestiona votaciones"
  ON votaciones FOR ALL USING (public.is_admin_or_consejo());

-- RIESGOS
CREATE POLICY " Leer riesgos de mi cooperativa"
  ON riesgos FOR SELECT USING (cooperativa_id = public.user_cooperativa_id());
CREATE POLICY " Admin y operador gestionan riesgos"
  ON riesgos FOR ALL USING (public.user_role() IN ('admin', 'consejo', 'operador') AND cooperativa_id = public.user_cooperativa_id());

-- AUDIT_LOG
CREATE POLICY " Solo admin lee auditoría"
  ON audit_log FOR SELECT USING (public.is_admin_or_consejo() AND cooperativa_id = public.user_cooperativa_id());

-- ROLE_PERMISSIONS
CREATE POLICY " Leer permisos de rol"
  ON role_permissions FOR SELECT USING (true);
CREATE POLICY " Admin gestiona permisos"
  ON role_permissions FOR ALL USING (public.is_admin_or_consejo());

-- Políticas genéricas para tablas restantes (cooperativa_id match)
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'departamentos', 'cargos', 'nominas', 'permisos_empleado',
    'capacitaciones', 'capacitacion_empleados', 'asociado_beneficiarios',
    'asociado_aportes', 'asociado_comunicaciones', 'organo_miembros',
    'organo_sesiones', 'sesion_asistencia', 'sesion_acuerdos',
    'comite_miembros', 'comite_reuniones', 'comite_reunion_asistencia',
    'comite_reunion_acuerdos', 'asamblea_invitados', 'asamblea_propuestas',
    'asamblea_postulaciones', 'votacion_opciones', 'votacion_votos',
    'cuentas_contables', 'cuentas_bancarias', 'presupuestos',
    'presupuesto_partidas', 'conciliaciones', 'tipos_credito',
    'solicitudes_credito', 'evaluaciones_credito', 'garantias_credito',
    'desembolsos', 'pagos_credito', 'mora', 'incidentes',
    'planes_mitigacion', 'plan_acciones', 'reportes_guardados',
    'cotizaciones', 'cooperativa_config'
  ])
  LOOP
    EXECUTE format(
      'CREATE POLICY "rls_select_%s" ON %I FOR SELECT USING (cooperativa_id = public.user_cooperativa_id())',
      t, t
    );
    EXECUTE format(
      'CREATE POLICY "rls_all_%s" ON %I FOR ALL USING (public.is_admin_or_consejo() AND cooperativa_id = public.user_cooperativa_id())',
      t, t
    );
  END LOOP;
END;
$$;

-- ================================================================
-- 18. TRIGGERS
-- ================================================================

-- updated_at en todas las tablas
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'profiles', 'cooperativas', 'cooperativa_config', 'cooperativa_members',
    'departamentos', 'cargos', 'empleados', 'nominas', 'permisos_empleado',
    'capacitaciones', 'asociados', 'asociado_beneficiarios', 'asociado_aportes',
    'asociado_comunicaciones', 'organos', 'organo_miembros', 'organo_sesiones',
    'sesion_acuerdos', 'comites', 'comite_miembros', 'comite_reuniones',
    'comite_reunion_acuerdos', 'asambleas', 'asamblea_propuestas',
    'asamblea_postulaciones', 'votaciones', 'votacion_opciones',
    'cuentas_contables', 'cuentas_bancarias', 'transacciones',
    'presupuestos', 'presupuesto_partidas', 'conciliaciones',
    'tipos_credito', 'creditos', 'solicitudes_credito', 'evaluaciones_credito',
    'garantias_credito', 'desembolsos', 'pagos_credito', 'mora',
    'riesgos', 'incidentes', 'planes_mitigacion', 'plan_acciones',
    'reportes_guardados', 'cotizaciones'
  ])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t
    );
  END LOOP;
END;
$$;

-- Auto-crear profile al registrar en auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Actualizar saldo de cuenta al aprobar transacción
CREATE OR REPLACE FUNCTION actualizar_saldo_transaccion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'aprobada' AND (OLD IS NULL OR OLD.estado != 'aprobada') THEN
    IF NEW.cuenta_id IS NOT NULL THEN
      UPDATE cuentas_bancarias SET saldo_contable = saldo_contable +
        CASE WHEN NEW.tipo = 'ingreso' THEN NEW.monto ELSE -NEW.monto END
      WHERE id = NEW.cuenta_id;
    END IF;
    IF NEW.cuenta_contable_id IS NOT NULL THEN
      UPDATE cuentas_contables SET saldo_actual = saldo_actual +
        CASE WHEN NEW.tipo = 'ingreso' THEN NEW.monto ELSE -NEW.monto END
      WHERE id = NEW.cuenta_contable_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trgActualizarSaldoTransaccion
  AFTER INSERT OR UPDATE ON transacciones
  FOR EACH ROW EXECUTE FUNCTION actualizar_saldo_transaccion();

-- Recalcular mora cuando crédito se vence
CREATE OR REPLACE FUNCTION recalcular_mora()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'vencido' AND (OLD IS NULL OR OLD.estado != 'vencido') THEN
    INSERT INTO mora (credito_id, monto_vencido, dias_mora, cuotas_vencidas, estado)
    SELECT NEW.id, NEW.saldo_capital,
      GREATEST(0, EXTRACT(DAY FROM now() - NEW.fecha_vencimiento)::INTEGER),
      (SELECT COUNT(*) FROM pagos_credito WHERE credito_id = NEW.id AND estado = 'vencido'),
      'pendiente'
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recalcular saldo capital al registrar pago
CREATE OR REPLACE FUNCTION recalcular_saldo_pago()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'pagado' AND (OLD IS NULL OR OLD.estado != 'pagado') THEN
    UPDATE creditos SET saldo_capital = saldo_capital - NEW.capital WHERE id = NEW.credito_id;
    UPDATE creditos SET estado = 'pagado' WHERE id = NEW.credito_id AND saldo_capital <= 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trgRecalcularSaldoPago
  AFTER INSERT OR UPDATE ON pagos_credito
  FOR EACH ROW EXECUTE FUNCTION recalcular_saldo_pago();

-- Número automático de solicitud de crédito
CREATE OR REPLACE FUNCTION generar_numero_solicitud()
RETURNS TRIGGER AS $$
DECLARE next_num INTEGER;
BEGIN
  IF NEW.numero IS NULL OR NEW.numero = '' THEN
    SELECT COALESCE(MAX(CAST(REPLACE(numero, 'SOL-', '') AS INTEGER)), 0) + 1 INTO next_num
    FROM solicitudes_credito WHERE cooperativa_id = NEW.cooperativa_id;
    NEW.numero := 'SOL-' || LPAD(next_num::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trgGenerarNumeroSolicitud
  BEFORE INSERT ON solicitudes_credito
  FOR EACH ROW EXECUTE FUNCTION generar_numero_solicitud();

-- Número automático de crédito
CREATE OR REPLACE FUNCTION generar_numero_credito()
RETURNS TRIGGER AS $$
DECLARE next_num INTEGER;
BEGIN
  IF NEW.numero IS NULL OR NEW.numero = '' THEN
    SELECT COALESCE(MAX(CAST(REPLACE(numero, 'CRE-', '') AS INTEGER)), 0) + 1 INTO next_num
    FROM creditos WHERE cooperativa_id = NEW.cooperativa_id;
    NEW.numero := 'CRE-' || LPAD(next_num::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trgGenerarNumeroCredito
  BEFORE INSERT ON creditos
  FOR EACH ROW EXECUTE FUNCTION generar_numero_credito();

-- ================================================================
-- 19. SEED DATA
-- ================================================================

-- Cooperativa demo
INSERT INTO cooperativas (id, nombre, cedula_juridica, email_institucional, telefono)
VALUES ('00000000-0000-0000-0000-000000000001', 'CoopeSaaS Demo', '3-004-123456', 'contacto@coopesaas.cr', '2222-3333');

-- Permisos por rol
INSERT INTO role_permissions (role, module, can_create, can_read, can_update, can_delete) VALUES
('admin', 'personal', true, true, true, true),
('admin', 'asociados', true, true, true, true),
('admin', 'organos', true, true, true, true),
('admin', 'comites', true, true, true, true),
('admin', 'asambleas', true, true, true, true),
('admin', 'votaciones', true, true, true, true),
('admin', 'finanzas', true, true, true, true),
('admin', 'creditos', true, true, true, true),
('admin', 'riesgos', true, true, true, true),
('admin', 'reportes', true, true, true, true),
('admin', 'configuracion', true, true, true, true),
('consejo', 'personal', false, true, false, false),
('consejo', 'asociados', true, true, true, false),
('consejo', 'organos', true, true, true, false),
('consejo', 'comites', true, true, true, false),
('consejo', 'asambleas', true, true, true, false),
('consejo', 'votaciones', true, true, true, false),
('consejo', 'finanzas', false, true, false, false),
('consejo', 'creditos', false, true, false, false),
('consejo', 'riesgos', false, true, false, false),
('consejo', 'reportes', false, true, false, false),
('consejo', 'configuracion', false, true, false, false),
('operador', 'personal', false, true, true, false),
('operador', 'asociados', true, true, true, false),
('operador', 'organos', false, true, false, false),
('operador', 'comites', false, true, false, false),
('operador', 'asambleas', false, true, false, false),
('operador', 'votaciones', false, true, false, false),
('operador', 'finanzas', true, true, true, false),
('operador', 'creditos', true, true, true, false),
('operador', 'riesgos', true, true, true, false),
('operador', 'reportes', false, true, false, false),
('asociado', 'personal', false, false, false, false),
('asociado', 'asociados', false, true, false, false),
('asociado', 'organos', false, true, false, false),
('asociado', 'comites', false, true, false, false),
('asociado', 'asambleas', false, true, false, false),
('asociado', 'votaciones', true, true, false, false),
('asociado', 'finanzas', false, false, false, false),
('asociado', 'creditos', true, true, false, false),
('asociado', 'riesgos', false, false, false, false),
('asociado', 'reportes', false, false, false, false);

-- Cuentas contables demo
INSERT INTO cuentas_contables (cooperativa_id, codigo, nombre, tipo, naturaleza, saldo_actual) VALUES
('00000000-0000-0000-0000-000000000001', '1100', 'Caja General', 'activo', 'deudora', 45350000),
('00000000-0000-0000-0000-000000000001', '1200', 'Banco Nacional', 'activo', 'deudora', 18500000),
('00000000-0000-0000-0000-000000000001', '1300', 'Banco de Costa Rica', 'activo', 'deudora', 12000000),
('00000000-0000-0000-0000-000000000001', '2100', 'Cuentas por Pagar', 'pasivo', 'acreedora', -3200000),
('00000000-0000-0000-0000-000000000001', '3100', 'Capital Social', 'patrimonio', 'acreedora', -8200000),
('00000000-0000-0000-0000-000000000001', '4100', 'Cuotas de Afiliación', 'ingreso', 'acreedora', -8250000),
('00000000-0000-0000-0000-000000000001', '4200', 'Intereses por Créditos', 'ingreso', 'acreedora', -4500000),
('00000000-0000-0000-0000-000000000001', '5100', 'Salarios', 'egreso', 'deudora', 3200000),
('00000000-0000-0000-0000-000000000001', '5200', 'Servicios Públicos', 'egreso', 'deudora', 850000),
('00000000-0000-0000-0000-000000000001', '5300', 'Mantenimiento', 'egreso', 'deudora', 620000);

-- Cuentas bancarias demo
INSERT INTO cuentas_bancarias (cooperativa_id, nombre, banco, tipo, numero_cuenta, saldo_contable, saldo_banco) VALUES
('00000000-0000-0000-0000-000000000001', 'Cuenta Corriente Principal', 'Banco Nacional', 'corriente', 'CR0012345678901234', 18500000, 18550000),
('00000000-0000-0000-0000-000000000001', 'Cuenta Ahorro', 'Banco de Costa Rica', 'ahorro', 'CR0098765432109876', 12000000, 12000000);

-- Tipos de crédito demo
INSERT INTO tipos_credito (cooperativa_id, nombre, descripcion, tasa_anual, plazo_max_meses, monto_minimo, monto_maximo, requiere_garantia) VALUES
('00000000-0000-0000-0000-000000000001', 'Personal', 'Crédito de consumo personal', 14.50, 60, 100000, 2000000, false),
('00000000-0000-0000-0000-000000000001', 'Vivienda', 'Crédito hipotecario para vivienda', 8.00, 240, 5000000, 50000000, true),
('00000000-0000-0000-0000-000000000001', 'Educativo', 'Financiamiento de estudios', 10.00, 120, 500000, 10000000, false),
('00000000-0000-0000-0000-000000000001', 'Emergencia', 'Crédito de emergencia social', 12.00, 24, 50000, 500000, false);

-- Departamentos demo
INSERT INTO departamentos (cooperativa_id, nombre) VALUES
('00000000-0000-0000-0000-000000000001', 'Administración'),
('00000000-0000-0000-0000-000000000001', 'Créditos'),
('00000000-0000-0000-0000-000000000001', 'Servicio al Asociado'),
('00000000-0000-0000-0000-000000000001', 'Tecnología'),
('00000000-0000-0000-0000-000000000001', 'Finanzas');

-- ================================================================
-- FIN
-- ================================================================
