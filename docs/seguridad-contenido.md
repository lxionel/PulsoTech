# Validación del contenido del catálogo

El panel conserva el diseño actual y valida antes de guardar un producto o restaurar un respaldo local.

- Las imágenes que se cargan desde un archivo admiten JPG, PNG, WebP y GIF, con un máximo de 2 MB. Se comprueba el tipo y su cabecera; no se admiten archivos SVG ni HTML subidos desde el panel. Los SVG locales que forman parte de la aplicación siguen disponibles.
- Las direcciones de imágenes admiten rutas locales, HTTP/HTTPS sin credenciales e imágenes rasterizadas en base64. Las direcciones con protocolos ejecutables o rutas de red ambiguas se rechazan. Al mostrar una dirección no admitida se usa la imagen de sustitución.
- Los videos de YouTube se reconocen por su dominio exacto y un identificador válido. El reproductor incrustado usa youtube-nocookie.com. Los videos directos deben usar HTTP o HTTPS sin credenciales. Para publicación se recomienda HTTPS en todos los recursos externos.
- Los archivos de respaldo deben ser JSON, de como máximo 10 MB y 1000 productos. Se validan tipos, precios, stock entero, códigos únicos y campos anidados. Las marcas, categorías y ventas opcionales también se validan. La restauración solo aplica al catálogo: las ventas opcionales de archivos antiguos no se importan ni se almacenan en el navegador. Un respaldo no puede restaurar configuración de Supabase, sesiones o permisos de administrador.
- Si falla una escritura por falta de espacio, la restauración local revierte las escrituras que ya completó. La confirmación sigue indicando que afecta a los datos locales. Esta función no restaura la base de datos de Supabase: el catálogo de la nube puede volver a reemplazar la copia local al sincronizar.
- Las exportaciones CSV escapan comillas, separadores y saltos de línea, y neutralizan el inicio de fórmulas en los campos de texto. Las descargas incluyen los caracteres especiales completos, incluidos `#` y `%`.

Estas validaciones del navegador evitan archivos incompatibles y contenido problemático durante el uso del panel. No sustituyen la autorización ni las restricciones de la base de datos: las políticas RLS y la doble verificación siguen protegiendo las operaciones privadas. Los respaldos descargados y los CSV con datos de clientes deben conservarse en un lugar privado. El respaldo JSON actual contiene el catálogo; no es una copia completa del proyecto de Supabase.

Referencia: [validación de archivos de OWASP](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).
