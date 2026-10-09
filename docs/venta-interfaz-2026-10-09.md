# Venta controlada desde el panel — 8 y 9 de octubre de 2026

El propietario autorizó expresamente usar un producto temporal oculto en el Supabase actual para comprobar creación, edición, venta y cancelación. El ensayo comenzó el 8 de octubre y continuó después de medianoche, hora de Lima. No fue un entorno aislado: se usó el panel publicado con la sesión administrativa real.

## Registros del ensayo

- Producto temporal `486457`, «Verificación interna 2026-10-08»: oculto, dos unidades iniciales a S/ 1.00, sin fotos subidas ni mercadería real.
- Venta temporal `VTA-1d77370d-3fc1-412b-a59b-81ab2c25d7a8`: una unidad, S/ 1.00, cliente sintético «Verificación técnica interna». La nota aclara que no hubo cobro, entrega ni cliente real.
- Producto de muestra existente `534777`: cuatro unidades a S/ 100.00; conservado.
- Venta histórica existente: conservada, sin cambiar estado ni datos del cliente.

## Comprobaciones

1. Crear el producto desde la interfaz: confirmación y fila en inventario. Después de recargar, seguía guardado.
2. Editar su subtítulo y guardar manteniendo la visibilidad desactivada. El cambio persistió tras recargar.
3. Consulta anónima con la clave pública, sin sesión administrativa: el ID temporal devuelve cero filas y el producto existente una fila. Ambos HTTP 200. El contador de Ajustes muestra un producto visible pese a dos registros en inventario.
4. Registrar una venta desde el formulario: aparece la nueva orden, cantidad uno y total S/ 1.00. Historial pasa de una a dos órdenes y el importe acumulado de S/ 100.00 a S/ 101.00.
5. Stock temporal baja de dos a una unidad, confirmado después de recargar. Stock existente permanece en cuatro.
6. Cancelar únicamente la nueva orden desde su selector. Su estado pasa a cancelado, sale de ingresos y el acumulado vuelve a S/ 100.00. No repone stock: el producto temporal mantiene una unidad. Esta conducta evita asumir una devolución física por cambiar el estado.

Se encontró un error visual durante la cancelación: la tarjeta conservaba «Pendiente / Contraentrega». Se cambió ese texto por una etiqueta que corresponde al estado real: pendiente de despacho, en camino, entregado y cobrado o cancelado. Cambio `9728fcf`, lint y compilación local aprobados; [validación de GitHub](https://github.com/lxionel/PulsoTech/actions/runs/37886733829) y Cloudflare aprobados. El navegador confirmó «Cancelado» y ausencia de la etiqueta incorrecta tras recargar.

También se observó que el ID largo de una nueva venta comprimía el importe y separaba `S/` del número. Se permitió contraer y envolver el bloque de datos, manteniendo el importe en una sola línea (`f179c61`). Lint y compilación local, [validación de GitHub](https://github.com/lxionel/PulsoTech/actions/runs/37886926925) y publicación en Cloudflare aprobados. El navegador publicado confirmó el importe completo y el estado cancelado en escritorio y a 360 y 390 px, sin desbordamiento horizontal de página.

El enlace directo del producto oculto mostró «Producto no encontrado» en la pestaña de la tienda utilizada para comprobarlo.

## Limpieza y límites

El propietario confirmó la eliminación definitiva de los dos IDs indicados. Se retiró primero la venta cancelada con «Eliminar orden», y después el producto oculto con «Eliminar producto». La interfaz confirmó ambas eliminaciones: inventario de un producto, cuatro unidades, valorización S/ 400.00; historial de una orden, total facturado S/ 100.00 y cero canceladas. Después de recargar, el producto temporal no tiene fila y buscar el ID de la venta temporal no devuelve órdenes; el producto original mantiene cuatro unidades. Ajustes confirma un producto visible, una orden y pedidos pausados. No aparecieron errores de consola durante esta comprobación. No se vació el historial ni se eliminó el producto existente. El sistema conserva la identidad técnica de una operación retirada para impedir que un reintento vuelva a descontar stock; no contiene nombres, teléfonos o direcciones. Por ello la limpieza no significa que toda la base sea idéntica a la referencia inicial.

No se enviaron mensajes, realizaron pagos ni habilitaron pedidos comerciales. El ensayo no incluye subir fotos nuevas, aplicar un cupón desde la tienda pública ni completar la preparación del pedido por WhatsApp con ventas habilitadas. Las pruebas HTTP aisladas de esos cálculos y galerías permanecen separadas. Siguen pendientes los datos comerciales y la activación completa del Libro.

Evidencia privada fuera del repositorio: `D:/Mis_Proyectos/PulsoTech/respaldos-locales/2026-10-08-visibilidad-temporal.json`, `2026-10-09-venta-verificada.jpg`, `2026-10-09-venta-verificada-movil.jpg` y `2026-10-09-ensayo-limpiado.jpg`. Las capturas de ventas solo muestran el registro sintético, filtrado por su ID. Se retiró el script local de comprobación puntual, conservando su informe sin claves.
