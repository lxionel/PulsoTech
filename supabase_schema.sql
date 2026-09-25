-- ==============================================================================
-- PULSOTECH - ESQUEMA DE BASE DE DATOS SUPABASE (POSTGRESQL)
-- ==============================================================================
-- Instrucciones:
-- 1. Ve a tu panel de Supabase: https://supabase.com/dashboard
-- 2. Entra a tu proyecto y haz clic en "SQL Editor" en el menú lateral izquierdo.
-- 3. Haz clic en "New query", pega todo este código y pulsa "Run" (ejecutar).
-- ==============================================================================

-- 1. Crear tabla de productos
create table if not exists public.products (
  id text primary key,
  name text not null,
  slug text not null,
  subtitle text default '',
  description text default '',
  price numeric not null default 0,
  original_price numeric,
  brand text not null default 'Xiaomi',
  category text not null default 'Audífonos Inalámbricos',
  in_stock boolean default true,
  stock_count integer default 10,
  is_featured boolean default true,
  is_new boolean default false,
  rating numeric default 5.0,
  reviews_count integer default 1,
  video_url text,
  colors jsonb default '[]'::jsonb,
  images jsonb default '[]'::jsonb,
  custom_specs jsonb default '[]'::jsonb,
  specs jsonb default '{}'::jsonb,
  sound_profile jsonb default '{"type": "Equilibrado", "description": "Audio de alta fidelidad", "bass": 80, "mid": 80, "treble": 80}'::jsonb,
  features jsonb default '[]'::jsonb,
  tags jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Crear tabla de configuraciones de tienda (marcas, categorías, etc.)
create table if not exists public.store_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Habilitar seguridad a nivel de filas (Row Level Security)
alter table public.products enable row level security;
alter table public.store_settings enable row level security;

-- 4. Políticas para la tabla 'products' (Lectura y escritura segura mediante la clave anónima)
drop policy if exists "Permitir lectura publica de productos" on public.products;
create policy "Permitir lectura publica de productos"
  on public.products for select
  using (true);

drop policy if exists "Permitir insercion de productos" on public.products;
create policy "Permitir insercion de productos"
  on public.products for insert
  with check (true);

drop policy if exists "Permitir actualizacion de productos" on public.products;
create policy "Permitir actualizacion de productos"
  on public.products for update
  using (true);

drop policy if exists "Permitir eliminacion de productos" on public.products;
create policy "Permitir eliminacion de productos"
  on public.products for delete
  using (true);

-- 5. Políticas para la tabla 'store_settings'
drop policy if exists "Permitir lectura publica de configuraciones" on public.store_settings;
create policy "Permitir lectura publica de configuraciones"
  on public.store_settings for select
  using (true);

drop policy if exists "Permitir insercion de configuraciones" on public.store_settings;
create policy "Permitir insercion de configuraciones"
  on public.store_settings for insert
  with check (true);

drop policy if exists "Permitir actualizacion de configuraciones" on public.store_settings;
create policy "Permitir actualizacion de configuraciones"
  on public.store_settings for update
  using (true);

-- 6. Habilitar suscripción a cambios en tiempo real (Supabase Realtime)
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.store_settings;
