# Seguridad del alojamiento y preparación de Cloudflare Pages

## Estado

La configuración se prepara localmente; no se ha publicado una nueva tienda ni modificado una cuenta de Cloudflare. No se ha comprobado todavía en un navegador el CAPTCHA, inicio de sesión, navegación y videos del sitio público con estas cabeceras. Las pruebas de archivos y compilación no sustituyen esa comprobación.

El proyecto exporta HTML estático. `headers()` de Next.js y un Proxy con nonces por petición no son compatibles con esta exportación; las cabeceras HTTP deben configurarse en el alojamiento. `npm run build` ahora ejecuta un paso posterior que lee el HTML generado y produce `out/_headers` para Cloudflare Pages, junto con una CSP en el HTML.

La configuración por defecto conserva `/PulsoTech` para el build anterior. Para Cloudflare Pages usa **`npm run build:cloudflare`**, que genera enlaces y recursos desde `/`. No subas a Cloudflare un build generado con el prefijo anterior. No se necesita pagar un dominio propio para preparar un sitio `pages.dev`; sus límites deben comprobarse al crear el proyecto ([límites oficiales](https://developers.cloudflare.com/pages/platform/limits/)).

## Protecciones preparadas

- CSP para scripts: permite archivos de la propia tienda, Turnstile y las huellas SHA-256 de los scripts inline emitidos por Next.js en ese build. No permite `unsafe-inline`, `unsafe-eval` ni manejadores HTML para **scripts**.
- Conexiones: permite el origen HTTPS configurado de Supabase, su WebSocket Realtime y Turnstile. No permite conexiones arbitrarias a otros proyectos. Los enlaces de WhatsApp y redes son navegación a otra página, no conexiones de la aplicación.
- Marcos: permite Turnstile y el reproductor de YouTube con `youtube-nocookie.com`; impide que otro sitio incruste PulsoTech mediante `frame-ancestors` y `X-Frame-Options`.
- `nosniff` para respetar tipos de recursos, política de referencia limitada, restricción de cámara/micrófono/ubicación/pagos/USB y HSTS para HTTPS. No se activa preload ni se impone HSTS a subdominios independientes.
- Documentos del panel: `Cache-Control: no-store` y `X-Robots-Tag: noindex, nofollow`. Esto no sustituye Auth/MFA/RLS ni convierte la dirección del panel en una contraseña.

El diseño actual usa estilos inline de React, que siguen permitidos para **CSS**. Las imágenes y videos HTTPS externos siguen permitidos para que el administrador pueda usar recursos externos, junto con imágenes base64 y vistas previas locales. Estas concesiones están limitadas por tipo de recurso y no permiten ejecutar JavaScript externo arbitrario.

Las huellas se regeneran en cada build. Publica HTML, archivos `_next` y `_headers` del **mismo** build. No uses nonces constantes ni una copia de las cabeceras de otro build. Si se supera el límite de tamaño de una línea de Cloudflare, el build falla; el generador no desactiva la política ni la trunca.

La CSP incluida en HTML se aplica a cargas directas del documento incluso en un host estático que ignore `_headers`. **No equivale a todas las cabeceras HTTP:** `frame-ancestors`, HSTS, `nosniff` y las reglas de caché necesitan soporte del alojamiento. Los valores solo se aplicarán realmente cuando el sitio esté publicado y se comprueben sus respuestas.

## Preparar una publicación en Cloudflare Pages

Cloudflare Pages permite configurar estas cabeceras en archivos estáticos mediante `_headers` ([documentación](https://developers.cloudflare.com/pages/configuration/headers/)). GitHub Pages tiene restricciones para tiendas y negocios en línea ([condiciones oficiales](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)); conserva GitHub para el código y prepara un alojamiento adecuado antes de iniciar ventas. El flujo de GitHub ahora solo comprueba pruebas y compilación para Cloudflare; no publica en GitHub Pages ni modifica su rama anterior. La publicación la gestiona el proyecto de Cloudflare.

Antes de publicar revisa los archivos locales y confirma qué versión del repositorio se usará. Esta tarea no hace push ni inicia despliegues.

Configuración para un proyecto de Pages con integración Git:

- Repositorio: PulsoTech; usa la carpeta que contiene `package.json` como raíz del proyecto, no una carpeta exterior sin el archivo.
- Comando de build: `npm run build:cloudflare`.
- Directorio de salida: `out`.
- Node.js: 22.
- Configuración pública de Supabase: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`, con la clave **publicable**, nunca `service_role` ni una secret key. Deben corresponder al proyecto PulsoTech. El código tiene valores públicos por defecto; usa variables explícitas si preparas un entorno distinto.
- CAPTCHA: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` y `NEXT_PUBLIC_REQUIRE_ADMIN_CAPTCHA=true`. La clave secreta permanece en Supabase. No publiques el administrador con CAPTCHA desactivado por omitir estas variables.
- Libro de Reclamaciones: conserva `NEXT_PUBLIC_COMPLAINT_BOOK_ENABLED=false` mientras su instalación y formalización sigan pendientes. No inventes un RUC.

No hace falta fijar `NEXT_PUBLIC_BASE_PATH` al usar el comando de Cloudflare: este lo establece vacío tanto para Next.js como para el código del cliente y el paso de cabeceras. Los cambios en variables públicas requieren un nuevo build.

La integración Git genera builds con cada actualización según las reglas elegidas en Cloudflare. Para un ensayo evita apuntar a la rama activa si no quieres publicar sus cambios automáticamente. La primera publicación y la modificación del alojamiento se coordinan por separado.

## Comprobación del sitio publicado

1. En DevTools → Network, recarga desde la URL HTTPS pública y revisa el documento HTML: debe devolver las cabeceras indicadas. En la URL del administrador deben aparecer también `no-store` y `noindex`.
2. Autoriza el hostname público exacto en Turnstile; no autorices todos los dominios. Registra el enlace HTTPS del panel en las URL de redirección de Supabase Auth y actualiza el Site URL. Hazlo antes de probar recuperación de contraseña.
3. Prueba entrar directamente al panel, cambiar de pestaña, navegar desde la tienda al panel y volver. Comprueba contraseña, CAPTCHA, MFA y cierre de sesión.
4. Prueba inicio, catálogo, categorías, imágenes, favoritos, bolsa, comparación, enlaces compartidos y reproducción de video. Revisa la consola por infracciones CSP. Prueba descargar/verificar una copia cifrada.
5. Comprueba también una ruta inexistente para verificar el documento de error. Cloudflare puede servir el 404 a una URL que no coincide con una regla específica: la política global debe cubrirlo.
6. Si aparecen recursos bloqueados, identifica la URL y la función concreta antes de adaptar la política. No añadas comodines de scripts, `unsafe-eval` o `unsafe-inline` para scripts como solución general.

El CAPTCHA de un entorno de prueba y el dominio público requieren hostnames autorizados distintos. La política estática no se aplica a `next dev`: el servidor de desarrollo necesita mecanismos propios y no es una prueba de cabeceras de producción.

Referencias adicionales: [Next.js estático en Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/) y [CSP compatible con Turnstile](https://developers.cloudflare.com/turnstile/reference/content-security-policy/).
