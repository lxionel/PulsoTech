-- PulsoTech: activar MFA obligatorio. Ejecutar después de activar la cuenta administradora.
-- Activación de la cuenta del propietario y permisos, en una sola transacción.
begin;

-- PulsoTech: catálogo público, modificaciones solo para administradores autorizados.
-- Ejecutar desde el SQL Editor del proyecto. No borra productos, ventas ni ajustes.

create table if not exists public.store_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.store_admins enable row level security;
alter table public.products enable row level security;
alter table public.store_settings enable row level security;

-- Quitar las políticas antiguas es necesario: las permisivas se combinan con OR.
do $policies$
declare existing record;
begin
  for existing in
    select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public' and tablename in ('products', 'store_settings', 'store_admins')
  loop
    execute format('drop policy %I on %I.%I', existing.policyname, existing.schemaname, existing.tablename);
  end loop;
end;
$policies$;

-- La pertenencia permite configurar el autenticador, pero no concede acceso a datos privados.
create or replace function public.is_store_admin_account()
returns boolean language sql stable security definer set search_path = ''
as $account$
  select exists (select 1 from public.store_admins where user_id = (select auth.uid()));
$account$;
revoke all on function public.is_store_admin_account() from public;
grant execute on function public.is_store_admin_account() to anon, authenticated;

-- Exigir un JWT de nivel aal2 y un factor TOTP todavía verificado.
create or replace function public.is_store_admin()
returns boolean language sql stable security definer set search_path = ''
as $admin$
  select public.is_store_admin_account()
    and coalesce((select auth.jwt()->>'aal') = 'aal2', false)
    and exists (
      select 1 from auth.mfa_factors
      where user_id = (select auth.uid()) and status = 'verified' and factor_type = 'totp'
    );
$admin$;
revoke all on function public.is_store_admin() from public;
grant execute on function public.is_store_admin() to anon, authenticated;

-- Las cuentas no pueden otorgarse permisos ni modificar la lista de administradores.
revoke all on public.store_admins from public, anon, authenticated;
grant select on public.store_admins to authenticated;
create policy store_admins_self_read on public.store_admins for select to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.products from public, anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
create policy products_public_read on public.products for select to anon, authenticated using (true);
create policy products_admin_write on public.products for all to authenticated
  using ((select public.is_store_admin())) with check ((select public.is_store_admin()));

revoke all on public.store_settings from public, anon, authenticated;
grant select on public.store_settings to anon, authenticated;
grant insert, update, delete on public.store_settings to authenticated;
create policy settings_public_read on public.store_settings for select to anon, authenticated
  using (key in ('brands', 'categories', 'whatsapp_number', 'coupons'));
create policy settings_admin_access on public.store_settings for all to authenticated
  using ((select public.is_store_admin())) with check ((select public.is_store_admin()));

-- Mantener Realtime sin fallar si las tablas ya pertenecen a la publicación.
do $realtime$
declare target_table text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach target_table in array array['products', 'store_settings'] loop
      if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = target_table) then
        execute format('alter publication supabase_realtime add table public.%I', target_table);
      end if;
    end loop;
  end if;
end;
$realtime$;

-- Conservar la cuenta autorizada anteriormente; no añadir usuarios desde este paso.
do $ready$
begin
  if not exists (select 1 from public.store_admins) then
    raise exception 'Activa primero tu cuenta con supabase/activate-admin.sql. No se aplicó ningún cambio.';
  end if;
end;
$ready$;

commit;
