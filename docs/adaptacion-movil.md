# Revisión de adaptación móvil

Comprobación del 4 de octubre de 2026 sobre la exportación estática de
`npm run build:cloudflare`, servida localmente y revisada en el navegador.

## Ajustes

- En móvil, la cabecera ocupa una sola fila con menú hamburguesa, marca y acciones.
  El menú incluye Inicio, Catálogo, Audífonos y redes sociales; cierra al seleccionar
  un enlace, pulsar Escape, tocar fuera o cambiar a escritorio. El total permanece
  visible en la bolsa y en la cabecera de escritorio.
- La portada móvil usa una altura compacta y texto proporcionado a la pantalla.
  La portada y el encabezado del catálogo están centrados en móvil. Se conservan
  la fotografía, las categorías, la paleta y la composición de escritorio.
  El bloque de portada queda centrado también en altura, debajo de la cabecera,
  y el botón «Ver catálogo» muestra únicamente el texto. El título es
  «Tecnología para tu día a día».
- El pie tiene fondo negro y marca blanca, con redes junto a la marca y enlaces
  agrupados en Tienda y Atención. Los enlaces legales dejan espacio para WhatsApp.
- La cabecera de catálogo y producto es negra; Inicio mantiene la cabecera sobre
  su fotografía. El menú móvil es un panel compacto con iconos y bordes suaves,
  con altura limitada y desplazamiento para pantallas pequeñas.
- Búsqueda y orden tienen controles legibles, sin desbordar el catálogo.
- Favoritos, colores, filtros y botones de compra tienen áreas táctiles mayores.
- Bolsa y filtros permiten desplazamiento; el cupón cabe en pantallas pequeñas.
- La compra rápida muestra el precio completo del producto usado en la prueba.
  Usa fondo negro y botón verde, y comparte su altura de 72 píxeles más el área
  segura con la reserva interior del pie. No se agrega un margen blanco exterior.
- La ficha móvil presenta galería, marca/nombre, precio, color y acciones de compra
  antes de la descripción y las especificaciones. En escritorio, la ficha técnica
  permanece debajo de la galería y los datos de compra en la columna derecha.
- La categoría seleccionada aparece en el resumen de filtros, evitando un resumen vacío.

## Comprobaciones manuales

Anchos de 320, 390, 430, 640, 768 y 1440 píxeles: el documento no tiene
desbordamiento horizontal, los enlaces/botones de cabecera caben y el selector
de orden queda dentro de la pantalla.

Se revisaron portada, navegación al catálogo y a Audífonos, filtros generales
y específicos de audio, añadir un producto, favoritos, ficha y bolsa.
En 320 × 568 se alcanzó el botón de pedido desplazando la bolsa. No se envió
ningún pedido ni se modificaron productos o ventas en Supabase.

La consola no mostró errores durante estas comprobaciones. La validación
en tamaños de navegador no sustituye revisar el resultado en dispositivos
Android/iOS reales y con el teclado en pantalla.

Tras ajustar el orden de la ficha, se verificó el producto Huawei FreeBuds SE 2
en anchos de 320, 390, 430, 768 y 1440 píxeles, sin desbordamiento horizontal.
En móvil la ficha técnica comienza después del bloque de información y compra;
en escritorio la galería y ese bloque comienzan a la misma altura. Al seleccionar
Blanco, se actualizan la fotografía, el color del enlace de WhatsApp y la barra
de compra rápida.

Se revisaron la cabecera negra y la unión del pie con la barra de compra en 320,
390, 430, 640, 768 y 1440 píxeles, sin desbordamiento horizontal. En móvil el
elemento inmediatamente encima de la barra pertenece al pie, sin franja externa.
El menú cabe en 320 × 568, cierra con Escape, al tocar fuera y al navegar a
Audífonos. Se quitaron la frase general «Producto 100% Original en Caja Sellada»
y la valoración fija de cinco estrellas de la ficha.
Al cambiar a Blanco y dos unidades, la barra reflejó ambos datos y añadió esa
variante a la bolsa. Se retiró la variante de prueba y no se envió ningún pedido.
