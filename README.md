# PulsoTech

Tienda de tecnología con catálogo, galerías por color, favoritos, bolsa y atención por WhatsApp. Next.js exporta el sitio para Cloudflare Pages; Supabase guarda el catálogo y las operaciones administrativas protegidas por MFA.

## Administración sencilla

Cada producto tiene una sola opción: **Visible en la tienda**. Desactivarla lo oculta del catálogo, fichas, favoritos y comparaciones. La base de datos también impide leer productos ocultos con acceso anónimo.

Los productos existentes conservan su visibilidad. Las clasificaciones anteriores ya no aparecen en la interfaz. Se mantiene el formato interno de datos compatible con la migración comercial instalada: `storeStatus=draft` significa oculto; los demás valores son visibles. No es necesario ejecutar otro SQL para este cambio.

Un producto nuevo se guarda visible por defecto. Puedes ocultarlo mientras completas sus datos. Garantía, contenido de caja y entrega particular se editan en el formulario normal. Revisar marca, modelo, características, precio y fotografías antes de empezar a vender.

## Datos de la tienda y pedidos

En Administrador → Ajustes → **Tienda y pedidos**, completar responsable, RUC, dirección, correo, horario y condiciones de entrega. La opción **Recibir pedidos por WhatsApp** permite pausar o habilitar solicitudes sin cambiar modos de despliegue. Guardar los cambios para aplicarlos.

Habilitar pedidos exige datos comerciales completos y Libro de Reclamaciones configurado con el mismo RUC. La tienda no inventa valores para completar esos requisitos. Pausar pedidos permite seguir viendo productos, editando la bolsa y completando la entrega; el envío final queda deshabilitado. Antes de abrir WhatsApp se vuelven a consultar disponibilidad, precios y el control de pedidos.

El mensaje de compra mantiene un formato formal. Abrir WhatsApp no confirma que el cliente lo haya enviado ni que la compra esté aceptada. Confirmar disponibilidad, costo de transporte y fecha con el cliente antes de registrar una venta.

La venta registrada en administración utiliza la operación atómica existente, que descuenta stock y evita descuentos duplicados. **Eliminar un registro de venta no repone automáticamente las unidades.** Después de una prueba, revisar el inventario; no borrar ventas reales para corregir stock.

Cancelar una orden la conserva en el historial y la excluye de ingresos, unidades vendidas, canales y gráficos. Revisar aparte las unidades efectivamente devueltas al inventario. Una venta nueva se registra pendiente, en camino o entregada; se cancela desde su orden.

La edición de productos comprueba el stock y la versión que había al abrir el formulario. Si una venta u otra edición los cambió, se rechaza el guardado, se actualiza el inventario y se conservan los datos del formulario para revisarlos. Los cupones y el contacto receptor se consultan nuevamente antes del pedido; un cambio de oferta pide revisar el total. Los importes se calculan en céntimos.

## Desarrollo y comprobaciones

```powershell
npm ci
npm run dev
node --experimental-strip-types --test tests/*.test.mjs
npm run build:cloudflare
npm run launch:check
```

`predev` y `prebuild` generan un catálogo público inicial y fotografías locales desde Supabase. También se obtiene una copia de la configuración comercial pública para generar los metadatos. Estos archivos se excluyen de Git. Solo usar una clave pública anónima, nunca una clave de servicio.

Un error de consulta del catálogo impide publicar una compilación incompleta. En desarrollo se permite consultar el catálogo en vivo si la preparación inicial no está disponible.

`launch:check` es de lectura. Revisa datos del negocio, productos visibles, condiciones, habilitación de pedidos y configuración del Libro de Reclamaciones. Devuelve código 1 mientras existan pendientes, sin modificar datos. No sustituye la revisión de productos ni una prueba completa de la operación.

## Base de datos y seguridad

Para un proyecto nuevo, instalar seguridad administrativa, MFA, ventas atómicas, respaldos y **`supabase/activate-commerce.sql`**. No volver a ejecutar el esquema completo sobre una base que ya está en funcionamiento.

La migración comercial se puede repetir. Oculta productos desactivados, expone solo los ajustes comerciales públicos y añade esos ajustes al respaldo cifrado. No modifica productos, ventas ni inventario. La interfaz verifica su instalación mediante `commerce_schema_version`.

Mantener CAPTCHA y MFA. Para el Libro de Reclamaciones, seguir `supabase/activate-complaints.sql` y la función protegida con Turnstile. Configurar `NEXT_PUBLIC_STORE_RUC` con el RUC real y `NEXT_PUBLIC_COMPLAINT_BOOK_ENABLED=true` después de probar la atención de reclamos. Los secretos de Turnstile permanecen únicamente en Supabase.

## Catálogo, imágenes y buscadores

Los productos presentes al publicar tienen páginas `/productos/<id>/` con título, descripción, enlace canónico e imagen para compartir. Los enlaces antiguos `/producto/?id=...` funcionan; los productos nuevos usan ese enlace hasta la siguiente publicación.

El catálogo inicial reduce la espera por la nube y se refresca en segundo plano. No constituye una reserva de inventario. Mantener originales de las fotografías; el administrador avisa cuando tienen poca resolución. Ampliar una fotografía pequeña no recupera detalles.

El sitio queda fuera de la indexación mientras falten los datos comerciales necesarios. No depende de un modo de prueba. Una pausa temporal de pedidos no elimina una tienda configurada de los buscadores. Los datos estructurados de productos solo se generan para fichas visibles con información comercial suficiente, sin inventar reseñas ni valoraciones.

Los cambios del administrador se reflejan en el catálogo en vivo. Volver a publicar para actualizar el HTML, sitemap y metadatos de enlaces compartidos. Usar `NEXT_PUBLIC_STORE_URL` para la URL definitiva. La antigua variable `NEXT_PUBLIC_STORE_MODE` ya no se utiliza.

## Antes de empezar a vender

Completar datos del negocio, fotografías y condiciones reales. Revisar las políticas, incluida la regla actual de cambios voluntarios. Elegir dominio, correo y redes del negocio, y configurar monitoreo y analítica antes de invertir en campañas.

Probar en celular y escritorio: colores y galerías, favoritos, cantidades, cupones, dirección y referencia, cambios de precio, agotados y envío de la solicitud. Verificar también registro de ventas, stock y atención de reclamos.

Guardar respaldos cifrados fuera del repositorio y ensayar una recuperación en una base separada. `npm run backup:verify -- <archivo>` ayuda a preparar la recuperación sin publicar datos personales. No restaurar sobre una base con inventario, clientes o ventas activas.

La exportación del catálogo JSON es una copia de productos y fotografías; no restaura Supabase desde el navegador. Seguir [la guía de recuperación](docs/respaldos-y-recuperacion.md) para las copias operativas cifradas. Consultar [la revisión funcional](docs/revision-operativa-2026-10-06.md) para los cambios y comprobaciones del panel y la compra.
