-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.planes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nombre text NOT NULL UNIQUE,
  costo_mensual numeric NOT NULL DEFAULT 0,
  comision_turnos_pct numeric DEFAULT 0,
  cupo_fijos_mensual integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  slug text UNIQUE,
  description text,
  features ARRAY,
  benefits jsonb DEFAULT '{}'::jsonb,
  is_popular boolean DEFAULT false,
  CONSTRAINT planes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.perfiles (
  id uuid NOT NULL,
  rol USER-DEFINED NOT NULL,
  nombre_display text,
  estado_cuenta text DEFAULT 'activo'::text,
  avatar_url text,
  bio text,
  skills ARRAY,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  email text,
  calificacion numeric DEFAULT 0.0 CHECK (calificacion >= 0.0 AND calificacion <= 5.0),
  plan text DEFAULT 'Básico'::text,
  verified boolean DEFAULT false,
  telefono text,
  nombre_empresa text,
  nit text,
  direccion text,
  on_vacation boolean DEFAULT false,
  sector text,
  disponibilidad text,
  experiencia_anios integer DEFAULT 0,
  rating numeric DEFAULT 0.0,
  completed_shifts integer DEFAULT 0,
  verificado boolean DEFAULT false,
  lat double precision,
  lng double precision,
  geo_point USER-DEFINED,
  plan_expires_at timestamp with time zone,
  cancel_at_period_end boolean DEFAULT false,
  last_activity_at timestamp with time zone DEFAULT now(),
  configuraciones jsonb DEFAULT '{"theme": "dark", "privacy": {"showOnlineStatus": true, "profileVisibility": "public"}, "language": "es", "notifications": {"push": true, "email": true, "marketing": false}}'::jsonb,
  reputation_score numeric DEFAULT 0.0,
  reputation_count integer DEFAULT 0,
  plan_next_id text,
  CONSTRAINT perfiles_pkey PRIMARY KEY (id),
  CONSTRAINT perfiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.empresas (
  id uuid NOT NULL,
  plan_id uuid,
  nombre_comercial text,
  nit_rut text,
  validacion_estado text DEFAULT 'pendiente'::text,
  created_at timestamp with time zone DEFAULT now(),
  logo_url text,
  verificado boolean DEFAULT false,
  sector_industrial text,
  lat double precision,
  lng double precision,
  geo_point USER-DEFINED,
  CONSTRAINT empresas_pkey PRIMARY KEY (id),
  CONSTRAINT empresas_id_fkey FOREIGN KEY (id) REFERENCES public.perfiles(id),
  CONSTRAINT empresas_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.planes(id)
);
CREATE TABLE public.billeteras (
  id uuid NOT NULL,
  saldo numeric DEFAULT 0 CHECK (saldo >= 0::numeric),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT billeteras_pkey PRIMARY KEY (id),
  CONSTRAINT billeteras_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.movimientos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  billetera_id uuid,
  tipo text NOT NULL CHECK (tipo = ANY (ARRAY['DEPOSITO'::text, 'RETIRO'::text, 'PAGO_SERVICIO'::text, 'COMISION'::text, 'INGRESO'::text])),
  monto numeric NOT NULL,
  concepto text,
  referencia text DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  estado text DEFAULT 'completado'::text,
  CONSTRAINT movimientos_pkey PRIMARY KEY (id),
  CONSTRAINT movimientos_billetera_id_fkey FOREIGN KEY (billetera_id) REFERENCES public.billeteras(id)
);
CREATE TABLE public.vacantes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL,
  titulo text NOT NULL,
  descripcion text,
  salario numeric,
  ubicacion text,
  lat double precision,
  lng double precision,
  status USER-DEFINED DEFAULT 'activa'::estado_vacante_enum,
  closed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  tipo_turno text DEFAULT 'Tiempo Completo'::text,
  pago_monto numeric DEFAULT 0 CHECK (pago_monto IS NULL OR pago_monto >= 50000::numeric),
  direccion_formateada text,
  fecha_turno timestamp with time zone,
  categoria text DEFAULT 'VARIOS'::text,
  modalidad text CHECK (modalidad = ANY (ARRAY['temporal'::text, 'fijo'::text])),
  es_urgente boolean DEFAULT false,
  cupos_disponibles integer DEFAULT 1,
  tags ARRAY,
  geo_point USER-DEFINED,
  contratado_id uuid,
  etiquetas ARRAY DEFAULT '{}'::text[],
  idempotency_key uuid,
  urgente_expiracion timestamp with time zone,
  tipo_turno_id text,
  CONSTRAINT vacantes_pkey PRIMARY KEY (id),
  CONSTRAINT vacantes_contratado_id_fkey FOREIGN KEY (contratado_id) REFERENCES auth.users(id),
  CONSTRAINT vacantes_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
);
CREATE TABLE public.postulaciones (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  vacante_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status text DEFAULT 'pendiente'::estado_postulacion_enum,
  step integer DEFAULT 0,
  is_paid boolean DEFAULT false,
  protocol_state jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  finalized_at timestamp with time zone,
  CONSTRAINT postulaciones_pkey PRIMARY KEY (id),
  CONSTRAINT postulaciones_vacante_id_fkey FOREIGN KEY (vacante_id) REFERENCES public.vacantes(id),
  CONSTRAINT postulaciones_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.perfiles(id)
);
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  target_id uuid NOT NULL,
  author_id uuid NOT NULL,
  shift_id uuid,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_target_id_fkey FOREIGN KEY (target_id) REFERENCES public.perfiles(id),
  CONSTRAINT reviews_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.perfiles(id)
);
CREATE TABLE public.system_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  level text CHECK (level = ANY (ARRAY['INFO'::text, 'WARN'::text, 'ERROR'::text, 'DEBUG'::text])),
  component text,
  message text,
  metadata jsonb,
  CONSTRAINT system_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.wompi_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  transaction_id text NOT NULL UNIQUE,
  reference text NOT NULL,
  amount_in_cents bigint NOT NULL,
  status text NOT NULL,
  payload jsonb,
  signature text,
  CONSTRAINT wompi_events_pkey PRIMARY KEY (id)
);
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  user_id uuid,
  action text NOT NULL CHECK (length(action) > 0),
  resource_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.microservices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  title text NOT NULL,
  price numeric NOT NULL,
  target_audience text CHECK (target_audience = ANY (ARRAY['EMPRESAS'::text, 'TRABAJADORES'::text])),
  description text,
  icon_key text,
  is_active boolean DEFAULT true,
  CONSTRAINT microservices_pkey PRIMARY KEY (id)
);
CREATE TABLE public.company_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key_name character varying NOT NULL UNIQUE,
  value_text text NOT NULL,
  description text,
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT company_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.mensajes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  conversacion_id uuid,
  sender_id uuid,
  content text NOT NULL CHECK (length(content) <= 5000),
  tipo text DEFAULT 'text'::text,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  leido boolean DEFAULT false,
  read_at timestamp with time zone,
  CONSTRAINT mensajes_pkey PRIMARY KEY (id),
  CONSTRAINT mensajes_conversacion_id_fkey FOREIGN KEY (conversacion_id) REFERENCES public.postulaciones(id),
  CONSTRAINT mensajes_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id)
);
CREATE TABLE public.turnes_chats (
  id uuid NOT NULL,
  empresa_id uuid NOT NULL,
  postulante_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT turnes_chats_pkey PRIMARY KEY (id),
  CONSTRAINT turnes_chats_id_fkey FOREIGN KEY (id) REFERENCES public.postulaciones(id),
  CONSTRAINT turnes_chats_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.perfiles(id),
  CONSTRAINT turnes_chats_postulante_id_fkey FOREIGN KEY (postulante_id) REFERENCES public.perfiles(id)
);
CREATE TABLE public.taxonomy_sectors (
  id character varying NOT NULL,
  label character varying NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  icon text DEFAULT 'Grid'::text,
  color text DEFAULT 'text-zinc-500'::text,
  hex text DEFAULT '#71717a'::text,
  CONSTRAINT taxonomy_sectors_pkey PRIMARY KEY (id)
);
CREATE TABLE public.taxonomy_roles (
  id character varying NOT NULL,
  sector_id character varying,
  label character varying NOT NULL,
  slug character varying UNIQUE,
  marketing_title character varying,
  marketing_accent_color character varying,
  marketing_description text,
  job_demo_title character varying,
  job_demo_salary character varying,
  job_demo_location character varying,
  job_demo_hours character varying,
  job_demo_reqs jsonb,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT taxonomy_roles_pkey PRIMARY KEY (id),
  CONSTRAINT taxonomy_roles_sector_id_fkey FOREIGN KEY (sector_id) REFERENCES public.taxonomy_sectors(id)
);
CREATE TABLE public.taxonomy_skills (
  id character varying NOT NULL,
  sector_id character varying,
  label character varying NOT NULL,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT taxonomy_skills_pkey PRIMARY KEY (id),
  CONSTRAINT taxonomy_skills_sector_id_fkey FOREIGN KEY (sector_id) REFERENCES public.taxonomy_sectors(id)
);
CREATE TABLE public.notificaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tipo text NOT NULL,
  leida boolean NOT NULL DEFAULT false,
  reference_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notificaciones_pkey PRIMARY KEY (id),
  CONSTRAINT notificaciones_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.ciudades_coords (
  nombre text NOT NULL,
  nombre_lower text DEFAULT lower(nombre) UNIQUE,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  departamento text,
  activa boolean DEFAULT true,
  CONSTRAINT ciudades_coords_pkey PRIMARY KEY (nombre)
);
CREATE TABLE public.verification_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_role character varying NOT NULL CHECK (user_role::text = ANY (ARRAY['empresa'::character varying, 'postulante'::character varying]::text[])),
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['payment_cleared'::character varying, 'pending'::character varying, 'in_review'::character varying, 'approved'::character varying, 'rejected'::character varying]::text[])),
  payment_movement_id uuid,
  amount_paid numeric NOT NULL DEFAULT 20000,
  documents jsonb NOT NULL DEFAULT '[]'::jsonb,
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT verification_requests_pkey PRIMARY KEY (id),
  CONSTRAINT verification_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.perfiles(id),
  CONSTRAINT verification_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id)
);
