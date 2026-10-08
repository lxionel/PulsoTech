# Ejecución del plan — 8 de octubre de 2026

## Referencia y recuperación

- Código de referencia: `090f6c5`; bundle local con historial completo verificado por Git.
- Descarga desde Ajustes → Respaldos & Datos con sesión administrativa y MFA: una copia cifrada con un producto, una venta histórica y cero identidades de operación. La tabla de reclamos no estaba instalada (`null`, no una lista vacía).
- Restauración de esa copia en PostgreSQL embebido temporal; comparación de todas sus tablas aprobada. Se comparan instantes de fechas sin perder microsegundos, aunque cambie su representación de zona horaria.
- El respaldo y su clave exclusiva están fuera del repositorio, en `../respaldos-locales/` y `../claves-respaldo/`. La clave se generó solo para cifrar la copia; no modifica la cuenta, no se imprimió y no se envió a Supabase. Trasladar la clave a un gestor privado y conservar otra copia cifrada fuera del equipo.

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

## Ensayo operativo sobre la copia

Se crearon únicamente registros sintéticos dentro de la base temporal. Aprobado: bolsa y descuento porcentual; cupón retirado; precio actualizado; venta y stock; reintento sin doble descuento; cantidad insuficiente; comprobación SQL del precio; cancelación y exclusión de ingresos; dos solicitudes por la última unidad; historial anterior intacto. Cancelar no repone existencias automáticamente, según el funcionamiento documentado.

Este ensayo usa el esquema y SQL del repositorio actual, no demuestra que cada función remota instalada tenga esa misma versión. No reemplaza una venta desde la interfaz sobre un proyecto descartable equivalente.

## Sincronización y primera medición

Los visitantes no mantienen WebSockets del catálogo. Se actualiza al entrar, al volver al foco después de 15 segundos y cada 60–75 segundos con pestaña visible y conexión disponible. El panel conserva Realtime, agrupa ráfagas y tiene refresco periódico de respaldo. Las lecturas automáticas no sustituyen la comprobación de compra ni muestran un nuevo estado de carga en cada intervalo.

Primera pasada HTTP sobre la versión pública previa a publicar estas correcciones: diez clientes, una visita por cliente, 60 solicitudes HTML/JSON, cero errores; p50 231 ms, p95 899 ms, máximo 1.112 ms; 1.206.950 bytes descargados. La consulta pública inicial de preparación es adicional. Datos tomados desde un solo equipo; no se ejecutó JavaScript ni se abrieron conexiones Realtime. No equivale a diez clientes humanos navegando ni certifica capacidad sostenida. Las etapas mayores no se ejecutaron.

La herramienta prepara etapas de 10, 25, 50 y 100 clientes HTTP y se detiene entre etapas ante errores o p95 superior a tres segundos. Confirmar cuotas y un entorno equivalente antes de ampliarlas. El monitoreo continuo todavía no está activado.

## Pendientes

Pruebas automatizadas: 166 aprobadas, sin fallos. Dominio y correo corporativo futuros; horario provisional de 08:00 a 20:00 o 22:00, sin confirmar. Inicio por internet sin local abierto al público; identidad y domicilio que correspondan al negocio todavía pendientes. No se publicaron datos provisionales.

Datos comerciales y catálogo definitivos; instalación/publicación y prueba del Libro; escrituras de interfaz contra Supabase descartable, ensayo de recuperación del servicio completo, carga sostenida con navegadores y monitoreo. Pedidos siguen pausados. Ver [el plan y sus condiciones de cierre](plan-preparacion-produccion.md).
