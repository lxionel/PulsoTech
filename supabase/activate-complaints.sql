begin;

do $$ begin
  if to_regprocedure('public.is_store_admin()') is null then
    raise exception 'Activa primero la seguridad del administrador y la doble verificación.';
  end if;
end $$;

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  reference bigint generated always as identity unique,
  created_at timestamptz not null default now(),
  provider jsonb not null check (jsonb_typeof(provider) = 'object'),
  submission jsonb not null check (jsonb_typeof(submission) = 'object'),
  status text not null default 'pending' check (status in ('pending', 'in_review', 'answered')),
  response text not null default '' check (length(response) <= 5000),
  responded_at timestamptz
);
alter table public.complaints enable row level security;
do $$ declare existing record; begin
  for existing in select policyname from pg_policies where schemaname = 'public' and tablename = 'complaints' loop
    execute format('drop policy %I on public.complaints', existing.policyname);
  end loop;
end $$;
revoke all on public.complaints from public, anon, authenticated;
grant select on public.complaints to authenticated;
grant update (status, response, responded_at) on public.complaints to authenticated;
grant select, insert on public.complaints to service_role;
grant usage, select on sequence public.complaints_reference_seq to service_role;

create policy complaints_admin_read on public.complaints for select to authenticated
  using ((select public.is_store_admin()));
create policy complaints_admin_reply on public.complaints for update to authenticated
  using ((select public.is_store_admin())) with check ((select public.is_store_admin()));

-- Solo la función de servidor puede registrar solicitudes. No hay lectura o inserción anónima.
commit;
