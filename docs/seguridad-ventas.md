# Historial privado de ventas

Las nuevas ventas se mantienen en la memoria del panel mientras está abierto y se guardan en Supabase mediante los permisos de administrador y MFA existentes. No se escriben en localStorage ni sessionStorage. Al salir del panel o perder el acceso, el componente se desmonta y descarta su historial en memoria. Cada nueva entrada al panel vuelve a consultar la nube.

- La carga fallida bloquea las modificaciones para evitar reemplazar el historial remoto con una lista incompleta. Una respuesta vacía confirmada sí representa un historial vacío.
- Registrar, cambiar estado, eliminar y vaciar llaman funciones protegidas de Supabase y esperan una respuesta confirmada. Un error conserva el formulario y la última lista confirmada; no muestra un aviso de éxito ni genera una nota de venta.
- Ante una respuesta de guardado incierta es obligatorio recargar y comprobar el historial antes de reintentar. No se repiten escrituras automáticamente. Los identificadores nuevos usan UUID para evitar colisiones entre pedidos.
- Mientras siga abierto el formulario, una orden cuyo guardado quedó incierto conserva su identificador. Si aparece al recargar, el formulario bloquea su registro repetido; cancelar el formulario permite iniciar otra venta.
- Los clics simultáneos durante el guardado se bloquean en el controlador y en los controles de ventas. Las respuestas pendientes no restauran datos después de salir del panel.
- Una copia antigua de ventas en localStorage puede contener registros sin sincronizar. No se usa para restaurar o sobrescribir la nube ni se elimina al cerrar sesión. El administrador puede descargarla en Ajustes → Respaldos y exportación, comprobarla y eliminarla de ese navegador con confirmación. Hasta que la elimine, esa copia histórica sigue persistiendo en ese navegador.
- Restaurar un JSON de catálogo no guarda ni importa ventas privadas. Los CSV descargados expresamente siguen requiriendo custodia privada.
- La copia operativa cifrada y su recuperación se describen en `docs/respaldos-y-recuperacion.md`. Incluye `sale_operations` junto con el historial y existencias; restaurar ventas llamando a `record_sale` descontaría stock indebidamente. La función de exportación requiere instalación remota independiente.

## Ventas y stock en una transacción

Instalar `supabase/activate-atomic-sales.sql` siguiendo `docs/activar-ventas-seguras.md`. El panel no usa el método anterior para guardar todo el historial ni descuenta stock con una segunda llamada. Si falta la instalación, muestra un error de configuración y no vuelve al mecanismo anterior.

`record_sale` bloquea la fila del historial y el producto, comprueba stock y precio, y guarda ambas modificaciones en una sola transacción. Cambios de estado, eliminación y vaciado también trabajan sobre el historial actual bloqueado, de modo que una pestaña no envía una copia antigua para reemplazar otra venta. La tabla `sale_operations` guarda el identificador y una huella SHA-256 del intento, sin datos de contacto en texto; repetir la misma solicitud devuelve su resultado y no descuenta otra vez. Los códigos retirados no se pueden reutilizar.

Las políticas RLS impiden escrituras directas a `sales_records`; las funciones requieren cuenta administradora y MFA. Las ventas anteriores se conservan y al instalar el SQL no se recalcula ni descuenta su stock.

## Límites y comprobación antes de publicar

El historial sigue siendo un documento en `store_settings` con límite de 10.000 registros: serializar cada cambio es adecuado para una tienda pequeña, pero no sustituye una tabla de ventas e ítems para un catálogo de mayor volumen. Las ediciones de inventario y de productos realizadas fuera del registro de ventas conservan su comportamiento propio; revisa los datos antes de fijar cantidades absolutas.

Cambiar el estado a cancelado, eliminar o vaciar ventas no devuelve stock automáticamente. La reposición requiere verificar físicamente la devolución y ajustar el inventario. Las ventas de productos escritos manualmente no descuentan un producto del catálogo. Abrir un pedido en WhatsApp tampoco reserva existencias.

Comprobar manualmente en la página local: carga normal, venta con existencias, cantidad superior al stock, lectura tras perder conexión, conservación del formulario, reintento del mismo código y recuperación de una copia antigua. Las pruebas de PostgreSQL cubren rollback, permisos, reintentos y dos solicitudes para la última unidad. PGlite usa una sola conexión; esas pruebas no simulan conexiones paralelas reales al proyecto remoto. La instalación y comprobación remotas siguen pendientes hasta ejecutar el SQL.
