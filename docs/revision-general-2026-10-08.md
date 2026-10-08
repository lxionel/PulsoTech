# Revisión general — 8 de octubre de 2026

## Correcciones

- Next.js y su configuración ESLint pasan de 16.3.6 a 16.3.8; Sharp pasa de 0.35.4 a 0.35.5. Versiones fijadas y lockfile actualizado. Se corrigen las alertas nuevas de estas dependencias sin cambiar de versión mayor.
- Relojes, cargadores y periféricos ya no quedan bloqueados por constantes en la portada. Cada botón abre su catálogo; las categorías sin productos muestran el estado vacío existente. Los dibujos decorativos no contaminan el nombre accesible del botón.
- Las rutas antiguas de producto consultan únicamente el catálogo visible actual. Ya no rescatan productos eliminados u ocultos desde localStorage ni conservan una ficha anterior después de cambiar el catálogo. Se admite también `/productos/<identificador>/` cuando lo resuelve la página 404.
- Un enlace con ID explícito inexistente ya no abre otro producto porque su slug coincida. Los enlaces que solo incluyen slug siguen funcionando.
- Las fotos subidas deben poder decodificarse, además de cumplir formato, cabecera y tamaño. Se rechazan archivos truncados y fotografías de más de 40 megapíxeles, límite que coincide con el procesamiento de publicación. No se recomprimen los originales durante la carga.
- La elección de color se conserva por nombre tanto en las tarjetas como en la ficha. Reordenar colores en el catálogo en vivo ya no cambia la elección del cliente; retirar o renombrar ese color exige elegir nuevamente. Si se acorta una galería, el contador y las flechas se ajustan a las fotos restantes.
- La función de reclamos obtiene responsable, dirección, correo y RUC desde la configuración comercial guardada. Exige coincidencia del RUC con el entorno de la función y conserva una copia de la identidad en cada constancia. La pausa de ventas no bloquea la atención de reclamos.

## Archivos e imágenes

Se comprobó el grafo de importaciones de 124 archivos TS/TSX/MJS: sin importaciones locales sin resolver ni módulos de `src` ajenos a las convenciones de rutas sin importadores.

Se eliminaron únicamente las copias idénticas `public/apple-icon.png`, `public/favicon.ico` y `public/icon.svg` (8.020 bytes). Los originales en `src/app` siguen generando los tres archivos exportados y sus metadatos; sus rutas se comprobaron después de compilar.

Se verificaron las siete fotos actuales del catálogo, el banner, el SVG de respaldo y los iconos. No se encontraron fotos corruptas. Las siete fotos del producto de prueba tienen entre 225 y 565 px de lado mayor: la baja resolución pertenece a los originales. No se modificaron los productos de prueba, el inventario, las ventas ni los ajustes reales. Se conservaron fuentes, licencias, migraciones y documentación de recuperación.

## Comprobaciones

- 157 pruebas aprobadas; diez casos adicionales sobre rutas, imágenes, colores actualizados en vivo y constancias. Incluyen las pruebas existentes de permisos, MFA, ventas atómicas, concurrencia, cupones, stock, galerías y recuperación de respaldos en base aislada.
- ESLint, TypeScript y compilación estática de Cloudflare Pages aprobados. Exportación de 14 páginas HTML; 43 referencias internas únicas comprobadas, sin destinos ausentes.
- `npm audit --omit=dev`: cero vulnerabilidades. La auditoría completa mantiene cinco alertas de la cadena de ESLint que depende de `braces` 3.0.3. No existe una versión corregida de ese paquete en el registro durante esta revisión. No se aplicó el retroceso de versión mayor sugerido por `npm audit fix --force`.
- Navegador público: portada, menú, categoría Audífonos, producto, galerías por color, favoritos, bolsa completa, cupón inválido, cantidades, entrega separada de referencia, políticas y acceso administrativo. Se comprobó el cambio de una a dos unidades: precio unitario S/100 y total S/200. Se restituyeron la bolsa original (Blanco, una unidad) y los favoritos vacíos.
- Revisión a 320, 390, 768 y 1440 px sin desbordamiento horizontal ni imágenes rotas en las vistas consultadas. En la versión publicada se verificaron también las tres categorías desbloqueadas, sus indicadores activos, los estados vacíos, los filtros de precio y la compatibilidad del enlace antiguo `/producto/huawei-freebuds-se-2/`.
- La verificación Turnstile del acceso administrativo se completó. Su iframe emitió mensajes técnicos propios; no se observaron errores de ejecución de la aplicación en las vistas públicas revisadas.

## Alcance y pendientes

La revisión automática recorre el código y las referencias; la revisión manual se centra en los flujos y casos descritos. No equivale a demostrar que todos los estados posibles estén libres de errores. No se inició sesión como propietario, no se registraron ventas ni reclamos y no se enviaron mensajes por WhatsApp.

La corrección de `submit-complaint` queda en el repositorio y está probada con solicitudes aisladas. Cloudflare publica la web, pero no esta función de Supabase: se debe desplegar su versión actual desde una sesión autorizada de Supabase antes de habilitar el libro. No hay un despliegue de esa función confirmado en esta revisión.

`launch:check` confirma un producto visible y pedidos pausados. Siguen pendientes los datos comerciales reales (responsable, RUC, dirección, correo, horario y entrega), garantía y contenido de caja del producto, configuración del Libro de Reclamaciones y prueba operativa con sesión administrativa antes de empezar a vender. No se inventaron datos ni se habilitaron ventas.

Referencias de los parches: [aviso de Next.js](https://github.com/advisories/GHSA-cjq9-62q9-8jv4), [aviso de Sharp](https://github.com/advisories/GHSA-wq5f-xc86-pv6w). Dependencia de desarrollo pendiente: [aviso de braces](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
