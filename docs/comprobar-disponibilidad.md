# Comprobación de disponibilidad

Desde la carpeta del proyecto, con Node.js 22.6 o posterior y las dependencias instaladas:

```powershell
npm run health:check
```

Ejecuta una comprobación en ese momento y termina. También se puede pedir en este chat que se ejecute.

## Seguimiento programado en GitHub

El workflow **Check public storefront availability** ejecuta el mismo diagnóstico cada seis horas: **00:17, 06:17, 12:17 y 18:17, hora de Lima**. También permite ejecución manual desde Actions y se comprueba al cambiar sus archivos. La programación usa UTC; GitHub puede retrasar ejecuciones. No depende del equipo del propietario ni utiliza IA o tokens de Codex.

Usa un runner estándar `ubuntu-24.04`, dura como máximo cinco minutos y se omite si el repositorio pasa a privado. No utiliza secretos administrativos, sube artefactos ni conserva cachés. No modifica la tienda ni intenta repararla. El resumen muestra los recursos, errores e intentos; si falla la instalación o el diagnóstico, la ejecución también queda fallida. Una interrupción de GitHub o del acceso desde su runner puede causar el fallo: investigar antes de atribuirlo a la tienda.

En la cuenta del propietario se verificó **Actions → Notify me: on GitHub, Email (Failed workflows only)**. Los avisos se envían conforme a esa preferencia y al usuario asociado a la ejecución programada. No se provocó una caída ni se confirmó entrega de un correo de prueba. Los avisos básicos no suprimen incidentes repetidos mediante un estado propio ni envían un aviso específico de recuperación. El éxito posterior puede consultarse en Actions.

La [primera ejecución](https://github.com/lxionel/PulsoTech/actions/runs/37871467334), disparada al publicar el workflow y asociada a `lxionel`, aprobó los nueve recursos sin reintentos. GitHub confirmó el workflow en estado `active`; la ejecución por horario comenzará en el siguiente intervalo disponible.

Tras actualizar las acciones oficiales y fijar el runner, la [segunda ejecución](https://github.com/lxionel/PulsoTech/actions/runs/37871736660) aprobó otra vez los nueve recursos, sin reintentos ni advertencias de runtime antiguo. Estas comprobaciones iniciales se dispararon al publicar código; no se ha esperado una ejecución por horario ni verificado la recepción de correo.

Para pausar: Actions → Check public storefront availability → menú del workflow → Disable workflow. Para revisar manualmente: Run workflow. GitHub desactiva programaciones en repositorios públicos tras 60 días sin actividad; comprobar que siga activo antes de abrir ventas. Una revisión cada seis horas puede omitir interrupciones breves entre ejecuciones.

Referencias: [programación y límites](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule), [avisos por correo](https://docs.github.com/en/subscriptions-and-notifications/how-tos/managing-github-actions-notifications), [condiciones de ejecución gratuita](https://docs.github.com/en/billing/concepts/product-billing/github-actions).

## Qué revisa

- Inicio, catálogo, bolsa, favoritos y la ficha HTML de un producto público, cuando existe.
- Consulta pública acotada de productos y versión del esquema comercial.
- Formato y origen del manifiesto de galerías, y una muestra de imagen local cuando está disponible.

Requiere estado HTTP correcto, tipo de contenido esperado y contenido válido. Un `200` con JSON incorrecto, campos de catálogo inválidos o bytes que no corresponden a una imagen no pasa. Las páginas deben contener HTML y el título de PulsoTech. Las respuestas tienen límite de tamaño y tiempo; un recurso que falla se intenta una segunda vez. Los recursos correctos no se repiten.

El resultado contiene únicamente nombres de recursos, estados, intentos y tiempos. Código de salida `0`: todas las comprobaciones pasaron; `1`: algún recurso falló dos veces o la herramienta no pudo completar el diagnóstico. Un error de red desde este equipo también puede ser local: no confirma por sí solo una caída mundial. Si falla, comprobar conexión, repetir desde otra red y revisar el proveedor antes de cambiar la tienda.

Los pedidos pausados, un catálogo vacío y los datos comerciales todavía incompletos no se consideran una caída. `launch:check` revisa esos pendientes de apertura por separado.

Solo hace solicitudes GET públicas. No inicia sesión, consulta clientes o ventas, registra pedidos ni envía WhatsApp o reclamos. La clave pública solo se envía a Supabase; no se siguen redirecciones. El muestreo no consulta imágenes externas ni comprueba todas las fotos.

Para conservar un informe con nombre nuevo:

```powershell
npm run health:check -- --report "D:\ruta\salud-tienda.json"
```

La herramienta no sobrescribe informes existentes. `--target https://dominio/` permite comprobar otro origen HTTPS después de cambiar el dominio; se utiliza el proyecto Supabase configurado en las variables públicas o, en su ausencia, el predeterminado del código. No se admiten claves privadas.

## Alcance y resultado registrado

La pasada del 8 de octubre de 2026, 20:24 hora de Lima, aprobó nueve recursos sin reintentos. [Informe público sin datos de productos ni claves](evidencia-disponibilidad-2026-10-08.json).

Esto comprueba respuestas HTTP desde una ubicación. No ejecuta JavaScript, prueba sesiones o compras, valida el aspecto visual ni acredita capacidad sostenida o disponibilidad futura. Para esos puntos se mantienen los ensayos de interfaz, integración y carga del [plan de preparación](plan-preparacion-produccion.md).
