# Comprobación de disponibilidad

Desde la carpeta del proyecto, con Node.js 22.6 o posterior y las dependencias instaladas:

```powershell
npm run health:check
```

Ejecuta una comprobación en ese momento y termina. No instala tareas automáticas ni mantiene un proceso abierto. También se puede pedir en este chat que se ejecute. La frecuencia de una eventual tarea automática sigue pendiente de elegir; no hay avisos automáticos activados.

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
