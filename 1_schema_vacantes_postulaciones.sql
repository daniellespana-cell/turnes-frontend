
-- 1. UTILS
create extension if not exists "uuid-ossp";

-- 2. ENUMS
do $$ begin
    create type estado_vacante_enum as enum ('activa', 'cerrada', 'expirada');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type estado_postulacion_enum as enum ('pendiente', 'rechazado', 'chat_iniciado');
exception
    when duplicate_object then null;
end $$;

-- 3. UPDATE VACANTES TABLE
-- Add missing columns if they don't exist
alter table vacantes add column if not exists lat double precision;
alter table vacantes add column if not exists lng double precision;
alter table vacantes add column if not exists status estado_vacante_enum default 'activa';
alter table vacantes add column if not exists closed_at timestamptz;

-- 4. CREATE POSTULACIONES TABLE
create table if not exists postulaciones (
    id uuid primary key default uuid_generate_v4(),
    vacante_id uuid references vacantes(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    status estado_postulacion_enum default 'pendiente',
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(vacante_id, user_id) -- Prevent double application
);

-- 5. RLS POLICIES (POSTULACIONES)
alter table postulaciones enable row level security;

-- Policy: Applicants can see their own applications
create policy "Applicants view own" on postulaciones
    for select using (auth.uid() = user_id);

-- Policy: Companies can see applications for their vacancies
create policy "Companies view applications for their vacancies" on postulaciones
    for select using (
        exists (
            select 1 from vacantes
            where vacantes.id = postulaciones.vacante_id
            and vacantes.empresa_id = auth.uid()
        )
    );

-- Policy: Users can create applications (Apply)
create policy "Users can apply" on postulaciones
    for insert with check (auth.uid() = user_id);

-- Policy: Companies can update status (Reject/Chat)
create policy "Companies update status" on postulaciones
    for update using (
        exists (
            select 1 from vacantes
            where vacantes.id = postulaciones.vacante_id
            and vacantes.empresa_id = auth.uid()
        )
    );
