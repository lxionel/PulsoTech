# Operaciones de Supabase en un entorno temporal

El propietario confirmó que PulsoTech usa el plan gratuito. Los dos proyectos accesibles están activos y corresponden a aplicaciones distintas; no se reutiliza, pausa ni elimina el segundo. La alternativa preparada ejecuta PostgreSQL, Auth y PostgREST dentro de un runner temporal de GitHub Actions, sin crear un proyecto alojado adicional.

## Resultado comprobado

Los diez grupos de integración pasaron en la [ejecución de GitHub](https://github.com/lxionel/PulsoTech/actions/runs/37868539908), referencia `8e37466`. La eliminación de contenedores y volúmenes temporales terminó correctamente. La [validación de aplicación](https://github.com/lxionel/PulsoTech/actions/runs/37868539965) también aprobó sus 168 pruebas, lint y compilación estática. [Evidencia resumida](evidencia-integracion-supabase-2026-10-08.json).

## Coste y aislamiento

El repositorio `lxionel/PulsoTech` es público. Los runners estándar de GitHub son gratuitos para repositorios públicos ([condiciones de GitHub Actions](https://docs.github.com/en/billing/concepts/product-billing/github-actions)). El trabajo se omite si el repositorio pasa a privado, utiliza `ubuntu-latest`, limita su duración a veinte minutos y no sube artefactos ni conserva cachés. No configura ningún recurso de pago de Supabase.

La configuración del runner se crea en una carpeta temporal independiente. No copia `supabase/.temp`, archivos `.env`, respaldos, credenciales del propietario ni secretos del repositorio. La prueba obtiene las claves efímeras del servicio local sin imprimirlas y acepta exclusivamente `http://127.0.0.1:54321`; las peticiones rechazan redirecciones y otros destinos. El esquema y los instaladores del repositorio se aplican solo al contenedor `supabase_db_pulsotech-ci`.

Las cuentas se crean mediante la API administrativa local con correos `example.invalid`, contraseñas aleatorias y confirmación explícita, sin enviar mensajes. El factor TOTP se enrola y verifica a través de Auth; no se fabrican JWT ni se simula `aal2` en SQL. Los productos y reclamos son sintéticos. El último paso elimina los contenedores y volúmenes temporales incluso si una prueba falla; GitHub también descarta el runner al terminar.

## Qué comprueba

- Instalación actual y disponibilidad de sus funciones a través de PostgREST.
- Rechazo de ventas anónimas, sesiones solo con contraseña y usuarios con MFA que no sean administradores.
- Creación y edición de un producto, persistencia de varias fotos por color y selección de su galería con la misma función de la tienda.
- Cantidad, cupón, importe, registro de venta, stock, reintento idempotente, cantidad insuficiente y cambio de precio.
- Cancelación y contabilidad; cancelación no implica devolución física ni repone existencias automáticamente.
- Protección de historial y metadatos de operaciones frente a escrituras directas.
- Dos solicitudes HTTP por la última unidad. Un retardo aplicado únicamente al producto sintético permite observar dos procesos PostgreSQL distintos y simultáneos en `pg_stat_activity`; se exige una sola venta y stock cero.
- Permisos de lectura/respuesta de reclamos y exportación privada con MFA.
- Restauración de las tablas operativas sintéticas sobre PostgreSQL real, comparación exacta, continuación de la numeración de reclamos y conservación del acceso Auth/MFA. Se conserva el esquema y Auth del entorno temporal; no equivale a reconstruir un proyecto completo después de perderlo.
- Retirada de ventas y eliminación del producto sintético; se conservan las identidades que impiden descontar de nuevo una operación retirada.

## Ejecución y límites

En GitHub → Actions → **Verify isolated Supabase operations** → Run workflow. También se ejecuta al cambiar el esquema, los instaladores o los archivos relacionados indicados en el workflow. Las pruebas unitarias existentes siguen en su trabajo independiente. El resultado resumido aparece en los registros y en el resumen de la ejecución; una preparación de entorno fallida no cuenta como prueba aprobada.

Esto verifica servicios reales y peticiones HTTP, sin una sesión del administrador de producción. No ejecuta una venta desde la interfaz, comprueba el aspecto visual, prueba el CAPTCHA público del Libro, envía pedidos por WhatsApp ni certifica capacidad del proyecto gratuito alojado. Esas condiciones permanecen pendientes en el [plan de preparación](plan-preparacion-produccion.md).

Referencias: [desarrollo local de Supabase](https://supabase.com/docs/guides/local-development), [configuración de MFA local](https://supabase.com/docs/guides/local-development/cli/config), [enrolamiento MFA](https://supabase.com/docs/reference/javascript/auth-mfa-enroll).
