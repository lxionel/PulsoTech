# Activación del Libro de Reclamaciones

Las políticas y el canal de atención ya tienen el nombre y domicilio autorizados por el propietario y el correo `lioneldavor26@gmail.com`. La tienda todavía no tiene RUC. El formulario del Libro permanece deshabilitado y el pie de página muestra **Atención y reclamos**, para no presentar ese contacto como un libro ya operativo.

## Lo que está preparado en el código

- `/privacidad/`, `/terminos/`, `/garantia-y-entregas/` y `/reclamaciones/`, conservando la paleta y navegación de la tienda.
- Un formulario de hoja de reclamación con identificación, contacto, producto, importe, reclamo/queja, detalle, pedido y representante si el consumidor es menor de edad.
- La función `submit-complaint`, que valida los datos y el tamaño de la solicitud, verifica Turnstile en el servidor (incluidos el hostname y la acción) y guarda el registro en una tabla privada. No devuelve una constancia si el servidor no confirma el guardado.
- Una constancia que el consumidor puede descargar e imprimir. El formulario no envía automáticamente un correo de constancia; la copia se entrega en la pantalla tras el registro. Se debe revisar este procedimiento con el formato y las obligaciones vigentes antes de habilitar el libro.
- **Administrador → Ajustes → Reclamos** para consultar todas las solicitudes por páginas y registrar una respuesta. El botón de correo abre un borrador; el administrador debe enviarlo y conservar la evidencia antes de marcar la solicitud como respondida. No existe envío automático de respuestas.
- Lectura y respuesta privadas con autorización del administrador y doble verificación. Un visitante no puede consultar la tabla ni insertar directamente por la API de la base de datos. La función usa la clave de servicio que Supabase proporciona al entorno del servidor; nunca se incluye en la aplicación web.

## Requisitos antes de habilitarlo

1. Tramitar el RUC, confirmar los datos del proveedor y revisar el formato oficial de la hoja y aviso. Revisar asimismo las obligaciones de datos personales, su conservación y la inscripción del banco de datos que corresponda. Las páginas implementadas no equivalen a una certificación legal.
2. Ejecutar `supabase/activate-complaints.sql` en el SQL Editor del proyecto. Es un script adicional; no es necesario volver a ejecutar el esquema completo.
3. Publicar la Edge Function de `supabase/functions/submit-complaint/index.ts`, con nombre `submit-complaint` y la comprobación JWT de plataforma desactivada como indica `supabase/config.toml`. El endpoint es público y exige verificación CAPTCHA en su propio handler. La desactivación de JWT no debe copiarse a operaciones privadas.
4. En los secretos de **Edge Functions** de Supabase configurar:
   - `TURNSTILE_SECRET_KEY`: Secret key del widget real, pegada únicamente en Supabase.
   - `COMPLAINT_PROVIDER_RUC`: RUC real de once dígitos, comprobado ante SUNAT.
   - `COMPLAINT_ALLOWED_ORIGINS`: orígenes exactos autorizados, separados por comas. En pruebas puede ser `http://localhost:3000`; en producción usar la dirección HTTPS real, sin rutas. Estos deben coincidir con los hostnames permitidos en Turnstile.
   - `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` están disponibles por defecto en el entorno de las funciones; no copiarlos al cliente ni compartirlos por chat.
5. Para probar y luego compilar el cliente, establecer las variables públicas:
   - `NEXT_PUBLIC_STORE_RUC`: el mismo RUC real.
   - `NEXT_PUBLIC_COMPLAINT_BOOK_ENABLED=true` solo cuando todo el circuito esté validado.
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: clave pública del widget autorizado para ese hostname.
   En GitHub Pages se utilizan las Variables de Actions correspondientes y una compilación nueva. Las claves privadas nunca se ponen en esas variables públicas.
6. Comprobar una solicitud de prueba, su constancia, lectura exclusiva desde el administrador y envío manual de la respuesta. Si una respuesta de red es incierta, consultar los registros privados antes de reenviar para evitar duplicados.
7. Organizar el seguimiento de los quince días hábiles y el respaldo/constancia cuando el servicio virtual no esté disponible. Mostrar el aviso y acceso visible exigidos por la normativa; el pie cambia a **Libro de Reclamaciones** al habilitarlo.

Ningún cambio de base de datos ni publicación de la función ha sido ejecutado automáticamente desde esta tarea. El flujo remoto sigue pendiente de instalación y prueba real.

## Fuentes oficiales

- [Libro de Reclamaciones y formato, Indecopi](https://consumidor.gob.pe/libro-de-reclamaciones/).
- [Validación de tokens en servidor, Cloudflare](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).
- [Autorización de Edge Functions, Supabase](https://supabase.com/docs/guides/functions/auth).
- [Secretos de Edge Functions, Supabase](https://supabase.com/docs/guides/functions/secrets).
