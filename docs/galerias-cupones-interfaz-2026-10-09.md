# Galerías y cupones desde la interfaz — 9 de octubre de 2026

Continuación de la validación operativa autorizada por el propietario. Se usa el panel publicado con sesión administrativa real y un producto nuevo oculto; el producto `534777`, sus cuatro unidades y la venta histórica se conservan. No se habilitan pedidos ni se envían mensajes.

## Galerías guardadas

Producto temporal `202201`, «Verificación de galerías 2026-10-09», oculto, precio S/ 1 y stock cero. Se usaron archivos ya presentes en la compilación local y el banner del repositorio, sin fotos privadas nuevas ni mercancía ficticia publicada.

- El selector permite varias fotos: Negro recibió dos; Blanco una; la galería general dos.
- Se movió la segunda foto de Negro al primer lugar antes del guardado.
- Guardar, recargar el panel y editar de nuevo conserva cantidades y orden. Las dimensiones, longitud de la fuente y huella de cada imagen DOM coinciden con las previas al guardado.
- La fotografía grande conserva 2400 × 1340 px. Las imágenes pequeñas de muestra conservan sus dimensiones y muestran el aviso de baja resolución; no se afirma que un archivo pequeño haya ganado detalle.
- Con autorización específica se retiró la segunda foto de Negro y la segunda foto general, y se guardó. Después de recargar y editar, cada una de las tres galerías contiene una foto; las fuentes completas de las fotografías restantes son idénticas a las primeras antes de esa retirada. La galería Blanca no cambió.
- Este guardado usa imágenes embebidas en los datos del producto. No ensaya un bucket de Storage ni su recuperación.

## Cupones

Cupón temporal `VERIF0910P`: 10%, mínimo S/ 150. Guardado desde el panel, reconocido en una bolsa pública de otra pestaña. Una unidad de S/ 100 no supera el mínimo; dos unidades calculan subtotal S/ 200, descuento S/ 20 y total S/ 180.

Pausar en el panel cambia su estado a inactivo. Después de recargar la bolsa, aplicar el código devuelve «Este cupón ya no está activo». Una bolsa ya abierta conserva la lectura anterior hasta volver a consultar; la comprobación final del pedido revalida cupones remotos según el código, pero no se ejecutó ese envío porque los pedidos siguen pausados. Crear el mismo código nuevamente muestra «Ya existe un cupón con este código» sin añadir un registro.

Se encontró una restricción incorrecta del formulario: descuento fijo S/ 5.50 genera `stepMismatch` porque el control no declara céntimos; el mínimo avanzaba de cinco en cinco. Cambio `4f4bb2b`: descuento y mínimo admiten pasos de 0.01, máximo de 100 para porcentaje, código de hasta 40 caracteres. Lint, cinco pruebas existentes relacionadas, compilación local, [validación de GitHub](https://github.com/lxionel/PulsoTech/actions/runs/37887829493) y Cloudflare aprobados. La interfaz publicada guarda el cupón `VERIF09550`, fijo S/ 5.50 y mínimo S/ 149.95: una unidad no supera el mínimo y dos calculan S/ 194.50. Ambos controles aceptan céntimos; 101% presenta `rangeOverflow` y no se guarda.

Se detectó además que cambiar cupones en la pestaña administrativa reescribía la copia de la bolsa con sus cantidades antiguas. Se separó el guardado de la bolsa del guardado de cupones y contacto (`7daf53f`); el icono de un cupón fijo muestra moneda en lugar de porcentaje. Lint, ocho pruebas existentes relacionadas, compilación local, [validación de GitHub](https://github.com/lxionel/PulsoTech/actions/runs/37888016567) y publicación en Cloudflare aprobados. Verificación publicada: administrador conserva una bolsa antigua de una unidad, la pestaña pública la aumenta a dos, se activa un cupón desde el panel y se recarga la bolsa pública; conserva sus dos unidades y calcula S/ 194.50 al aplicar el cupón fijo. Ambos cupones se pausaron después.

## Alcance pendiente

El propietario confirmó retirar las dos fotos indicadas y eliminar el producto `202201` y los dos cupones temporales. La interfaz confirmó la limpieza: un producto con cuatro unidades, una venta histórica y cero cupones. La bolsa partió de una unidad Blanca del producto actual y se devolvió a esa cantidad y sin cupón. No se registran ventas nuevas en esta etapa.

La limpieza detectó que eliminar el producto conservaba su estado de edición en el menú. Se limpian la identidad y la referencia de edición después de confirmar la eliminación del producto que estaba abierto; se aplica a controles de escritorio y móvil. Este ajuste no requiere ni ejecuta una nueva eliminación de datos existentes.

Evidencia privada fuera del repositorio, en `D:/Mis_Proyectos/PulsoTech/respaldos-locales/`: `2026-10-09-galerias-guardadas.jpg`, `2026-10-09-galerias-retirada-verificada.jpg`, `2026-10-09-cupon-fijo-aplicado.jpg` y `2026-10-09-cupones-verificados.jpg`. No se publican fotografías embebidas ni datos privados de clientes en estos documentos.
