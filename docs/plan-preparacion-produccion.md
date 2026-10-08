# Preparación de PulsoTech para ventas

Referencia inicial: `090f6c5`, 8 de octubre de 2026. Mantener el diseño aprobado y los datos actuales. No confundir pruebas de código, pruebas de interfaz y verificación del servicio real.

| Etapa | Estado al iniciar la ejecución | Condición para cerrarla |
| --- | --- | --- |
| 1. Referencia y respaldo | Comprobado | Bundle Git verificado; copia cifrada descargada desde el panel y restaurada sin diferencias en una base temporal. |
| 2. Panel administrativo | Comprobado parcialmente | Sesión real con MFA; formularios, carga múltiple, orden y eliminación de fotos sin guardar, validaciones de venta y secciones revisados. Las escrituras confirmadas de crear/editar/eliminar deben ensayarse en un proyecto descartable de Supabase. |
| 3. Venta completa | Comprobado en base aislada | Diez comprobaciones conectan bolsa, descuentos y transacciones SQL sobre la copia restaurada. Falta recorrer una venta confirmada desde la interfaz contra Supabase descartable y confirmar atención/entrega; no se enviaron mensajes. |
| 4. Capacidad | Preparación técnica y primera medición | Visitantes sin sockets permanentes; refrescos visibles y agrupados. Primera pasada HTTP: 10 clientes, 60 solicitudes, cero errores. Confirmar plan/cuotas y medir etapas mayores, carga sostenida y navegadores reales con un catálogo representativo. |
| 5. Información comercial | Pendiente del propietario | Responsable, RUC, dirección, correo, horario, entrega, garantía y políticas reales coherentes. |
| 6. Reclamos | Pendiente de instalación y configuración | El respaldo indica que la tabla no está instalada; el panel informa indisponibilidad. Instalar el SQL correspondiente, publicar la función actual, completar identidad/secrets y probar recepción, constancia y respuesta antes de habilitar. |
| 7. Catálogo definitivo | Pendiente del propietario | Productos, stock, condiciones, especificaciones y originales fotográficos reales. No sustituir la muestra actual por datos inventados. |
| 8. Recuperación y monitoreo | Recuperación comprobada; seguimiento pendiente | Copia real restaurada en memoria; falta un ensayo en proyecto independiente de Supabase y configurar comprobaciones periódicas/avisos con destino y frecuencia definidos. |
| 9. Habilitación de ventas | Pendiente | Misma versión revisada en escritorio y móvil, operación confirmada, cuotas suficientes y pendientes críticos anteriores cerrados. Mantener pedidos pausados mientras falten requisitos. |

## Orden de trabajo

El propietario aún no tiene definidos los datos comerciales. Comprará el dominio y preparará un correo corporativo más adelante. El horario considerado es de 08:00 a 20:00 o 22:00, pendiente de confirmar; no debe publicarse como definitivo. Empezará por internet sin local abierto al público: queda por definir el domicilio comercial/fiscal que corresponda al formalizarse, sin inventar una dirección ni anunciar atención presencial.

1. Conservar código y datos recuperables antes de escribir.
2. Revisar panel autenticado y ensayar operaciones en la copia aislada; corregir y comprobar los hallazgos.
3. Preparar sincronización acotada y herramientas de carga/disponibilidad; confirmar cuotas antes de ampliar las pruebas.
4. Completar datos comerciales y fotografías en paralelo cuando el propietario los entregue.
5. Instalar y validar el Libro en el proyecto correcto. Cloudflare no despliega funciones de Supabase.
6. Ensayar el recorrido real contra un entorno descartable equivalente, incluyendo edición concurrente y varios dispositivos.
7. Publicar la versión candidata, verificarla, activar seguimiento y habilitar ventas cuando se cierren los requisitos.

## Evidencia y límites

- [Resultados de esta ejecución](validacion-operativa-2026-10-08.md).
- `npm run backup:verify -- <copia> --drill`: recuperación en memoria, sin red.
- `npm run backup:verify -- <copia> --operations`: añade ensayo de ventas en memoria, sin red.
- `npm run capacity:check`: plan HTTP sin ejecutar carga.
- `npm run capacity:check -- --execute --stages 1`: comprobación puntual de disponibilidad; no es un monitor permanente.
- `npm run launch:check`: pendientes comerciales, solo lectura.
- `supabase/verify-complaints.sql`: diagnóstico de esquema y permisos del Libro, sin consultar datos de consumidores; ver [instalación](activar-libro-reclamaciones.md).

La prueba embebida ejecuta SQL real y conserva inventario e historial de la copia. PGlite no reproduce el servicio completo de Auth, PostgREST, Realtime, Storage, varios servidores PostgreSQL o redes móviles. Las dos solicitudes por la última unidad no demuestran concurrencia entre conexiones PostgreSQL independientes. Una pasada HTTP no certifica usuarios simultáneos ni disponibilidad futura.

No se añadirán modos de prueba a la tienda. Las pruebas que requieran escrituras completas se realizarán en un entorno descartable; no se habilitarán pedidos ni se inventarán condiciones para superar controles.
