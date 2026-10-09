# Recorrido público de compra — 8 de octubre de 2026

Comprobación manual en el navegador integrado sobre `https://pulsotech.pages.dev/`, con JavaScript ejecutándose. Producto de muestra `534777`; sus datos no se consideran información comercial definitiva.

## Resultado observado

| Comprobación | Resultado |
| --- | --- |
| Acceso al producto desde el nombre de la bolsa | Abre `/productos/534777/`. |
| Estado inicial de color | Ninguno seleccionado. Añadir sin escoger muestra el aviso y dirige el foco al selector. |
| Galería negra | Tres miniaturas, incluida la foto del estuche; la tercera abre su imagen correspondiente. |
| Galería blanca | Dos miniaturas, sin mezclar las negras. |
| Cantidad en ficha | Dos unidades muestran total S/ 200.00; el precio unitario permanece S/ 100.00. |
| Añadir a la bolsa | Dos unidades se suman a la blanca existente: tres unidades y S/ 300.00. |
| Límite de stock | Al aumentar a cuatro, total S/ 400.00 y control de aumento deshabilitado. |
| Cupón inexistente | Mensaje «El cupón ingresado no existe», sin descuento. No se creó un cupón real. |
| Comprar desde la barra móvil | Abre la página completa de bolsa con la cantidad elegida. |
| Entrega | Nombre, dirección y referencia son campos separados; selección de transferencia y contra entrega funciona. |
| Editar bolsa y volver a entrega | Conserva los campos dentro de la navegación de la sesión. |
| Recargar | Conserva la bolsa; no conserva los datos de entrega. Estos campos solo viven en memoria. |
| Pedidos pausados | Acción final deshabilitada en escritorio y móvil. No se abrió WhatsApp ni se transmitió un pedido. |
| Consola durante el recorrido | Sin advertencias ni errores registrados en las dos pestañas de prueba. |

## Revisión visual

Escritorio de 1280 px; ficha y bolsa revisadas también a 320 y 360 px, entrega a 360 y 390 px. No se observó desbordamiento horizontal de la página ni imágenes rotas durante estas comprobaciones. Se verificó que el total móvil se muestra en la barra inferior y el total de escritorio en el resumen, evitando repetirlo en ambas superficies visibles.

Se encontró un defecto real a 360 px: el radio de «Transferencia» excedía el borde de su tarjeta (borde del control a 349.94 px, tarjeta a 338 px en la captura medida). Se ajustó la disposición móvil para colocar icono y selector arriba y el texto debajo; escritorio conserva la fila horizontal. Cambio `5244091`, lint y compilación local aprobados. Cloudflare publicó el cambio correctamente y el navegador confirmó la clase nueva y la corrección: a 360 px el selector termina en 325 px dentro de la tarjeta de 338 px. También se midieron ambos controles contenidos a 320 y 390 px, y la disposición horizontal de escritorio a 1280 px.

La captura privada del resultado está fuera del repositorio, en `D:/Mis_Proyectos/PulsoTech/respaldos-locales/2026-10-08-entrega-movil-corregida.jpg`. El ajuste temporal de tamaño del navegador se restableció al terminar.

La [validación de GitHub del cambio](https://github.com/lxionel/PulsoTech/actions/runs/37872638286) también terminó correctamente.

## Datos y límites

La bolsa inicial contenía una unidad blanca de S/ 100.00. Al terminar se devolvió a esa cantidad, se limpiaron los campos ficticios y se conservó contra entrega. No se modificaron productos, precios, stock, ventas, cupones ni ajustes del negocio. Añadir a la bolsa es un estado local del navegador y no reserva stock.

Esta prueba cubre la navegación pública hasta entrega. No completa una venta, no prueba la validación final de formulario con pedidos habilitados, la apertura real del mensaje ni las escrituras desde la interfaz administrativa. Esos pasos siguen pendientes y deben distinguirse de las pruebas HTTP/SQL aisladas ya aprobadas. Los tamaños comprobados tampoco equivalen a todos los dispositivos, lectores de pantalla o condiciones de red.
