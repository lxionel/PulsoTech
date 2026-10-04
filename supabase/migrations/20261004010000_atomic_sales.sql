-- PulsoTech: ventas y existencias en una transacción. Ejecutar después de activar MFA.
-- No modifica el stock ni elimina ventas existentes al instalarse.
begin;

do $$ begin
  if to_regprocedure('public.is_store_admin()') is null then
    raise exception 'Activa primero el administrador y MFA. No se aplicó ningún cambio.';
  end if;
end $$;

-- Guarda únicamente la identidad del intento; no guarda nombres, teléfonos ni direcciones.
create table if not exists public.sale_operations (
  id text primary key,
  request_hash text not null,
  product_id text,
  created_at timestamptz not null default now()
);
alter table public.sale_operations enable row level security;
do $$ declare policy record; begin
  for policy in select policyname from pg_policies where schemaname = 'public' and tablename = 'sale_operations' loop
    execute format('drop policy %I on public.sale_operations', policy.policyname);
  end loop;
end $$;
revoke all on public.sale_operations from public, anon, authenticated;

-- Quitar políticas permisivas antiguas: ninguna llamada del navegador puede sobrescribir ventas.
do $$ declare policy record; begin
  for policy in select policyname from pg_policies where schemaname = 'public' and tablename = 'store_settings' loop
    execute format('drop policy %I on public.store_settings', policy.policyname);
  end loop;
end $$;
alter table public.store_settings enable row level security;
revoke all on public.store_settings from public, anon, authenticated;
grant select on public.store_settings to anon, authenticated;
grant insert, update, delete on public.store_settings to authenticated;
create policy settings_public_read on public.store_settings for select to anon, authenticated
  using (key in ('brands', 'categories', 'whatsapp_number', 'coupons'));
create policy settings_admin_read on public.store_settings for select to authenticated
  using ((select public.is_store_admin()));
create policy settings_admin_write on public.store_settings for all to authenticated
  using (key <> 'sales_records' and (select public.is_store_admin()))
  with check (key <> 'sales_records' and (select public.is_store_admin()));

-- Todos los cambios bloquean la misma fila antes de bloquear un producto.
-- Este orden evita carreras, pérdidas de ventas y bloqueos cruzados entre estas funciones.
create or replace function public.lock_sales_history()
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare history jsonb;
begin
  if not public.is_store_admin() then raise exception using errcode = '42501', message = 'Acceso administrativo con MFA requerido.'; end if;
  insert into public.store_settings(key, value, updated_at) values ('sales_records', '[]'::jsonb, now()) on conflict (key) do nothing;
  select value into history from public.store_settings where key = 'sales_records' for update;
  if history is null or jsonb_typeof(history) <> 'array' then
    raise exception using errcode = 'PT422', message = 'El historial requiere revisión; no se modificó ninguna venta.';
  end if;
  if jsonb_array_length(history) > 10000 or exists (
    select 1 from jsonb_array_elements(history) item
    where jsonb_typeof(item) <> 'object' or jsonb_typeof(item->'id') is distinct from 'string' or length(item->>'id') = 0
  ) or exists (
    select 1 from jsonb_array_elements(history) item group by item->>'id' having count(*) > 1
  ) then raise exception using errcode = 'PT422', message = 'El historial requiere revisión; no se modificó ninguna venta.'; end if;
  return history;
end $$;
revoke all on function public.lock_sales_history() from public, anon, authenticated;

create or replace function public.record_sale(p_sale jsonb, p_product_id text default null, p_expected_price numeric default null)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  history jsonb;
  quantity numeric;
  total numeric;
  fingerprint text;
  previous public.sale_operations%rowtype;
  product public.products%rowtype;
  saved jsonb;
  stock jsonb := null;
  field text;
begin
  if not public.is_store_admin() then raise exception using errcode = '42501', message = 'Acceso administrativo con MFA requerido.'; end if;
  if p_sale is null or jsonb_typeof(p_sale) <> 'object' or octet_length(p_sale::text) > 16000 then
    raise exception using errcode = 'PT422', message = 'Los datos de la venta no son válidos.';
  end if;
  if exists (select 1 from jsonb_object_keys(p_sale) key where key <> all(array[
    'id', 'productName', 'quantity', 'total', 'channel', 'customerName', 'date', 'timestamp',
    'paymentMethod', 'notes', 'customerPhone', 'customerAddress', 'deliveryStatus', 'trackingNumber'
  ])) then raise exception using errcode = 'PT422', message = 'La venta contiene campos no admitidos.'; end if;
  foreach field in array array['id', 'productName', 'channel', 'customerName', 'date'] loop
    if jsonb_typeof(p_sale->field) is distinct from 'string' or length(btrim(p_sale->>field)) = 0 or length(p_sale->>field) > 500 then
      raise exception using errcode = 'PT422', message = 'Revisa el nombre, cliente, fecha y canal de la venta.';
    end if;
  end loop;
  if length(p_sale->>'id') > 100 or (p_sale->>'id') !~ '^VTA-[A-Za-z0-9-]+$' or
    (p_sale->>'channel') not in ('WhatsApp', 'Presencial', 'Web') or
    coalesce(p_sale->>'deliveryStatus', 'pending') not in ('pending', 'shipped', 'delivered', 'cancelled') then
    raise exception using errcode = 'PT422', message = 'El código, canal o estado de la venta no es válido.';
  end if;
  foreach field in array array['paymentMethod', 'notes', 'customerPhone', 'customerAddress', 'trackingNumber'] loop
    if p_sale ? field and (jsonb_typeof(p_sale->field) <> 'string' or length(p_sale->>field) > 2000) then
      raise exception using errcode = 'PT422', message = 'Revisa los datos de contacto y las notas de la venta.';
    end if;
  end loop;
  if jsonb_typeof(p_sale->'quantity') is distinct from 'number' or jsonb_typeof(p_sale->'total') is distinct from 'number' or
    jsonb_typeof(p_sale->'timestamp') is distinct from 'number' then
    raise exception using errcode = 'PT422', message = 'La cantidad, importe o fecha no es válida.';
  end if;
  quantity := (p_sale->>'quantity')::numeric;
  total := (p_sale->>'total')::numeric;
  if quantity < 1 or quantity > 1000000 or quantity <> trunc(quantity) or total < 0 or total > 1000000000 or
    total <> round(total, 2) or abs((p_sale->>'timestamp')::numeric) > 8640000000000000 then
    raise exception using errcode = 'PT422', message = 'Revisa la cantidad y el importe: usa hasta dos decimales.';
  end if;
  if p_product_id is not null and (length(p_product_id) = 0 or length(p_product_id) > 100) then
    raise exception using errcode = 'PT422', message = 'El producto no es válido.';
  end if;

  history := public.lock_sales_history();
  fingerprint := encode(sha256(convert_to(jsonb_build_object('sale', p_sale, 'product', p_product_id, 'price', p_expected_price)::text, 'UTF8')), 'hex');
  select * into previous from public.sale_operations where id = p_sale->>'id';
  if found then
    if previous.request_hash = 'retired' then
      raise exception using errcode = 'PT410', message = 'Esta orden ya fue retirada del historial y no se puede registrar otra vez con el mismo código.';
    end if;
    if previous.request_hash <> fingerprint then
      raise exception using errcode = 'PT409', message = 'Este código pertenece a otro registro; comprueba el historial.';
    end if;
    select item into saved from jsonb_array_elements(history) item where item->>'id' = p_sale->>'id';
    if saved is null then raise exception using errcode = 'PT410', message = 'Esta orden ya fue retirada del historial y no se puede registrar otra vez con el mismo código.'; end if;
    if previous.product_id is not null then
      select * into product from public.products where id = previous.product_id;
      if found then stock := jsonb_build_object('id', product.id, 'stockCount', product.stock_count, 'inStock', product.in_stock); end if;
    end if;
    return jsonb_build_object('records', history, 'sale', saved, 'stock', stock, 'replayed', true);
  end if;
  if exists (select 1 from jsonb_array_elements(history) item where item->>'id' = p_sale->>'id') then
    raise exception using errcode = 'PT409', message = 'Ya existe una venta con este código; comprueba el historial.';
  end if;
  if jsonb_array_length(history) >= 10000 then raise exception using errcode = 'PT422', message = 'El historial alcanzó el límite; exporta y revisa tus registros.'; end if;

  saved := p_sale || jsonb_build_object('deliveryStatus', coalesce(p_sale->>'deliveryStatus', 'pending'));
  if p_product_id is not null then
    select * into product from public.products where id = p_product_id for update;
    if not found then raise exception using errcode = 'PT404', message = 'El producto ya no está disponible en el catálogo.'; end if;
    if product.in_stock is distinct from true or product.stock_count is null or product.stock_count < quantity then
      raise exception using errcode = 'PT409', message = 'No hay stock suficiente. Actualiza el catálogo y revisa la cantidad.';
    end if;
    if p_expected_price is not null and product.price is distinct from p_expected_price then
      raise exception using errcode = 'PT409', message = 'El precio cambió. Actualiza el catálogo y revisa el importe.';
    end if;
    saved := saved || jsonb_build_object('productName', product.name);
    update public.products set stock_count = stock_count - quantity::integer, in_stock = stock_count - quantity::integer > 0,
      updated_at = now() where id = p_product_id returning * into product;
    stock := jsonb_build_object('id', product.id, 'stockCount', product.stock_count, 'inStock', product.in_stock);
  end if;
  insert into public.sale_operations(id, request_hash, product_id) values (p_sale->>'id', fingerprint, p_product_id);
  history := jsonb_build_array(saved) || history;
  update public.store_settings set value = history, updated_at = now() where key = 'sales_records';
  return jsonb_build_object('records', history, 'sale', saved, 'stock', stock, 'replayed', false);
end $$;
revoke all on function public.record_sale(jsonb, text, numeric) from public, anon, authenticated;
grant execute on function public.record_sale(jsonb, text, numeric) to authenticated;

create or replace function public.change_sale_status(p_id text, p_status text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare history jsonb;
begin
  history := public.lock_sales_history();
  if p_status is null or p_status not in ('pending', 'shipped', 'delivered', 'cancelled') then
    raise exception using errcode = 'PT422', message = 'El estado de la orden no es válido.';
  end if;
  if not exists (select 1 from jsonb_array_elements(history) item where item->>'id' = p_id) then
    raise exception using errcode = 'PT404', message = 'La orden ya no existe. Recarga el historial.';
  end if;
  select coalesce(jsonb_agg(case when item->>'id' = p_id then item || jsonb_build_object('deliveryStatus', p_status) else item end order by position), '[]')
    into history from jsonb_array_elements(history) with ordinality as entries(item, position);
  update public.store_settings set value = history, updated_at = now() where key = 'sales_records';
  return jsonb_build_object('records', history);
end $$;
revoke all on function public.change_sale_status(text, text) from public, anon, authenticated;
grant execute on function public.change_sale_status(text, text) to authenticated;

create or replace function public.remove_sale_record(p_id text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare history jsonb;
begin
  history := public.lock_sales_history();
  if not exists (select 1 from jsonb_array_elements(history) item where item->>'id' = p_id) then
    raise exception using errcode = 'PT404', message = 'La orden ya no existe. Recarga el historial.';
  end if;
  insert into public.sale_operations(id, request_hash) values (p_id, 'retired') on conflict (id) do nothing;
  select coalesce(jsonb_agg(item order by position), '[]') into history
    from jsonb_array_elements(history) with ordinality as entries(item, position) where item->>'id' <> p_id;
  update public.store_settings set value = history, updated_at = now() where key = 'sales_records';
  -- La identidad se conserva sin datos personales para impedir otro descuento con el mismo código.
  return jsonb_build_object('records', history);
end $$;
revoke all on function public.remove_sale_record(text) from public, anon, authenticated;
grant execute on function public.remove_sale_record(text) to authenticated;

create or replace function public.clear_sale_records()
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare history jsonb;
begin
  history := public.lock_sales_history();
  insert into public.sale_operations(id, request_hash)
    select item->>'id', 'retired' from jsonb_array_elements(history) item on conflict (id) do nothing;
  update public.store_settings set value = '[]'::jsonb, updated_at = now() where key = 'sales_records';
  return jsonb_build_object('records', '[]'::jsonb);
end $$;
revoke all on function public.clear_sale_records() from public, anon, authenticated;
grant execute on function public.clear_sale_records() to authenticated;

-- PostgREST debe actualizar su catálogo de funciones.
notify pgrst, 'reload schema';
commit;
