-- Ejecutar en PulsoTech después de activar MFA y las ventas seguras.
begin;
do $$ begin
  if to_regprocedure('public.is_store_admin_account()') is null or
     to_regprocedure('public.record_sale(jsonb,text,numeric)') is null then
    raise exception 'Activa primero MFA y las ventas seguras en este proyecto. No se aplicó ningún cambio.';
  end if;
end $$;

create or replace function public.export_store_backup()
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare snapshot jsonb; complaints_query text;
begin
  if not public.is_store_admin() then
    raise exception using errcode = '42501', message = 'Acceso administrativo con MFA requerido.';
  end if;
  -- El Libro puede no estar instalado. Una sola consulta lee todas las tablas
  -- con la misma instantánea MVCC, incluso si se registra una venta mientras tanto.
  complaints_query := case when to_regclass('public.complaints') is null then 'null::jsonb'
    else '(select coalesce(jsonb_agg(to_jsonb(c) order by c.reference), ''[]''::jsonb) from public.complaints c)' end;
  execute 'select jsonb_build_object(
    ''format'', ''PulsoTech-operational-backup'', ''version'', 1,
    ''createdAt'', statement_timestamp(),
    ''tables'', jsonb_build_object(
      ''products'', (select coalesce(jsonb_agg(to_jsonb(p) order by p.id), ''[]''::jsonb) from public.products p),
      ''store_settings'', (select coalesce(jsonb_agg(to_jsonb(s) order by s.key), ''[]''::jsonb) from public.store_settings s
        where s.key in (''brands'', ''categories'', ''whatsapp_number'', ''coupons'', ''sales_records'')),
      ''sale_operations'', (select coalesce(jsonb_agg(to_jsonb(o) order by o.id), ''[]''::jsonb) from public.sale_operations o),
      ''complaints'', ' || complaints_query || '))' into snapshot;
  if octet_length(snapshot::text) > 52428800 then
    raise exception using errcode = 'PT413', message = 'La copia supera 50 MB. Usa un respaldo de base de datos con las herramientas de Supabase.';
  end if;
  return snapshot;
end $$;
revoke all on function public.export_store_backup() from public, anon, authenticated;
grant execute on function public.export_store_backup() to authenticated;
notify pgrst, 'reload schema';
commit;
