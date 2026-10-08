-- Solo lectura. No consulta nombres, documentos ni contenido de solicitudes.
-- Ejecutar después de activate-complaints.sql; todas las comprobaciones deben ser true.
with target as (
  select to_regclass('public.complaints') as relation,
         to_regclass('public.complaints_reference_seq') as sequence
)
select
  relation is not null as table_installed,
  coalesce((select relrowsecurity from pg_class where oid = relation), false) as rls_enabled,
  coalesce(not has_table_privilege('anon', relation, 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'), false) as anonymous_has_no_table_access,
  relation is not null and not exists (select 1 from pg_attribute
    where attrelid = relation and attnum > 0 and not attisdropped
    and has_column_privilege('anon', relation, attname, 'SELECT,INSERT,UPDATE,REFERENCES')) as anonymous_has_no_column_access,
  coalesce(has_table_privilege('authenticated', relation, 'SELECT'), false) as authenticated_can_read_subject_to_rls,
  coalesce(not has_table_privilege('authenticated', relation, 'INSERT,DELETE,TRUNCATE,REFERENCES,TRIGGER'), false) as authenticated_cannot_insert_or_delete,
  coalesce((select count(*) = 3 and bool_and(attname in ('status', 'response', 'responded_at'))
    from pg_attribute where attrelid = relation and attnum > 0 and not attisdropped
    and has_column_privilege('authenticated', relation, attname, 'UPDATE')), false) as authenticated_can_update_only_reply_fields,
  coalesce(has_table_privilege('service_role', relation, 'SELECT') and has_table_privilege('service_role', relation, 'INSERT'), false) as server_has_table_access,
  coalesce(has_sequence_privilege('service_role', sequence, 'USAGE') and has_sequence_privilege('service_role', sequence, 'SELECT'), false) as server_has_reference_access,
  coalesce((select jsonb_agg(jsonb_build_object('name', policyname, 'command', cmd, 'roles', roles,
    'using', qual, 'check', with_check) order by policyname)
    from pg_policies where schemaname = 'public' and tablename = 'complaints'), '[]'::jsonb) as policies
from target;
