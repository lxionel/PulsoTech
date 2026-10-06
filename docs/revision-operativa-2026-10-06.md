# Revisión funcional — 6 de octubre de 2026

## Correcciones

- Un formulario de producto conserva el stock y la versión de cuando se abrió. La escritura en Supabase requiere que ambos sigan coincidiendo; un conflicto no sobrescribe stock ni galerías y conserva el formulario. Los controles de stock conservan también la versión confirmada. Crear, editar y exportar catálogo requieren haber cargado el inventario de la nube.
- La bolsa empieza sin descuentos inventados. Una lectura fallida de cupones no se convierte en una lista vacía que el administrador pueda sobrescribir. Se valida su formato y se consultan otra vez cupones y contacto receptor antes del pedido. Si la oferta cambia, se actualiza el total y se pide revisarlo antes de continuar.
- Los precios, descuentos y totales se calculan en céntimos. Un precio inválido bloquea el pedido.
- La bolsa guardada se valida al recuperarla: se conservan las líneas válidas, se unen duplicados del mismo color y se rechazan entradas dañadas. Las fotografías se recuperan de la ficha vigente.
- Las órdenes canceladas siguen en el historial y se excluyen de ingresos, promedio, unidades vendidas, distribución por canal, productos más vendidos y gráficos. Cancelar no repone stock automáticamente; la interfaz lo indica para que se revisen las unidades devueltas. El estado inicial de una venta nueva ya no permite cancelar mientras descuenta unidades.
- El registro manual valida cantidades, total, fecha y hora sin convertir una fecha imposible en otra. Un producto que ya no existe no se reemplaza por el primero del catálogo.
- La exportación de ventas respeta los filtros, incluso cuando no hay coincidencias.
- Se retiró la restauración JSON del navegador porque no restauraba la base de Supabase. Se conserva exportación de catálogo y respaldo cifrado, verificación y recuperación en una base vacía independiente.

## Comprobaciones

Se ejecutan pruebas de comportamiento de edición concurrente, galerías generales y por color, cantidades entre colores, cupones retirados o modificados, importes, datos guardados dañados y cancelación. Las transacciones y permisos se prueban en PostgreSQL aislado mediante PGlite.

La suite también comprueba registro atómico de ventas, reintentos sin doble descuento, rollback ante un fallo, ventas que compiten por la última unidad, acceso administrativo con MFA, protección de ventas y reclamos, cifrado y descifrado del respaldo y recuperación exacta de stock e identidades de venta en una base vacía. No se registran ventas ni se modifican productos de la tienda activa para ejecutar estas pruebas.

Los recorridos públicos y la presentación se verifican en la versión publicada, en celular y escritorio. No se envían mensajes ni pedidos por WhatsApp. La interfaz administrativa autenticada necesita la sesión del propietario para una comprobación manual final; las pruebas aisladas no sustituyen esa comprobación ni un ensayo de recuperación en un proyecto independiente de Supabase.

Los datos del negocio, productos de venta, garantías y entrega siguen pendientes de la información real del propietario. No se habilitan pedidos ni se modifica la base de datos durante esta revisión. Las correcciones utilizan columnas y políticas ya instaladas, sin un SQL adicional.
