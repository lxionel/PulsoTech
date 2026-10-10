# Mejoras de compra y presentación — 10 de octubre de 2026

## Cambios

- Tarjetas sin SKU público ni etiqueta de disponibilidad repetida. Se conserva el estado de agotado, favoritos, selección explícita de color y comparación.
- Filtros compactos con menos de nueve modelos; panel lateral a partir de nueve. Búsqueda con sugerencias de producto, foto y precio.
- Galería a pantalla completa, ampliación, miniaturas, navegación con teclado y gesto horizontal en pantallas táctiles. Las imágenes conservan su proporción y archivo de origen.
- La barra móvil observa todo el bloque de precio y compra. Se oculta al entrar ese bloque en el área visible. El acceso flotante a WhatsApp no ocupa la ficha móvil, que ya tiene su enlace de consulta.
- Comparación de hasta tres modelos, con opción de mostrar diferencias. Los relacionados se limitan a tres productos de la misma categoría y se ordenan por disponibilidad y proximidad de precio.
- Portada con producto elegido expresamente desde el formulario del administrador. No se activa automáticamente con el catálogo de demostración. Si hay varios marcados disponibles, se presenta el primero del catálogo.
- Hasta ocho preguntas y respuestas propias por producto. No se generan respuestas, reseñas ni condiciones comerciales.

## Inventario por color

Se activa por producto en el paso de precios y stock. Todos los colores deben tener una cantidad entera; el total se calcula sumándolas. El stock rápido general pasa a enlazar al editor cuando hay inventario por color.

Los productos anteriores siguen con stock compartido. No se reparten automáticamente las cuatro unidades del modelo existente. La bolsa limita cada color y el servidor descuenta exclusivamente la variante elegida, dentro de la misma transacción que registra la venta. Se mantienen MFA, bloqueo de filas, comprobación de precio y protección de reintentos.

Cancelar una venta continúa sin reponer stock físico automáticamente.

## Seguimiento privado

Cada venta permite crear o renovar un enlace válido durante 90 días. El código aleatorio tiene 64 caracteres hexadecimales y en la base solo se guarda su huella. La renovación invalida el enlace anterior; eliminar la venta retira su enlace.

El enlace usa `/pedido/#codigo=…`, para no incluir el código en la petición de la página ni en la dirección de referencia. La página no se indexa. La consulta devuelve exclusivamente nombre del producto, cantidad y estado: registrado, en preparación, en camino, entregado o cancelado. No devuelve nombre, teléfono, dirección, notas ni el historial del comprador. Quien tenga el enlace puede consultar esos tres datos.

Las huellas y vencimientos están incluidos en el respaldo cifrado y en la recuperación. No se envía ningún mensaje ni se crea ningún enlace para la venta histórica automáticamente.

## Validación

- 188 pruebas locales aprobadas, incluyendo inventario por color, agotados, compatibilidad con productos anteriores, reintentos, permisos, seguimiento, renovación, caducidad y recuperación exacta. Un respaldo antiguo también rechaza un destino ocupado por enlaces de seguimiento.
- Revisión de código y compilación estática aprobadas.
- Extensión aplicada al proyecto PulsoTech mediante `supabase/activate-shopping-experience.sql`. La migración equivalente se conserva en `supabase/migrations/20261010000000_color_stock_and_order_tracking.sql`.
- Se comprueba que los datos del producto #534777 y del historial permanezcan idénticos antes y después de la instalación.

- Integración aprobada en GitHub sobre PostgreSQL, Auth/MFA y PostgREST reales, en contenedores descartables. Dos sesiones compiten por la última unidad de Negro: solo una venta; Blanco conserva su stock. También se comprueban permisos, renovación, vencimiento, limpieza y recuperación de enlaces. [Ejecución de la versión principal](https://github.com/lxionel/PulsoTech/actions/runs/38090325055).
- Navegador publicado: filtros compactos, resultados vacíos y restablecimiento; sugerencias con foto y precio y selección con teclado; color explícito y galería correspondiente; visor completo, ampliación, flechas y Escape en escritorio. En 390 × 844 no hay desbordamiento horizontal; las miniaturas y flechas funcionan en el visor móvil. El precio visible oculta la barra fija, y el salto a especificaciones la muestra al quedar fuera de pantalla. No se envían pedidos ni se modifica la bolsa existente.
- Seguimiento publicado sin código muestra el estado de enlace no disponible, con `noindex, nofollow` y `no-referrer`. El recorrido válido se prueba con datos sintéticos en la integración aislada, sin emitir un enlace para la venta histórica.
- En esta sesión el navegador solicita acceso al panel; los controles administrativos nuevos se validan por compilación y pruebas, sin afirmar un ensayo autenticado de su interfaz. La selección táctil por gesto está implementada, pero no se acredita una prueba física en teléfono.

Las condiciones comerciales reales y la activación de pedidos siguen pendientes del negocio. La portada destacada, las preguntas propias y el inventario separado por color se activan al editar cada producto, con sus datos reales. No se crean reseñas ni se anuncian productos más vendidos sin evidencia.
