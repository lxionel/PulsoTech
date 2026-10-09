# Ejecución del plan — 8 de octubre de 2026

## Referencia y recuperación

- Código de referencia: `090f6c5`; bundle local con historial completo verificado por Git.
- Descarga desde Ajustes → Respaldos & Datos con sesión administrativa y MFA: una copia cifrada con un producto, una venta histórica y cero identidades de operación. La tabla de reclamos no estaba instalada (`null`, no una lista vacía).
- Restauración de esa copia en PostgreSQL embebido temporal; comparación de todas sus tablas aprobada. Se comparan instantes de fechas sin perder microsegundos, aunque cambie su representación de zona horaria.
- El respaldo y su clave exclusiva están fuera del repositorio, en `../respaldos-locales/` y `../claves-respaldo/`. La clave se generó solo para cifrar la copia; no modifica la cuenta, no se imprimió y no se envió a Supabase. Trasladar la clave a un gestor privado y conservar otra copia cifrada fuera del equipo.
- Tras instalar el módulo de reclamos, una consulta de lectura por Supabase CLI obtuvo una instantánea consistente de las mismas tablas operativas. Se cifró en memoria y se guardó como `2026-10-08-post-reclamos.pulsobackup`, sin volcar datos privados en claro. Se descifró el archivo guardado y se restauró en una base nueva en memoria: todas las tablas coinciden. Productos, ajustes y operaciones conservan exactamente el contenido de la copia anterior; reclamos cambia de módulo ausente (`null`) a instalado y vacío (`[]`). [Evidencia resumida](evidencia-respaldo-2026-10-08.json). Falta custodia fuera de este equipo y recuperación del servicio completo.

## Panel con sesión real

Se consultaron inventario, edición, precios/stock, ficha técnica, marcas/categorías, cupones, ventas y ajustes. Se cargaron dos archivos a una galería de color dentro del formulario: pasó de tres a cinco fotos; se eliminaron las dos añadidas y se probó el orden. Se abandonó el formulario sin guardarlo.

Una venta de cinco unidades, con cuatro disponibles, se rechazó antes de escribir. Un importe negativo también se rechazó. No se modificaron precios, stock, ventas, categorías, cupones ni ajustes remotos, ni se enviaron mensajes o reclamos.

Hallazgos corregidos en código:

- Los avisos `alert()` del panel impedían continuar cómodamente y bloquearon la automatización del navegador al validar un formulario vacío. Ahora se presentan dentro de la interfaz, con anuncio accesible y cierre, conservando los datos del formulario. Las confirmaciones de acciones destructivas permanecen.
- Los campos principales de producto tenían rótulos visuales sin asociación. Se asociaron seis etiquetas y se añadieron nombres accesibles a otros 22 controles de precios, ventas, cupones y contacto.
- El enlace directo de teléfono de una orden usaba nueve dígitos sin `51`. Los números locales se normalizan con el prefijo de Perú; los internacionales explícitos conservan el suyo y las entradas inválidas no generan enlaces. No se alteran los registros históricos.
- Un inventario agotado se describía como oculto aunque la visibilidad fuera independiente; ahora indica que no hay unidades.
- El panel de reclamos mostraba «Sin solicitudes» junto con un error de consulta. Ahora distingue indisponibilidad de lista vacía y bloquea guardar respuestas si no pudo consultar.
- Las pestañas de ventas excedían el ancho disponible en pantallas de 320 px. Se permite distribuirlas en varias líneas dentro del contenedor.

La versión publicada `2decd32` pasó CI. El formulario vacío muestra el aviso sin bloquear la página y permite seguir editando; sus seis etiquetas principales funcionan. Se comprobó el formulario de producto a 320 y 390 px, los nombres accesibles del registro de venta, el prefijo del enlace de contacto y la distinción entre error de reclamos y lista vacía. Una segunda copia cifrada, descargada después de la revisión, conserva exactamente todas las tablas de la inicial: no hubo escrituras remotas en las pruebas.

El ajuste publicado `408e109` pasó CI y se verificó a 320 px: las pestañas de ventas permanecen dentro del ancho de la página. La ficha pública no preselecciona color; al elegir Negro muestra tres miniaturas y al elegir Blanco dos. No se detectaron imágenes rotas; dos unidades calculan un total de S/ 200. La bolsa conserva su unidad original y abre como página completa.

## Ensayo operativo sobre la copia

Se crearon únicamente registros sintéticos dentro de la base temporal. Aprobado: bolsa y descuento porcentual; cupón retirado; precio actualizado; venta y stock; reintento sin doble descuento; cantidad insuficiente; comprobación SQL del precio; cancelación y exclusión de ingresos; dos solicitudes por la última unidad; historial anterior intacto. Cancelar no repone existencias automáticamente, según el funcionamiento documentado.

Este ensayo usa el esquema y SQL del repositorio actual. La comparación remota posterior confirmó las definiciones y permisos descritos abajo. No reemplaza una venta desde la interfaz sobre un proyecto descartable equivalente.

## Comparación con Supabase instalado

Se consultaron únicamente metadatos de PostgreSQL en `upovmpudzgtafobtxnfr`, sin ejecutar funciones de venta ni leer registros de clientes. La referencia se construyó en una base nueva en memoria ejecutando el esquema y los instaladores actuales del repositorio (`7d02bb9`).

- Ocho funciones coinciden: `is_store_admin_account`, `is_store_admin`, `lock_sales_history`, `record_sale`, `change_sale_status`, `remove_sale_record`, `clear_sale_records` y `export_store_backup`. Se compararon cuerpo SQL, argumentos y valores predeterminados, retorno, lenguaje, volatilidad, `SECURITY DEFINER`, configuración de búsqueda y permisos efectivos de ejecución anónimos y autenticados. Solo se normalizaron finales de línea y espacio en los extremos del cuerpo.
- En `products`, `store_settings`, `store_admins`, `sale_operations` y `complaints` coinciden RLS, políticas y permisos efectivos por tabla y columna para `anon` y `authenticated`.
- El inventario de funciones propias del esquema público coincide; no se encontraron versiones adicionales u otras funciones propias en ese esquema. Las funciones pertenecientes a extensiones se excluyeron de este inventario.
- [Evidencia resumida y huellas de los cuerpos](evidencia-supabase-2026-10-08.json), sin datos comerciales, credenciales ni contenido de reclamos.

Esto cierra la duda sobre la versión de esas funciones instaladas. No acredita todos los objetos del esquema, la configuración completa de Auth/Storage, la recuperación del servicio ni concurrencia con conexiones independientes.

El segundo proyecto accesible, «lxionel's Project», contiene otra aplicación. Se consultaron metadatos y conteos; no se reutilizó ni modificó. El propietario confirmó que PulsoTech usa el plan gratuito. Se preparó una alternativa con servicios reales en un runner temporal de GitHub; no se creó ningún proyecto alojado ni rama de pago. El recorrido completo de escritura desde la interfaz sigue pendiente.

## Integración en servicios reales temporales

La [ejecución `8e37466`](https://github.com/lxionel/PulsoTech/actions/runs/37868539908) aprobó diez grupos contra PostgreSQL 17, Supabase Auth y PostgREST en contenedores desechables de GitHub Actions. Se crearon cuentas sintéticas por la API administrativa local y se enroló/verificó TOTP realmente; no se falsificaron JWT ni niveles MFA. La cuenta con contraseña sola y un usuario con MFA sin pertenencia administrativa no pudieron registrar ventas.

Por HTTP se comprobó crear/editar/eliminar productos, guardar varias fotos por color, leer únicamente la galería elegida, cupón e importe, venta con descuento de stock, reintento sin doble descuento, rechazo de stock insuficiente y precio desactualizado, cancelación sin reposición automática y protección del historial. Para la última unidad se observaron dos procesos PostgreSQL distintos y simultáneos ejecutando las solicitudes: solo una venta se confirmó y el stock quedó en cero.

También se comprobaron permisos de reclamos/respuestas, exportación privada y restauración exacta de las tablas sintéticas sobre PostgreSQL real. La secuencia de reclamos continuó y las cuentas/acceso MFA se conservaron. Retirar ventas conservó las identidades de reintento. La limpieza de contenedores y volúmenes terminó correctamente. La [validación habitual](https://github.com/lxionel/PulsoTech/actions/runs/37868539965) aprobó 168 pruebas, lint y compilación.

Se usó un runner estándar del repositorio público; sin datos privados de producción, secretos del propietario ni conexiones de este ensayo a proyectos alojados. [Evidencia](evidencia-integracion-supabase-2026-10-08.json) y [procedimiento](pruebas-supabase-aisladas.md). No se ejecutó una venta desde el navegador ni CAPTCHA público, mensajes o recuperación completa de Auth/Storage; no certifica capacidad del plan gratuito.

## Sincronización y primera medición

Los visitantes no mantienen WebSockets del catálogo. Se actualiza al entrar, al volver al foco después de 15 segundos y cada 60–75 segundos con pestaña visible y conexión disponible. El panel conserva Realtime, agrupa ráfagas y tiene refresco periódico de respaldo. Las lecturas automáticas no sustituyen la comprobación de compra ni muestran un nuevo estado de carga en cada intervalo.

Primera pasada HTTP sobre la versión pública previa a publicar estas correcciones: diez clientes, una visita por cliente, 60 solicitudes HTML/JSON, cero errores; p50 231 ms, p95 899 ms, máximo 1.112 ms; 1.206.950 bytes descargados. La consulta pública inicial de preparación es adicional. Datos tomados desde un solo equipo; no se ejecutó JavaScript ni se abrieron conexiones Realtime. No equivale a diez clientes humanos navegando ni certifica capacidad sostenida. Las etapas mayores no se ejecutaron.

La herramienta prepara etapas de 10, 25, 50 y 100 clientes HTTP y se detiene entre etapas ante errores o p95 superior a tres segundos. Confirmar cuotas y un entorno equivalente antes de ampliarlas. En esa primera medición el monitoreo continuo todavía no estaba activado; su activación posterior se documenta abajo.

Comprobación puntual posterior sobre la web publicada actual: un cliente, seis solicitudes, cero errores; p50 293 ms, p95/máximo 585 ms y 120.695 bytes. Inicio, catálogo, ficha HTML, manifiesto de galerías y consultas públicas de productos/ajustes respondieron correctamente a nivel HTTP. Informe local: `../respaldos-locales/2026-10-08-disponibilidad.json`. No ejecuta JavaScript ni acredita el funcionamiento visual, capacidad sostenida o seguimiento permanente.

## Pendientes

### Continuación: panel autenticado, ventas y reclamos

La sesión estaba activa en otra pestaña del navegador integrado; se identificó esa pestaña y se continuó allí. No se solicitó nuevamente credenciales. Inventario inicial y final: un producto, cuatro unidades y una venta histórica conservada.

Desde el formulario de ventas se comprobaron rechazos previos al guardado: cinco unidades con stock de cuatro muestra el aviso de stock insuficiente; total cero muestra el aviso de importe inválido; cantidad 1.5 presenta `stepMismatch` de la validación nativa. El total sugerido pasa a S/ 200.00 con dos unidades. Los valores del formulario se devolvieron a cantidad uno y total sin sobreescritura, y se cerró con Cancelar. No se procesó una venta válida ni se cambió su estado, se retiró historial o se enviaron mensajes.

El formulario se revisó visualmente a 360 px, sin desbordamiento horizontal de página. La edición y navegación mientras se guarda están protegidas por el `fieldset` deshabilitado del área de ventas, revisado en código; no se ensayó una escritura lenta desde la interfaz. Las pruebas existentes de doble envío, lectura no confirmada y respuesta incierta permanecen separadas de esa comprobación visual.

En Ajustes, el Libro de Reclamaciones instalado carga y actualiza correctamente, mostrando cero solicitudes sin errores de consola. El control de recepción de pedidos permanece deshabilitado por los requisitos comerciales pendientes. Se corrigió el indicador que anunciaba «receptor de pedidos activo» para describir el número de atención configurado; el contador de la tienda ahora filtra por visibilidad y usa singular cuando corresponde. La ocultación de productos está cubierta por las pruebas existentes; no se ocultó el producto de muestra para probar el contador en producción.

El cambio `fa7710b` aprobó 17 pruebas relacionadas, lint del archivo y compilación local final. La [validación de GitHub](https://github.com/lxionel/PulsoTech/actions/runs/37885617480) y la publicación de Cloudflare terminaron correctamente. Después de recargar la pestaña autenticada se observaron «Número de atención configurado», «1 producto» y «1 orden»; el control de pedidos seguía deshabilitado y Reclamos cargaba sin solicitudes. Captura privada fuera del repositorio: `D:/Mis_Proyectos/PulsoTech/respaldos-locales/2026-10-08-panel-indicadores-corregidos.jpg`. Se restableció el tamaño temporal del navegador.

La sesión no cierra por sí sola el pendiente de venta completa. Sigue faltando registrar y comprobar una operación válida desde la interfaz en un entorno descartable equivalente, y comprobar atención/entrega. Las operaciones HTTP/SQL aisladas ya aprobadas no deben presentarse como ese ensayo.

### Continuación: recorrido público desde navegador

Se comprobó la tienda publicada con JavaScript: ficha sin color inicial, aviso al añadir sin escoger, tres fotos negras y dos blancas, precio por cantidad, acceso desde el producto de la bolsa, stock máximo de cuatro unidades, cupón inexistente, compra desde la barra móvil y campos separados de entrega. La acción final permanece deshabilitada por la pausa comercial. No se enviaron mensajes ni se modificaron datos del negocio. Bolsa original restaurada a una unidad blanca y campos ficticios limpiados. [Detalle de lo comprobado y sus límites](recorrido-publico-2026-10-08.md).

Se corrigió un desbordamiento del selector de transferencia en su tarjeta a 360 px (`5244091`). Lint y compilación local pasaron; Cloudflare confirmó publicación y se verificó visualmente la corrección a 360 px, contención de controles a 320 y 390 px y conservación de la fila horizontal a 1280 px. No se observó desbordamiento horizontal de página ni errores de consola durante el recorrido. Sigue pendiente una venta completa con pedidos habilitados y el recorrido administrativo de escrituras.

### Continuación: monitoreo y lecturas simultáneas

Por autorización del propietario se activó **Check public storefront availability** cada seis horas, a las 00:17, 06:17, 12:17 y 18:17, hora de Lima. La [primera ejecución desde GitHub](https://github.com/lxionel/PulsoTech/actions/runs/37871467334) aprobó nueve recursos sin reintentos. En la cuenta `lxionel` se verificó la preferencia de Actions: avisos en GitHub y por correo, solo para ejecuciones fallidas. No se provocó un fallo de la tienda ni se comprobó entrega de un correo. No utiliza Codex, modifica datos o intenta reparaciones. [Procedimiento](comprobar-disponibilidad.md).

La [integración ampliada](https://github.com/lxionel/PulsoTech/actions/runs/37871467220) aprobó once grupos: añade 250 consultas en cinco rondas de 25 visitas públicas paralelas, con contenido exacto, cero errores y p95 de visita de 74 ms. Después se ejecutó una pasada pública acotada de 25 clientes: 150 solicitudes, cero errores, p95 781 ms, máximo 807 ms y 3.017.375 bytes. No hubo escrituras ni mensajes. [Evidencia, cuotas y límites](capacidad-y-cuotas.md). El catálogo pequeño y las peticiones sin JavaScript no certifican capacidad sostenida ni navegación real.

Se corrigieron además las advertencias de runtime antiguo en las automatizaciones: acciones oficiales con Node.js 24, CLI oficial fijada en `2.120.0` y runner `ubuntu-24.04`, evitando un cambio automático de distribución. Se mantiene Node.js 22 para ejecutar la aplicación y sus pruebas.

### Continuación: instalación técnica de reclamos

Después de que el propietario completó el acceso de Supabase CLI, se instaló `activate-complaints.sql` en el proyecto configurado y se publicó `submit-complaint` versión 1. Los nueve controles de `verify-complaints.sql` pasaron, con las dos políticas de administración y MFA. Origen permitido: la web pública actual. Preflight válido `204`, origen ajeno `403`, envío vacío `503` por configuración pendiente y lectura anónima `401`. Cero solicitudes creadas; huellas de productos, ajustes y operaciones conservadas. La nueva copia cifrada con el módulo ya se comprobó. Faltan RUC, identidad definitiva, secreto de Turnstile y prueba completa de recepción/constancia/respuesta. La carga visual del módulo administrativo se verificó posteriormente con la sesión activa, según la continuación del panel autenticado.

Pruebas automatizadas en la última ejecución completa: 178 aprobadas, sin fallos; [validación de `f9f1967`](https://github.com/lxionel/PulsoTech/actions/runs/37871736677). Integración aislada y diagnóstico de disponibilidad también aprobados después de actualizar herramientas. Dominio y correo corporativo futuros; horario provisional de 08:00 a 20:00 o 22:00, sin confirmar. Inicio por internet sin local abierto al público; identidad y domicilio que correspondan al negocio todavía pendientes. No se publicaron datos provisionales.

Se retiró la dirección fija antigua de las políticas tras la aclaración del propietario. El nombre y correo de contacto iniciales se conservan mientras se confirma la identidad comercial definitiva.

Datos comerciales y catálogo definitivos; configuración final y prueba completa del Libro ya instalado; escrituras completas desde la interfaz, recuperación de plataforma completa, custodia externa de respaldos, saldo real de cuotas y carga sostenida con navegadores. El seguimiento cada seis horas está activo; falta comprobar entrega efectiva de un aviso. La persistencia HTTP, concurrencia con conexiones independientes y recuperación de tablas operativas ya pasaron en los servicios temporales. Pedidos siguen pausados. Ver [el plan y sus condiciones de cierre](plan-preparacion-produccion.md).
