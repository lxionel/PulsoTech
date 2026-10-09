# Preparación de PulsoTech para ventas

Referencia inicial: `090f6c5`, 8 de octubre de 2026. Mantener el diseño aprobado y los datos actuales. No confundir pruebas de código, pruebas de interfaz y verificación del servicio real.

| Etapa | Estado al iniciar la ejecución | Condición para cerrarla |
| --- | --- | --- |
| 1. Referencia y respaldo | Comprobado | Bundle Git verificado; copia cifrada descargada desde el panel y restaurada sin diferencias en una base temporal. |
| 2. Panel administrativo | Interfaz revisada; persistencia HTTP comprobada | Sesión real con MFA; formularios, carga múltiple, orden y eliminación de fotos sin guardar, validaciones de venta y secciones revisados. Crear/editar/eliminar productos y guardar galerías se comprobó por HTTP contra Supabase real temporal. Falta el recorrido de escrituras desde la interfaz. |
| 3. Venta completa | SQL instalado y servicios reales temporales comprobados | Diez grupos de integración con Auth/MFA y PostgREST reales; venta, cupón, stock, reintento y cancelación aprobados. Dos procesos PostgreSQL simultáneos por la última unidad: solo una venta. Las ocho funciones remotas revisadas coinciden. Falta una venta completa desde la interfaz y confirmar atención/entrega; no se enviaron mensajes. |
| 4. Capacidad | Preparación técnica y primera medición | Visitantes sin sockets permanentes; refrescos visibles y agrupados. Primera pasada HTTP: 10 clientes, 60 solicitudes, cero errores. Confirmar plan/cuotas y medir etapas mayores, carga sostenida y navegadores reales con un catálogo representativo. |
| 5. Información comercial | Pendiente del propietario | Responsable, RUC, dirección, correo, horario, entrega, garantía y políticas reales coherentes. |
| 6. Reclamos | Instalación técnica comprobada; activación pendiente | Tabla instalada con RLS y permisos verificados; función `submit-complaint` activa y origen limitado a la web actual. Faltan identidad definitiva, RUC y secreto de Turnstile, y probar recepción, constancia y respuesta antes de habilitar. |
| 7. Catálogo definitivo | Pendiente del propietario | Productos, stock, condiciones, especificaciones y originales fotográficos reales. No sustituir la muestra actual por datos inventados. |
| 8. Recuperación y monitoreo | Recuperación operativa y diagnóstico manual comprobados; seguimiento pendiente | Copia real restaurada en memoria; nueva copia cifrada posterior a instalar reclamos también recuperada sin diferencias. Tablas sintéticas restauradas exactamente en PostgreSQL real, conservando acceso Auth/MFA y numeración de reclamos. Nueve comprobaciones públicas de disponibilidad aprobadas. Falta custodia externa, recuperación de plataforma completa y decidir si se activan comprobaciones periódicas/avisos. |
| 9. Habilitación de ventas | Pendiente | Misma versión revisada en escritorio y móvil, operación confirmada, cuotas suficientes y pendientes críticos anteriores cerrados. Mantener pedidos pausados mientras falten requisitos. |

## Orden de trabajo

El propietario aún no tiene definidos los datos comerciales. Comprará el dominio y preparará un correo corporativo más adelante. El horario considerado es de 08:00 a 20:00 o 22:00, pendiente de confirmar; no debe publicarse como definitivo. Empezará por internet sin local abierto al público: queda por definir el domicilio comercial/fiscal que corresponda al formalizarse, sin inventar una dirección ni anunciar atención presencial.

Confirmó el plan gratuito de PulsoTech. Las pruebas de servicios se ejecutan en el runner temporal de su repositorio público, sin contratar un plan ni crear otro proyecto alojado. Ver [procedimiento, aislamiento y límites](pruebas-supabase-aisladas.md).

1. Conservar código y datos recuperables antes de escribir.
2. Revisar panel autenticado y ensayar operaciones en la copia aislada; corregir y comprobar los hallazgos.
3. Preparar sincronización acotada y herramientas de carga/disponibilidad; confirmar cuotas antes de ampliar las pruebas.
4. Completar datos comerciales y fotografías en paralelo cuando el propietario los entregue.
5. Instalar y validar el Libro en el proyecto correcto. Cloudflare no despliega funciones de Supabase.
6. Ensayar el recorrido real contra un entorno descartable equivalente, incluyendo edición concurrente y varios dispositivos.
7. Publicar la versión candidata, verificarla, activar seguimiento y habilitar ventas cuando se cierren los requisitos.

## Evidencia y límites

- [Resultados de esta ejecución](validacion-operativa-2026-10-08.md).
- [Comparación de funciones y permisos instalados en Supabase](evidencia-supabase-2026-10-08.json): metadatos únicamente; no confirma una venta desde la interfaz.
- [Copia actualizada y restauración aislada después de instalar reclamos](evidencia-respaldo-2026-10-08.json): el archivo privado está fuera del repositorio.
- [Diez grupos de integración contra servicios reales temporales](evidencia-integracion-supabase-2026-10-08.json): Auth/MFA, PostgREST, concurrencia con conexiones independientes y restauración operativa en PostgreSQL aprobados.
- `npm run backup:verify -- <copia> --drill`: recuperación en memoria, sin red.
- `npm run backup:verify -- <copia> --operations`: añade ensayo de ventas en memoria, sin red.
- `npm run capacity:check`: plan HTTP sin ejecutar carga.
- `npm run capacity:check -- --execute --stages 1`: comprobación puntual de disponibilidad; no es un monitor permanente.
- `npm run health:check`: diagnóstico manual con validación de contenido y reintento de fallos; [procedimiento y límites](comprobar-disponibilidad.md). No se ha programado su ejecución.
- `npm run launch:check`: pendientes comerciales, solo lectura.
- `supabase/verify-complaints.sql`: diagnóstico de esquema y permisos del Libro, sin consultar datos de consumidores; ver [instalación](activar-libro-reclamaciones.md).

La prueba embebida ejecuta SQL real y conserva inventario e historial de la copia. PGlite no reproduce Auth, PostgREST, Realtime, Storage, varios servidores PostgreSQL o redes móviles; su ensayo de última unidad no acredita conexiones independientes. La integración posterior sí usó Auth/PostgREST reales y observó dos procesos PostgreSQL simultáneos, pero no prueba Realtime, Storage, navegación visual ni capacidad del proyecto alojado. La restauración temporal conserva esquema y Auth: no equivale a recuperar toda la plataforma tras una pérdida. Una pasada HTTP no certifica usuarios simultáneos ni disponibilidad futura.

No se añadirán modos de prueba a la tienda. Las escrituras de integración se realizan en un entorno descartable, con cuentas y datos sintéticos; no se habilitan pedidos ni se inventan condiciones comerciales públicas para superar controles.
