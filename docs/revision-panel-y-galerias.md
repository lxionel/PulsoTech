# Revisión del panel y galerías — 4 de octubre de 2026

## Fotos

- `Product.images` contiene las fotos generales del producto.
- `ProductColor.images` contiene únicamente las fotos de ese color. `image` conserva la primera foto para mantener compatibilidad con el carrito y los productos anteriores.
- La ficha abre las fotos generales. Elegir un color cambia a su galería y vuelve a la primera foto. «Ver fotos generales» recupera la galería general.
- Las tarjetas usan fotos generales inicialmente; después de elegir un color, su portada y segunda foto pertenecen a ese color.
- El administrador permite seleccionar varios archivos, añadirlos sin reemplazar los anteriores, reordenar, elegir portada y eliminar fotos. Se mantienen los límites de 30 fotos por galería y 2 MB por archivo, con validación del contenido y del formato.
- Los colores nuevos empiezan sin fotos. Una variante sin fotos muestra el marcador de imagen vacía, nunca la imagen de otro color.
- El campo `colors` ya es JSONB y `images` ya existe en Supabase: este cambio no requiere ejecutar SQL.

## Correcciones del panel

- Productos, stock, marcas, categorías, cupones y WhatsApp esperan confirmación de Supabase. Una respuesta fallida conserva el formulario o los datos anteriores y comunica el error.
- Crear un producto usa INSERT para impedir que un código duplicado sobrescriba otro producto. Editar usa UPDATE y comprueba que exista; el código no se modifica durante la edición.
- Las galerías generales completas y las de cada color se conservan al editar y en las copias del catálogo.
- Se eliminan valores inventados al guardar o leer: valoración de cinco estrellas, una reseña, diez unidades, peso, latencia, driver, perfil de sonido y afirmaciones de originalidad. Se conservan valoraciones y metadatos existentes.
- Se elimina el selector de etiquetas promocionales que solo cambiaba la vista previa. El precio regular y de oferta sí se guardan y se validan.
- Los cupones rechazan valores inválidos y porcentajes mayores al 100%; una lista vacía en Supabase permanece vacía al recargar. Pausar/eliminar un cupón actualiza su aplicación en la bolsa de esa sesión.
- El stock se guarda al salir del campo o pulsar Enter. Las operaciones se serializan y la base comprueba la cantidad anterior para detectar una venta o modificación concurrente.
- Renombrar una clasificación modifica solo su campo, sin volver a escribir fotos, precios o stock. No se elimina una clasificación usada por productos hasta reasignarlos.
- El número de WhatsApp acepta nueve dígitos con el código de Perú, parte del valor real cargado de Supabase y confirma el guardado. La actualización manual desde la nube comunica fallos reales.

## Comprobación y límites

Se revisaron inventario y editor, galerías, clasificación, cupones, ajustes, ventas, copias, acceso administrativo y presentación móvil. Las pruebas cubren validación de contenido, separación de fotos, conservación en base y respaldo, errores de persistencia, stock concurrente, permisos y MFA, ventas atómicas y recuperación de copias.

Las ventas y copias mantienen sus transacciones y controles anteriores. La comprobación visual del editor se realiza sin guardar productos o ventas de prueba en producción.

Renombrar productos y guardar la lista de clasificaciones son dos operaciones: un fallo intermedio se informa y se actualiza el inventario; no se garantiza una transacción entre ambas tablas. Las fotos siguen almacenándose como datos en JSON, por lo que un catálogo con muchas imágenes puede necesitar almacenamiento de archivos dedicado; la copia JSON manual mantiene su límite de importación de 10 MB. Esta revisión no constituye una garantía de ausencia de errores ni una auditoría externa de seguridad.
