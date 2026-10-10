-- Compatible con productos anteriores: no reparte ni cambia su inventario.
begin;
do $$ begin
  if to_regprocedure('public.record_sale(jsonb,text,numeric)') is null or to_regprocedure('public.export_store_backup()') is null then
    raise exception 'Activa primero las ventas seguras y respaldos.';
  end if;
end $$;

create or replace function public.validate_color_stock()
returns trigger language plpgsql set search_path = '' as $$
declare color jsonb; total numeric := 0;
begin
  if jsonb_typeof(new.colors) <> 'array' then raise exception using errcode='PT422', message='Los colores deben ser una lista.'; end if;
  if exists(select 1 from jsonb_array_elements(new.colors) c where c ? 'stockCount') then
    if jsonb_array_length(new.colors) = 0 or jsonb_array_length(new.colors) > 30 then raise exception using errcode='PT422', message='Revisa los colores del producto.'; end if;
    for color in select * from jsonb_array_elements(new.colors) loop
      if jsonb_typeof(color->'stockCount') is distinct from 'number' or jsonb_typeof(color->'name') is distinct from 'string' or length(btrim(color->>'name')) = 0 then
        raise exception using errcode='PT422', message='Asigna nombre y stock a cada color.';
      end if;
      if (color->>'stockCount')::numeric < 0 or (color->>'stockCount')::numeric > 1000000 or (color->>'stockCount')::numeric <> trunc((color->>'stockCount')::numeric) then
        raise exception using errcode='PT422', message='El stock por color debe ser entero entre 0 y 1 000 000.';
      end if;
      total := total + (color->>'stockCount')::numeric;
    end loop;
    if total > 1000000 or total is distinct from new.stock_count::numeric or new.in_stock is distinct from (total > 0) then
      raise exception using errcode='PT422', message='El total y la disponibilidad deben coincidir con el stock de los colores.';
    end if;
    if exists(select 1 from jsonb_array_elements(new.colors) c group by lower(btrim(c->>'name')) having count(*) > 1) then
      raise exception using errcode='PT422', message='Cada color debe tener un nombre diferente.';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists validate_color_stock on public.products;
create trigger validate_color_stock before insert or update of colors, stock_count, in_stock on public.products for each row execute function public.validate_color_stock();
revoke all on function public.validate_color_stock() from public, anon, authenticated;

create table if not exists public.order_tracking_links (
  sale_id text primary key,
  token_hash text not null unique check(token_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
alter table public.order_tracking_links enable row level security;
revoke all on public.order_tracking_links from public, anon, authenticated;

create or replace function public.create_order_tracking_link(p_sale_id text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare history jsonb; code text; expiry timestamptz := now() + interval '90 days';
begin
  history := public.lock_sales_history();
  if not exists(select 1 from jsonb_array_elements(history) s where s->>'id'=p_sale_id) then
    raise exception using errcode='PT404', message='La venta ya no existe.';
  end if;
  code := replace(gen_random_uuid()::text,'-','') || replace(gen_random_uuid()::text,'-','');
  insert into public.order_tracking_links(sale_id,token_hash,expires_at) values(p_sale_id,encode(sha256(convert_to(code,'UTF8')),'hex'),expiry)
    on conflict(sale_id) do update set token_hash=excluded.token_hash,created_at=now(),expires_at=excluded.expires_at;
  return jsonb_build_object('code',code,'expiresAt',expiry);
end $$;
revoke all on function public.create_order_tracking_link(text) from public, anon, authenticated;
grant execute on function public.create_order_tracking_link(text) to authenticated;

create or replace function public.get_order_tracking(p_code text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare sale_id text; sale jsonb;
begin
  if p_code is null or p_code !~ '^[a-f0-9]{64}$' then return null; end if;
  select l.sale_id into sale_id from public.order_tracking_links l where l.token_hash=encode(sha256(convert_to(p_code,'UTF8')),'hex') and l.expires_at > now();
  if sale_id is null then return null; end if;
  select item into sale from public.store_settings s cross join lateral jsonb_array_elements(s.value) item where s.key='sales_records' and item->>'id'=sale_id;
  if sale is null then return null; end if;
  return jsonb_build_object('productName',sale->>'productName','quantity',sale->'quantity','status',coalesce(sale->>'deliveryStatus','pending'));
end $$;
revoke all on function public.get_order_tracking(text) from public, anon, authenticated;
grant execute on function public.get_order_tracking(text) to anon, authenticated;

create or replace function public.cleanup_order_tracking_links()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.key='sales_records' and jsonb_typeof(new.value)='array' then
    delete from public.order_tracking_links l where not exists(select 1 from jsonb_array_elements(new.value) s where s->>'id'=l.sale_id);
  end if;
  return new;
end $$;
drop trigger if exists cleanup_order_tracking_links on public.store_settings;
create trigger cleanup_order_tracking_links after update of value on public.store_settings for each row execute function public.cleanup_order_tracking_links();
revoke all on function public.cleanup_order_tracking_links() from public, anon, authenticated;

-- Las funciones de venta y respaldo se reemplazan a continuación conservando MFA,
-- bloqueo de filas, control de precio y protección contra reintentos duplicados.

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
  variant_stock boolean := false;
  chosen_stock integer;
begin
  if not public.is_store_admin() then raise exception using errcode = '42501', message = 'Acceso administrativo con MFA requerido.'; end if;
  if p_sale is null or jsonb_typeof(p_sale) <> 'object' or octet_length(p_sale::text) > 16000 then
    raise exception using errcode = 'PT422', message = 'Los datos de la venta no son válidos.';
  end if;
  if exists (select 1 from jsonb_object_keys(p_sale) key where key <> all(array[
    'id', 'productName', 'quantity', 'total', 'channel', 'customerName', 'date', 'timestamp',
    'paymentMethod', 'notes', 'customerPhone', 'customerAddress', 'deliveryStatus', 'trackingNumber', 'selectedColor'
  ])) then raise exception using errcode = 'PT422', message = 'La venta contiene campos no admitidos.'; end if;
  foreach field in array array['id', 'productName', 'channel', 'customerName', 'date'] loop
    if jsonb_typeof(p_sale->field) is distinct from 'string' or length(btrim(p_sale->>field)) = 0 or length(p_sale->>field) > 500 then
      raise exception using errcode = 'PT422', message = 'Revisa el nombre, cliente, fecha y canal de la venta.';
    end if;
  end loop;
  if length(p_sale->>'id') > 100 or (p_sale->>'id') !~ '^VTA-[A-Za-z0-9-]+$' or
    (p_sale->>'channel') not in ('WhatsApp', 'Presencial', 'Web') or
    coalesce(p_sale->>'deliveryStatus', 'pending') not in ('pending', 'prepared', 'shipped', 'delivered', 'cancelled') then
    raise exception using errcode = 'PT422', message = 'El código, canal o estado de la venta no es válido.';
  end if;
  foreach field in array array['paymentMethod', 'notes', 'customerPhone', 'customerAddress', 'trackingNumber', 'selectedColor'] loop
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
      if found then stock := jsonb_build_object('id', product.id, 'stockCount', product.stock_count, 'inStock', product.in_stock, 'updatedAt', product.updated_at) || case when exists(select 1 from jsonb_array_elements(product.colors) c where c ? 'stockCount') then jsonb_build_object('colorStocks', (select jsonb_agg(jsonb_build_object('name',c->>'name','stockCount',c->'stockCount')) from jsonb_array_elements(product.colors) c)) else '{}'::jsonb end; end if;
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
    variant_stock := exists(select 1 from jsonb_array_elements(product.colors) c where c ? 'stockCount');
    if variant_stock or p_sale ? 'selectedColor' then
      if jsonb_typeof(p_sale->'selectedColor') is distinct from 'string' or length(p_sale->>'selectedColor') > 100 or not exists(select 1 from jsonb_array_elements(product.colors) c where c->>'name'=p_sale->>'selectedColor') then
        raise exception using errcode='PT422', message='Elige un color válido para registrar la venta.';
      end if;
    end if;
    if variant_stock then
      select (c->>'stockCount')::integer into chosen_stock from jsonb_array_elements(product.colors) c where c->>'name'=p_sale->>'selectedColor';
      if chosen_stock is null or chosen_stock < quantity then raise exception using errcode='PT409', message='No hay stock suficiente del color seleccionado.'; end if;
    end if;
    saved := saved || jsonb_build_object('productName', product.name);
    update public.products set colors = case when variant_stock then
      (select jsonb_agg(case when c->>'name'=p_sale->>'selectedColor' then c || jsonb_build_object('stockCount',chosen_stock - quantity::integer) else c end order by position) from jsonb_array_elements(product.colors) with ordinality as entries(c,position))
      else colors end, stock_count = stock_count - quantity::integer, in_stock = stock_count - quantity::integer > 0,
      updated_at = now() where id = p_product_id returning * into product;
    stock := jsonb_build_object('id', product.id, 'stockCount', product.stock_count, 'inStock', product.in_stock, 'updatedAt', product.updated_at) || case when exists(select 1 from jsonb_array_elements(product.colors) c where c ? 'stockCount') then jsonb_build_object('colorStocks', (select jsonb_agg(jsonb_build_object('name',c->>'name','stockCount',c->'stockCount')) from jsonb_array_elements(product.colors) c)) else '{}'::jsonb end;
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
  if p_status is null or p_status not in ('pending', 'prepared', 'shipped', 'delivered', 'cancelled') then
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


create or replace function public.export_store_backup()
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare snapshot jsonb; complaints_query text;
begin
  if not coalesce(public.is_store_admin(), false) then
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
        where s.key in (''brands'', ''categories'', ''whatsapp_number'', ''coupons'', ''sales_records'', ''commerce_settings'', ''commerce_schema_version'')),
      ''sale_operations'', (select coalesce(jsonb_agg(to_jsonb(o) order by o.id), ''[]''::jsonb) from public.sale_operations o),
      ''complaints'', ' || complaints_query || '))' into snapshot;
  snapshot := jsonb_set(snapshot, '{tables,order_tracking_links}', (select coalesce(jsonb_agg(to_jsonb(l) order by l.sale_id),'[]'::jsonb) from public.order_tracking_links l));
  if octet_length(snapshot::text) > 52428800 then
    raise exception using errcode = 'PT413', message = 'La copia supera 50 MB. Usa un respaldo de base de datos con las herramientas de Supabase.';
  end if;
  return snapshot;
end $$;
revoke all on function public.export_store_backup() from public, anon, authenticated;
grant execute on function public.export_store_backup() to authenticated;


notify pgrst, 'reload schema';
commit;
