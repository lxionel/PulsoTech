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
- Búsqueda y orden tienen controles legibles, sin desbordar el catálogo.
- Favoritos, colores, filtros y botones de compra tienen áreas táctiles mayores.
- Bolsa y filtros permiten desplazamiento; el cupón cabe en pantallas pequeñas.
- La compra rápida muestra el precio completo del producto usado en la prueba.
  El pie deja espacio para el botón flotante y el área segura del dispositivo.
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
