# PulsoTech

Tienda de tecnología con catálogo, galerías por color, favoritos, bolsa y atención por WhatsApp. Next.js genera una exportación estática para Cloudflare Pages; Supabase guarda el catálogo y las operaciones administrativas protegidas por MFA.

## Estado actual: preparación para 2027

La configuración predeterminada es `preparation`. La bolsa permite ensayar el flujo y el mensaje de WhatsApp se identifica como prueba. No se registran ventas ni se descuenta stock al abrir WhatsApp. Las páginas llevan `noindex`, robots bloquea el rastreo y el sitemap queda vacío durante esta etapa.

Los productos anteriores son de demostración hasta que se revisen. No se cambiaron sus datos por información inferida de fabricantes.

## Desarrollo y comprobaciones

```powershell
npm ci
npm run dev
node --experimental-strip-types --test tests/*.test.mjs
npm run build:cloudflare
npm run launch:check
```

`predev` y `prebuild` preparan un catálogo público inicial y fotografías locales desde Supabase. Los archivos generados se excluyen de Git. Solo se admite una clave pública anónima: nunca usar una clave de servicio para preparar el catálogo. En preparación, una consulta fallida permite seguir con el catálogo en vivo; en modo ventas impide publicar un catálogo incompleto.

`launch:check` es de lectura y devuelve código 1 mientras existan pendientes. Eso es esperado durante la preparación; no modifica datos ni habilita ventas.

## Activar la preparación comercial en Supabase

Después de las migraciones de seguridad, MFA, ventas atómicas y respaldos, ejecutar **`supabase/activate-commerce.sql`** en el editor SQL del proyecto correspondiente. También se incluye como migración `20261005000000_commerce_preparation.sql`.

El script se puede repetir, oculta los borradores a consultas anónimas, permite leer únicamente los ajustes comerciales públicos y añade esos ajustes al respaldo cifrado. No modifica productos, ventas ni cantidades de inventario. Las operaciones administrativas conservan sus restricciones de MFA.

La interfaz verifica la instalación mediante `commerce_schema_version`. Si falta, bloquea guardar borradores y ajustes comerciales para evitar anunciar una protección que todavía no existe en la base de datos. No usar `supabase_schema.sql` para sobrescribir una base en funcionamiento.

## Cargar información real

En Administrador → Ajustes → Preparación comercial, completar responsable, RUC, dirección, correo, horario, zonas, costo y plazo de entrega. Esa información debe corresponder a la operación real; no publicar datos provisionales como definitivos.

Al editar un producto, el último paso permite elegir:

- **Borrador:** oculto a visitantes, conservado en administración.
- **Demostración:** visible durante preparación y señalado como prueba.
- **Producto real:** exige descripción, fotografías, precio, marca y categoría, garantía, contenido de caja y revisión explícita de la información.

En modo ventas solo aparecen productos reales completos. Los borradores también quedan fuera del catálogo generado y de sus archivos de imágenes. Las condiciones particulares aparecen en la ficha y los datos generales de entrega en la página de políticas.

El administrador indica la resolución de fotografías pequeñas. Conservar originales y subir fotos de al menos 1200 px cuando sea posible: ampliar una imagen pequeña no recupera sus detalles. No se reemplazan ni se inventan las imágenes del producto.

## Abrir ventas a inicios de 2027

1. Completar datos del negocio y revisar las políticas publicadas, incluida la regla actual de cambios voluntarios. Definir condiciones reales de cada producto.
2. Habilitar y probar el Libro de Reclamaciones siguiendo `supabase/activate-complaints.sql` y su función protegida con Turnstile. Verificar atención y respuesta desde administración.
3. Elegir dominio y correo del negocio; revisar los enlaces actuales de redes sociales. Configurar monitoreo y analítica con las cuentas del negocio antes de invertir en campañas.
4. Probar celular y escritorio: elegir color, revisar galería, favoritos, cantidades, cupones, dirección y referencia. Probar actualización de precio y falta de stock. Ensayar el mensaje de WhatsApp sin enviar una compra involuntaria.
5. Verificar recuperación de un respaldo cifrado en una base de prueba. No restaurar sobre una base con ventas activas.
6. En el entorno de publicación, configurar `NEXT_PUBLIC_STORE_MODE=live`, `NEXT_PUBLIC_STORE_URL` con la URL definitiva, `NEXT_PUBLIC_STORE_RUC` con el RUC real y `NEXT_PUBLIC_COMPLAINT_BOOK_ENABLED=true`. Mantener la protección CAPTCHA y sus claves existentes. Las claves privadas de Turnstile permanecen únicamente en Supabase.
7. Volver a publicar; activar pedidos en Preparación comercial después de completar los requisitos. Ejecutar `launch:check` con el mismo entorno de publicación y una prueba operativa final.

Abrir WhatsApp prepara una solicitud; **no confirma que el cliente la haya enviado ni que la compra esté aceptada**. La disponibilidad, transporte y fecha se confirman con el cliente. Registrar una venta confirmada en administración utiliza la operación atómica existente, que verifica stock y evita descontarlo dos veces. Nunca tomar una visita o apertura de WhatsApp como una venta automática.

No fijar fecha de apertura ni prometer condiciones que todavía no estén definidas.

## Catálogo, rendimiento y buscadores

Los productos presentes al publicar tienen páginas `/productos/<id>/` con título, descripción, enlace canónico e imagen para compartir. Los enlaces antiguos `/producto/?id=...` siguen funcionando; los productos nuevos usan ese enlace hasta la próxima publicación.

El catálogo inicial reduce la espera por la consulta de la nube. Se refresca en segundo plano y la bolsa vuelve a comprobar stock y precios antes de continuar. No se considera el catálogo estático una reserva de inventario.

Los datos estructurados Product/Offer se generan únicamente en modo ventas para productos reales verificados, sin inventar reseñas o valoraciones. Cambiar la ficha en administración actualiza la tienda en vivo, pero hay que volver a publicar para actualizar HTML, sitemap e información de enlaces compartidos. Evitar campañas con fichas cuyos metadatos aún no se hayan republicado.

## Operación

Revisar existencias, solicitudes y reclamos durante el horario de atención. Generar un respaldo cifrado después de cargas importantes y periódicamente según el volumen; guardarlo fuera del repositorio. `npm run backup:verify -- <archivo>` ayuda a preparar una recuperación sin publicar datos personales.

Las comprobaciones automáticas no sustituyen la definición real de garantías, atención, entrega ni la prueba completa de operación. No habilitar ventas solo porque una compilación terminó correctamente.
