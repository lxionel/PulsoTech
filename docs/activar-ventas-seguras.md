# Activar ventas y stock en una transacción

El código y las pruebas están preparados localmente. Esta tarea no ha ejecutado cambios en tu proyecto remoto de Supabase. Este paso no requiere RUC ni claves privadas nuevas.

1. Entra a tu proyecto PulsoTech en Supabase. El administrador y MFA deben estar activados previamente.
2. En SQL Editor → New query, pega **todo** `supabase/activate-atomic-sales.sql` y pulsa Run. El script incorpora las funciones y sus permisos dentro de una transacción; no modifica productos, existencias ni ventas anteriores al instalarse.
3. Comprueba que termine sin errores y recarga el panel administrativo. Si aparece un error, conserva su texto y no cambies las políticas para dar acceso público.
4. Registra una venta real cuando corresponda y comprueba su historial y stock. Para probar antes, crea un producto claramente identificado como prueba con una unidad, registra su venta, comprueba que quede en cero y retira los datos de prueba manualmente. No uses un producto real para simular ventas.

## Qué cambia

- La orden del catálogo y el descuento de unidades son una sola operación. Si una parte falla, toda la operación se revierte.
- El servidor valida producto, cantidad, importe, estado y disponibilidad. Si se usa el precio del catálogo y cambió, solicita actualizarlo; un importe personalizado es una decisión explícita del administrador.
- No se permite vender más unidades que las existentes. Repetir una solicitud confirmada con el mismo código no duplica la orden ni vuelve a descontar.
- La interfaz aplica el stock devuelto por Supabase; no envía un segundo descuento. Cambiar estados o retirar ventas actúa sobre el historial actual sin sobrescribir órdenes de otra pestaña.
- El historial continúa siendo privado y las funciones comprueban cuenta administradora y MFA. La nueva tabla `sale_operations` no tiene lectura ni escritura desde el navegador y contiene únicamente códigos, huellas del intento y referencia del producto.
- Si todavía no instalaste las funciones, el registro muestra el archivo que debes ejecutar; no utiliza el guardado antiguo como alternativa.

## Cuidado con instalaciones posteriores

La instalación es repetible. Si vuelves a ejecutar el esquema base o los antiguos scripts de activación de administrador/MFA, ejecuta **después** este archivo: esos scripts antiguos reinstalan las políticas anteriores de `store_settings`. La migración equivalente es `supabase/migrations/20261004010000_atomic_sales.sql`.

Cambiar una orden a cancelada o eliminarla no repone unidades; la devolución física y la reposición se revisan por separado. Una nota imprimible de pedido no sustituye una boleta o factura. El registro manual fuera del catálogo no descuenta existencias de un producto.

El límite actual es de 10.000 ventas. Antes de crecer se recomienda migrar a ventas e ítems individuales y preparar respaldos de la base de datos. El respaldo JSON de catálogo no es un respaldo de estas operaciones.

Referencias de implementación: [funciones de base de datos de Supabase](https://supabase.com/docs/guides/database/functions) y [bloqueos de filas y transacciones en PostgreSQL](https://www.postgresql.org/docs/current/explicit-locking.html).
