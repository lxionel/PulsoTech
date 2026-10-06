# Revisión general de tienda y limpieza — 6 de octubre de 2026

## Correcciones

- Filtros móviles: diálogo nativo que mantiene el foco, cierra con Escape y devuelve el foco al botón. Al pasar a escritorio se cierra y libera el desplazamiento.
- Precio máximo calculado a partir del catálogo, desde S/0. Ya no excluye precios bajos ni limita arbitrariamente la selección a S/180.
- La ordenación «Destacados» coloca primero los productos marcados en administración. Las marcas se comparan por su nombre exacto, sin incluir productos de otras marcas por una coincidencia en el título.
- Tarjetas de catálogo: enlaces de imagen y nombre separados de los botones de colores y favoritos. Se elimina la anidación de controles interactivos dentro de un enlace.
- Favoritos: una tarjeta por fila en celular y menos espacio superior. Las páginas de información también aprovechan mejor el espacio bajo la cabecera.
- Los enlaces de correo de privacidad y atención siguen el correo configurado en administración, con el mismo respaldo existente que la identidad comercial.
- El comprobante administrativo muestra Chimbote y el WhatsApp configurado; se retiraron referencias antiguas a Lima.
- La preferencia de movimiento reducido conserva el centrado de las imágenes.
- El botón flotante de WhatsApp usa su versión compacta en pantallas menores a 1440 px para no cubrir los nombres de categorías en portátiles.
- Revisión de código sin errores ni advertencias. El flujo de GitHub comprueba también ESLint.

## Limpieza

Se retiraron 16 imágenes estáticas sin referencias en código, scripts, catálogo generado ni catálogo público actual: seis banners antiguos, seis fotografías de los productos de ejemplo anteriores, dos logotipos sustituidos por el componente SVG y dos iconos sin manifest ni uso. Total: 7.117.257 bytes.

Se eliminó `Headphone3DModel.tsx`, que no tenía importadores, y las dependencias `three` y `@types/three` (ocho paquetes instalados retirados).

La preparación del catálogo ahora borra únicamente fotografías generadas que no aparecen en las galerías actuales. La primera compilación retiró nueve imágenes antiguas adicionales. Conserva las fotos generales, las exclusivas de color, archivos manuales y el manifiesto. La limpieza no se ejecuta si falla la consulta del catálogo.

Se conservaron el banner actual, las siete fotografías actuales, imágenes de respaldo, iconos de la aplicación, fuentes y sus licencias, pruebas, migraciones, scripts de activación y documentación de recuperación. Las eliminaciones del repositorio son recuperables mediante Git. No se modificaron productos, ventas, inventario ni ajustes de Supabase.

## Verificación

- 147 pruebas automatizadas aprobadas, incluida concurrencia de ventas, acceso privado, MFA, cupones, inventario, galerías y recuperación de respaldo.
- TypeScript y ESLint aprobados; compilación estática para Cloudflare Pages aprobada.
- 460 referencias internas del sitio exportado comprobadas, sin archivos ni páginas ausentes.
- Revisión en navegador público a 320, 390, 640 y 1280 px: navegación, búsqueda, estados vacíos, filtros, galerías, colores, favoritos, cantidades, bolsa completa, entrega y enlaces de información.
- La prueba del navegador conserva la bolsa original y restaura los favoritos. No envía pedidos ni registra operaciones comerciales.
- El acceso administrativo público exige autenticación. La parte autenticada se revisó mediante código y pruebas de base de datos aislada; no se realizó una sesión manual con las credenciales del propietario.

## Pendientes separados de los errores

`launch:check` sigue indicando pedidos pausados y configuración comercial incompleta. Deben completarse los datos reales del negocio, garantía y contenido de caja, y habilitarse y probarse el Libro de Reclamaciones antes de vender. El producto de ejemplo conserva sus datos de prueba.

Se actualizó `source-map-js` a 1.2.2. `npm audit --omit=dev` informa cero vulnerabilidades. La revisión completa informa cinco alertas asociadas a `braces` y a su cadena de dependencias de ESLint; la versión publicada 3.0.3 sigue afectada y no hay parche disponible. No se aplicó la sugerencia de retroceder Next/ESLint a otra versión mayor. Revisar esta dependencia cuando se publique una corrección.
