# Capacidad y consumo

## Comprobado el 8 de octubre de 2026

| Entorno | Ejercicio | Resultado |
| --- | --- | --- |
| Supabase temporal en GitHub | Cinco rondas de 25 visitas paralelas; cada visita lee catálogo y versión comercial. | 250 consultas, cero errores; p95 de visita 74 ms, máximo 75 ms. [Ejecución](https://github.com/lxionel/PulsoTech/actions/runs/37871467220). |
| Tienda publicada | 25 clientes HTTP, una pasada por cliente sobre seis recursos públicos. | 150 solicitudes, cero errores; p50 305 ms, p95 781 ms, máximo 807 ms; 3.017.375 bytes en total. [Informe](evidencia-capacidad-25-2026-10-08.json). |

La consulta inicial de preparación es adicional a las 150 solicitudes medidas. La primera prueba utilizó un producto sintético y el hardware del runner, sin contactar proyectos alojados. La segunda utilizó el catálogo público actual, con un producto de muestra, desde una sola ubicación. Son mediciones distintas: los tiempos locales del contenedor no pronostican los de Supabase alojado.

Se completó la prueba temporal antes de ampliar la pasada pública de diez a 25 clientes. La pasada pública fue acotada, de lectura y sin imágenes originales, sesiones, compras o mensajes. No se ejecutaron etapas de 50 ni 100 clientes ni una carga sostenida.

## Qué significa para la tienda

Estas pasadas muestran que el sistema respondió correctamente bajo esas condiciones. No fijan un máximo de clientes ni certifican 25 personas navegando en celulares: no ejecutan JavaScript, apertura de galerías, navegación larga o pedidos. La coincidencia temporal entre lecturas tampoco equivale a 25 conexiones PostgreSQL independientes; esa propiedad se observó por separado en la carrera de dos ventas por la última unidad.

Cloudflare sirve las páginas y las fotografías generadas. Supabase atiende las consultas públicas y operaciones del panel. El catálogo de visitantes no abre conexiones Realtime permanentes; se refresca con pestaña visible. Al aumentar productos y fotos, medir otra vez: las imágenes externas o la recuperación de originales después de editar un producto pueden cambiar el consumo.

## Cuotas y seguimiento

El propietario confirmó el plan gratuito de PulsoTech. La documentación actual de Supabase indica **5 GB de salida sin caché y 5 GB con caché**, contabilizados por separado por ciclo. Incluyen servicios de la plataforma, no solo visitas a la tienda. [Cuotas y consulta de consumo](https://supabase.com/docs/guides/platform/manage-your-usage/egress).

No se verificó el saldo consumido de la cuenta en este ensayo. Los 3 MB de la pasada pública incluyen páginas de Cloudflare: no representan por sí solos la salida facturada por Supabase. Antes de ampliar cargas o lanzar campañas, revisar en el proveedor el uso real, tamaño de base de datos, almacenamiento y límites aplicables. No cambiar a un plan de pago sin decisión del propietario.

Una pasada habitual de `health:check`, con ficha e imagen de muestra disponibles, hace nueve consultas públicas, de las cuales dos van a Supabase. Las cuatro revisiones diarias programadas suponen ocho consultas de Supabase, además de reintentos, ejecuciones manuales y revisiones por cambios de código. El monitor comprueba disponibilidad; no ejecuta esta prueba de 25 clientes cada seis horas.

Para cerrar capacidad antes de vender: cargar un catálogo representativo, confirmar consumo disponible, medir navegación real desde escritorio y móvil, realizar carga sostenida en un entorno equivalente y ampliar las etapas solo cuando los resultados y cuotas lo permitan. Mantener tiempos, errores y consumo como evidencia; no interpretar una pasada correcta como disponibilidad futura garantizada.
