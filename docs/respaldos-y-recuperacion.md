# Respaldos de PulsoTech y recuperación

## Estado y activación

La recuperación se prueba con PostgreSQL embebido (PGlite). El 8 de octubre de 2026 se descargó una copia cifrada con la sesión administrativa y se restauró en memoria, conservando sus tablas. El ensayo operativo se ejecutó sobre esa copia sin escribir en Supabase; consultar [los resultados](validacion-operativa-2026-10-08.md). No hay una tarea automática de respaldos configurada.

Después de instalar reclamos se obtuvo otra copia mediante una única consulta de lectura con la sesión autorizada de Supabase CLI. Se cifró antes de escribirla en disco y se verificaron descifrado y restauración exacta en memoria. Conserva las tablas anteriores e incluye `complaints` instalada y vacía. Archivo privado: `../respaldos-locales/2026-10-08-post-reclamos.pulsobackup`; la clave exclusiva sigue separada del respaldo y fuera del repositorio. [Evidencia sin datos privados](evidencia-respaldo-2026-10-08.json).

1. Abre el [SQL Editor del proyecto PulsoTech](https://supabase.com/dashboard/project/upovmpudzgtafobtxnfr/sql). Comprueba el nombre del proyecto antes de ejecutar.
2. En una consulta nueva, pega **todo** `supabase/activate-backups.sql` y pulsa Run. Requiere que las funciones de administrador/MFA y de ventas seguras ya estén instaladas. La instalación es repetible; no cambia stock, ventas ni permisos de escritura de productos. La migración equivalente es `supabase/migrations/20261004020000_store_backups.sql`.
3. Recarga el panel y abre **Ajustes → Respaldos & Datos → Copia cifrada de la tienda**.
4. Escribe una contraseña exclusiva de al menos 12 caracteres y repítela. Guarda la contraseña en tu gestor de contraseñas, separada de la copia. No se envía a Supabase ni se guarda en el navegador. Si la pierdes, el archivo no puede descifrarse.
5. Pulsa **Descargar copia cifrada**. Comprueba que el navegador haya guardado el archivo `.pulsobackup`.
6. Escribe otra vez la contraseña en el primer campo, pulsa **Verificar copia** y selecciona el archivo que acabas de descargar. Comprueba su fecha y sus cantidades. Este paso verifica cifrado, integridad y formato sin modificar la nube; no sustituye un ensayo real de recuperación.
7. Conserva una copia cifrada en otra ubicación privada fuera de este equipo, por ejemplo una unidad externa o almacenamiento personal protegido. Evita enlaces públicos. La contraseña debe estar disponible en caso de pérdida del equipo.

La copia se solicita expresamente desde la nube con una sesión administradora y MFA. No utiliza el catálogo de localStorage ni una lista antigua de ventas en memoria. La función lee todas las tablas en una misma consulta para que correspondan a la misma instantánea de la base de datos. El formato usa AES-256-GCM y una clave derivada con PBKDF2-SHA-256, 600.000 iteraciones, sal y nonce aleatorios en cada archivo. La verificación no publica los nombres ni contactos de los clientes.

## Qué contiene y qué queda fuera

- Filas de `products`: catálogo, existencias y atributos actuales.
- Ajustes conocidos de `store_settings`: marcas, categorías, WhatsApp, cupones e historial de ventas.
- `sale_operations`: identidades y huellas de los pedidos, incluidos códigos retirados. Conservarlas evita descontar otra vez una venta restaurada. No se regeneran ejecutando las ventas.
- Reclamos y respuestas de `complaints`, **si esa tabla está instalada**. Un valor `null` significa que el Libro todavía no estaba instalado; una lista vacía significa que estaba instalado y no tenía registros.

**Es una copia de datos operativos, no una clonación completa de Supabase.** No contiene cuentas/contraseñas/sesiones de Auth, factores MFA, lista de administradores, secretos de CAPTCHA/SMTP/Edge Functions, archivos de Storage, configuración del alojamiento ni el código fuente. El esquema y las funciones se mantienen en este repositorio. Las imágenes en base64 almacenadas en productos sí se incluyen; los enlaces a imágenes externas no guardan una copia de esos archivos.

La descarga limita a 50 MB los datos sin cifrar. El formato admite hasta 10.000 productos, 10.000 ventas, 100.000 identidades de pedidos y 10.000 reclamos. Si se supera alguno de esos límites o cambia el esquema, utiliza las herramientas de respaldo de base de datos de Supabase y adapta el procedimiento; no descartes registros para forzar una copia.

Los CSV y el JSON de catálogo anteriores conservan su utilidad para reportes y catálogo. La función «Restaurar desde Respaldo JSON» no importa el archivo cifrado ni recupera ventas.

## Frecuencia y custodia

Mientras preparas el negocio, crea y verifica una copia después de un cambio importante y antes de borrar datos. Cuando empieces a vender, realiza una copia al cierre de cada jornada con movimientos. Como pauta inicial, conserva las últimas siete copias diarias y cuatro semanales en una ubicación privada, revisando esa conservación cuando definas tus obligaciones y necesidades reales.

Una vez al mes y después de modificar el esquema, ensaya la recuperación en un proyecto independiente. Anota fecha del archivo, fecha del ensayo, cantidades y resultado sin incluir nombres ni teléfonos de clientes en el registro del ensayo. Las copias no sustituyen el seguimiento de reclamos ni el resguardo de comprobantes.

## Recuperación sin depender de la tienda

La herramienta local requiere Node.js 22.6 o posterior, disponible en este entorno. Funciona incluso si el sitio o Supabase no responden. No solicita la contraseña por chat ni como argumento de terminal.

En una terminal dentro del proyecto:

```powershell
npm run backup:verify -- "C:\CopiasPrivadas\archivo.pulsobackup"
```

Introduce la contraseña cuando la terminal la solicite. No se muestra ni se registra. Verifica fecha y cantidades.

Para preparar el SQL de recuperación, utiliza un nombre de archivo nuevo:

```powershell
npm run backup:verify -- "C:\CopiasPrivadas\archivo.pulsobackup" --sql "C:\CopiasPrivadas\pulso.recovery.sql"
```

La herramienta **solo genera** el archivo y no se conecta a una base de datos. No sobrescribe un archivo existente. El SQL generado contiene datos personales sin cifrar: consérvalo únicamente en una ubicación privada mientras dure el ensayo/recuperación. Las extensiones `.pulsobackup` y `.recovery.sql` y la carpeta `private-backups` se excluyen de Git; evita guardarlo en carpetas públicas o de despliegue.

### Ensayo en un proyecto vacío

1. Crea un proyecto **independiente** de recuperación en Supabase; no uses el proyecto activo de PulsoTech.
2. Instala `supabase_schema.sql` en ese destino vacío. Crea tu cuenta administrativa por Auth y autorízala siguiendo `docs/activar-administrador.md`; configura un nuevo autenticador. La copia operativa no traslada esas identidades.
3. Instala administrador/MFA, **después** `supabase/activate-atomic-sales.sql` y `supabase/activate-backups.sql`. Si la copia tiene `complaints` como lista (incluso vacía), instala también `supabase/activate-complaints.sql`. No actives la Edge Function pública del Libro para un ensayo.
4. Comprueba que `products`, `store_settings`, `sale_operations` y, si corresponde, `complaints` estén vacías. La lista de administradores puede contener la cuenta nueva.
5. Revisa el archivo `.recovery.sql` y ejecútalo completo como propietario desde SQL Editor en **ese destino vacío**. Bloquea las tablas de destino y se detiene sin reemplazar datos si encuentra registros. Una tabla o columna incompatible produce error y revierte las inserciones. Nunca se registran ventas mediante `record_sale` para reconstruir existencias.
6. Compara catálogo, cantidades de stock, total de ventas, identificadores de pedidos y reclamos con la copia. Comprueba por separado que un usuario anónimo no pueda leer ventas/reclamos y que el nuevo administrador necesite MFA.
7. Para un ensayo completo de interfaz, configura una instancia local separada con la URL y la clave **pública** del proyecto de recuperación; verifica permisos, recuperación de contraseña y CAPTCHA. Los secretos se configuran directamente en los proveedores. No cambies la tienda activa hasta verificar el destino.

El SQL de recuperación preserva existencias exactas e identidades de pedidos en una transacción y actualiza la secuencia de reclamos. No elimina registros ni incorpora permisos contenidos en un archivo. Su protección de destino vacío no verifica el nombre del proyecto: comprueba siempre el proyecto en SQL Editor. Volver a instalar el esquema base o MFA después de ventas seguras puede reinstalar políticas antiguas; respeta el orden indicado.

## Respaldo completo de la plataforma antes de publicar

Antes de producción, completa también un respaldo lógico independiente de la base de datos con las [herramientas oficiales de Supabase](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore): roles, esquema, datos, historial de migraciones y personalizaciones de Auth/Storage según corresponda. Usa credenciales solo en tu terminal privada y no en el frontend o repositorio. Supabase CLI `2.120.0` ya está disponible mediante `npx` y autenticada por el propietario. No se encontraron Docker ni `pg_dump` disponibles para el volcado completo; ese volcado todavía no se ha ejecutado. La consulta de copia operativa no lo sustituye.

Los archivos físicos de Storage y las imágenes externas requieren una copia propia. Reúne por separado el código, configuración del despliegue y recuperación de acceso a Supabase, Cloudflare, correo y GitHub. No copies factores MFA por medio del panel de la tienda. Los respaldos de base de datos de Supabase no incluyen los objetos de Storage; para proyectos gratuitos, Supabase recomienda exportaciones y copias externas regulares ([documentación de respaldos](https://supabase.com/docs/guides/platform/backups)).

Referencias técnicas: [instantáneas de PostgreSQL](https://www.postgresql.org/docs/current/transaction-iso.html) y [cifrado autenticado con Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt).
