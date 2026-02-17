
-- ⚠️ FIX SCRIPT: DROP & RECREATE POSTULACIONES
-- Este script soluciona el error "column user_id does not exist"
-- borrando la tabla antigua que probablemente tenía una estructura diferente.

-- 1. Limpieza de Políticas y Tabla
drop policy if exists "Applicants view own" on postulaciones;
drop policy if exists "Companies view applications for their vacancies" on postulaciones;
drop policy if exists "Users can apply" on postulaciones;
drop policy if exists "Companies update status" on postulaciones;

drop table if exists postulaciones;

-- 2. ENUMS (Idempotente)
do $$ begin
    create type estado_postulacion_enum as enum ('pendiente', 'rechazado', 'chat_iniciado');
exception
    when duplicate_object then null;
end $$;

-- 3. RE-CREACIÓN DE LA TABLA (Definitiva)
create table postulaciones (
    id uuid primary key default uuid_generate_v4(),
    vacante_id uuid references vacantes(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null, -- Esta es la columna que faltaba
    status estado_postulacion_enum default 'pendiente',
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(vacante_id, user_id)
);

-- 4. HABILITAR RLS
alter table postulaciones enable row level security;

-- 5. RE-APLICAR POLÍTICAS

-- A) Postulantes ven sus propias postulaciones
create policy "Applicants view own" on postulaciones
    for select using (auth.uid() = user_id);

-- B) Empresas ven postulaciones a sus vacantes
create policy "Companies view applications for their vacancies" on postulaciones
    for select using (
        exists (
            select 1 from vacantes
            where vacantes.id = postulaciones.vacante_id
            and vacantes.empresa_id = auth.uid()
        )
    );

-- C) Usuarios pueden postularse (Insertar su propio ID)
create policy "Users can apply" on postulaciones
    for insert with check (auth.uid() = user_id);

-- D) Empresas pueden gestionar (Update status)
create policy "Companies update status" on postulaciones
    for update using (
        exists (
            select 1 from vacantes
            where vacantes.id = postulaciones.vacante_id
            and vacantes.empresa_id = auth.uid()
        )
    );

-- 6. INDEXING (Performance)
create index if not exists idx_postulaciones_vacante on postulaciones(vacante_id);
create index if not exists idx_postulaciones_user on postulaciones(user_id);
